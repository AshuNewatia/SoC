import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import Notification from "../models/Notification.js";

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
      readBy: [createdBy]
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

    // 1. Send global room workspace update (your existing logic)
    io.to(existingTask.workspace.toString()).emit(
      "commentCreated",
      {
        taskId: existingTask._id.toString(),
      }
    );

    if (mentions && mentions.length > 0) {
      const targetUserIds = mentions;

      for (const recipientId of targetUserIds) {

        const notification = new Notification({
          recipient: recipientId,
          sender: createdBy,
          type: "COMMENT_MENTION",
          message: `${newComment.createdBy.name} mentioned you in a comment: "${comment.trim().substring(0, 35)}..."`,
          link: `/workspaces/${existingTask.workspace}/tasks/${taskId}`,
          isRead: false
        });
        await notification.save();

        // Emit targeted live updates directly to the user's private socket room
        io.to(recipientId.toString()).emit("newNotification", notification);
      }
    }

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
      currentUserId: req.user._id,
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

    // ✅ FIX 1 & 2: Fetch comment first, then task
    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    // Get task from the comment
    const task = await Task.findById(existingComment.task);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user is the author
    if (existingComment.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only edit your own comment",
      });
    }

    // ✅ FIX 8: Move io declaration to the top
    const io = req.app.get("io");

    // ✅ FIX 3: Use .length instead of .size()
    // ✅ FIX 4: Compare arrays, not just lengths
    const oldMentionIds = existingComment.mentions.map((id) => id.toString());
    const newMentionIds = mentions.map((id) => id.toString());

    // Find only newly added users
    const addedMentions = newMentionIds.filter(
      (id) => !oldMentionIds.includes(id)
    );

    // Populate author before sending notifications
    await existingComment.populate("createdBy", "name email avatar");

    // ✅ Send notifications for newly added mentions only
    if (addedMentions.length > 0) {
      for (const recipientId of addedMentions) {
        // Skip notifying yourself
        if (recipientId.toString() === userId.toString()) continue;

        // ✅ FIX 5, 6, 7: Use createAndSendNotification with correct data
        await createAndSendNotification(req, {
          recipient: recipientId,
          sender: userId,
          type: "COMMENT_MENTION",
          message: `${existingComment.createdBy.name} mentioned you in a comment: "${comment.trim().substring(0, 35)}..."`,
          workspace: task.workspace,
          relatedId: existingComment._id,
          relatedModel: "Comment",
        });
      }
    }

    // Update comment
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

    io.to(task.workspace.toString()).emit("commentUpdated", {
      taskId: task._id.toString(),
    });

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

export const markCommentsAsRead = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id || req.user.id;

    await Comment.updateMany(
      {
        task: taskId,
        readBy: {
          $nin: [userId]
        }
      },
      {
        $addToSet: {
          readBy: userId
        }
      }
    );
    return res.status(200).json({
      message: "Comments marked as read"
    });
  } catch (err) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      message: "Failed to update comment",
    });
  }
}
