import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js"; 

export const handleGithubWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  if (!res.headersSent) {
    res.status(200).send("Webhook processed");
  }

  try {
    if (event !== "issues") return;

    const issueNumber = payload.issue.number;
    const repoFullName = payload.repository.full_name;
    
    const workspaces = await Workspace.find({ githubRepo: repoFullName });
    if (!workspaces || workspaces.length === 0) {
      console.log(`[Webhook Warning] No workspaces found matching repo: ${repoFullName}`);
      return;
    }

    const adminFallback = await User.findOne();
    const fallbackId = adminFallback ? adminFallback._id : null;

    const io = req.app.get("io");

    for (const workspace of workspaces) {
      try {
        if (payload.action === "opened") {

          let creatorId = workspace.owner;
          if (creatorId && creatorId._id) creatorId = creatorId._id; 
          if (!creatorId) creatorId = fallbackId; 

          if (!creatorId) {
            console.error(`[Webhook Error] Skipping workspace ${workspace._id} because no valid User exists in the database to satisfy createdBy.`);
            continue;
          }

          const newTask = await Task.create({
            title: payload.issue.title,
            description: payload.issue.body || "",
            status: "todo",
            priority: "Medium",
            workspace: workspace._id,
            githubIssueNumber: Number(issueNumber),
            createdBy: creatorId 
          });

          console.log(`[Webhook] Success: Created task for Workspace ${workspace._id}`);

          if (io) {
            io.emit("taskCreated", newTask);
          }
        } 
        
        else if (payload.action === "closed" || payload.action === "reopened") {
          const task = await Task.findOne({ 
            workspace: workspace._id, 
            githubIssueNumber: Number(issueNumber)
          });

          if (task) {
            task.status = payload.action === "closed" ? "completed" : "progress";
            await task.save();
            console.log(`[Webhook] Success: Updated task status to "${task.status}"`);

            if (io) {
              io.emit("taskUpdated", task);
            }
          }
        }

      } catch (workspaceError) {
        console.error(`[Webhook Workspace Loop Error] for Workspace ID ${workspace._id}:`, workspaceError.message);
      }
    }
  } catch (error) {
    console.error("Global Webhook Controller Error:", error);
  }
};