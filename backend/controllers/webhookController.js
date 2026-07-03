import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";

export const handleGithubWebhook = async (req, res) => {
  res.status(200).send("Webhook received");

  const event = req.headers["x-github-event"];
  const payload = req.body;

  try {
      if (event === "issues") {
      const issueNumber = payload.issue.number;
      const repoFullName = payload.repository.full_name;
      
      const workspace = await Workspace.findOne({ githubRepo: repoFullName });
      if (!workspace) return;

      const task = await Task.findOne({ 
        workspace: workspace._id, 
        githubIssueNumber: issueNumber 
      });
      if (!task) return;
      if (payload.action === "closed") {
        task.status = "Done";
      } else if (payload.action === "reopened") {
        task.status = "In Progress";
      } else {
        return;
      }

      await task.save();
      const io = req.app.get("io");
      if (io) {
        io.emit("taskUpdated", task);
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};