import ActivityLog from "../models/ActivityLog.js";

// @desc    Get all activities for a specific workspace
// @route   GET /api/workspaces/:id/activity
export const getWorkspaceActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await ActivityLog.find({ workspaceId: id })
      .populate("userId", "name email avatar") // Populate the user who did the action
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit to the 50 most recent events to keep it fast

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Failed to load activity feed" });
  }
};

// Utility function to be imported and used inside other controllers
export const logActivity = async (workspaceId, userId, actionType, description) => {
  try {
    const newActivity = await ActivityLog.create({
      workspaceId,
      userId,
      actionType,
      description,
    });
    
    // Once you have Socket.io fully wired in the backend, you can emit this to the room here:
    // io.to(workspaceId.toString()).emit("new_activity", populatedActivity);
    
    return newActivity;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};