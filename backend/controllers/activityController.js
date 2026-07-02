import ActivityLog from "../models/ActivityLog.js";

export const getWorkspaceActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const activities = await ActivityLog.find({ workspaceId: id })
      .populate("userId", "name email avatar")
      .populate("workspaceId", "name") 
      .sort({ createdAt: -1 }) 
      .limit(50); 

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Failed to load activity feed" });
  }
};

export const logActivity = async (workspaceId, userId, actionType, description) => {
  try {
    const newActivity = await ActivityLog.create({
      workspaceId,
      userId,
      actionType,
      description,
    });
    
    return newActivity;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}; 