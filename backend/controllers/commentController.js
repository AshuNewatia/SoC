import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";

export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { comment, mentions = [] } = req.body;
    const createdBy = req.user._id || req.user.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({
        message: "task not found!",
      });
    }

    const existingWorkspace = await Workspace.findById(existingTask.workspace);
    if (!existingWorkspace) {
      return res.status(404).json({
        message: "task not found!",
      });
    }

    const isOwner =
      existingWorkspace.owner.toString() === createdBy.toString();

    const isAdmin = existingWorkspace.admins.some(
      (adminId) => adminId.toString() === createdBy.toString()
    );

    const isMember = existingWorkspace.members.some(
      (memberId) => memberId.toString() === createdBy.toString()
    );

    if (!isOwner && !isAdmin && !isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const newComment = new Comment({
      task: taskId,
      createdBy,
      comment: comment.trim(),
      mentions,
    });

    await newComment.save();

    await newComment.populate([
      {
        path: "createdBy",
        select: "name email avatar",
      },
      {
        path: "mentions",
        select: "name email avatar",
      },
    ]);

    const io = req.app.get("io");

    io.to(existingTask.workspace.toString()).emit(
      "commentCreated",
      {
        taskId: existingTask._id.toString(),
      }
    );

    return res.status(201).json({
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      message: "Failed to create comment",
    });
  }
};


export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id || req.user.id;

    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const existingWorkspace = await Workspace.findById(
      existingTask.workspace
    );

    if (!existingWorkspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isOwner =
      existingWorkspace.owner.toString() === userId.toString();

    const isAdmin = existingWorkspace.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );

    const isMember = existingWorkspace.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isOwner && !isAdmin && !isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const comments = await Comment.find({
      task: taskId,
    })
      .populate("createdBy", "name email avatar")
      .populate("mentions", "name email avatar")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get task comments error:", error);

    return res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
};

export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment, mentions = [] } = req.body;
    const userId = req.user._id || req.user.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const task = await Task.findById(existingComment.task);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (existingComment.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own comment",
      });
    }

    existingComment.comment = comment.trim();
    existingComment.mentions = mentions;
    existingComment.isEdited = true;

    await existingComment.save();

    await existingComment.populate([
      {
        path: "createdBy",
        select: "name email avatar",
      },
      {
        path: "mentions",
        select: "name email avatar",
      },
    ]);

    const io = req.app.get("io");

    io.to(task.workspace.toString()).emit(
      "commentUpdated",
      {
        taskId: task._id.toString(),
      }
    );

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: existingComment,
    });
  } catch (error) {
    console.error("Edit comment error:", error);

    return res.status(500).json({
      message: "Failed to edit comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;

    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const task = await Task.findById(existingComment.task);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const workspaceId = task.workspace.toString();
    const workspace = await Workspace.findById(task.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isAuthor =
      existingComment.createdBy.toString() ===
      userId.toString();

    const isOwner =
      workspace.owner.toString() ===
      userId.toString();

    const isAdmin = workspace.admins.some(
      (adminId) =>
        adminId.toString() === userId.toString()
    );

    if (!isAuthor && !isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You do not have permission to delete this comment",
      });
    }

    await existingComment.deleteOne();

    const io = req.app.get("io");

    io.to(workspaceId).emit(
      "commentDeleted",
      {
        taskId: task._id.toString(),
      }
    );

    return res.status(200).json({
      message: "Comment deleted successfully",
      commentId,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      message: "Failed to delete comment",
    });
  }
};