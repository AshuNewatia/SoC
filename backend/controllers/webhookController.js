import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";

export const handleGithubWebhook = async (req, res) => {
  // GitHub requires a 200 OK response immediately
  res.status(200).send("Webhook received");

  const event = req.headers["x-github-event"];
  const payload = req.body;

  try {
    // Only listen for issue events
    if (event === "issues") {
      const issueNumber = payload.issue.number;
      const repoFullName = payload.repository.full_name; // e.g., "AshuNewatia/CampusFlow"
      
      // Find which workspace owns this repository
      const workspace = await Workspace.findOne({ githubRepo: repoFullName });
      if (!workspace) return;

      // Find the task linked to this issue
      const task = await Task.findOne({ 
        workspaceId: workspace._id, 
        githubIssueNumber: issueNumber 
      });
      if (!task) return;

      // Update CampusFlow DB based on GitHub action
      if (payload.action === "closed") {
        task.status = "Done";
        await task.save();
        // Here you would also emit a Socket.io event to update the UI instantly!
      } else if (payload.action === "reopened") {
        task.status = "In Progress";
        await task.save();
        if (task) {
    const io = req.app.get("io"); // Get the radio tower
    if (io) {
        io.emit("taskUpdated", task); // Broadcast to all users
    }
}
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};