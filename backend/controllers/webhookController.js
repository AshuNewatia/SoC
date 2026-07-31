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
    
    // Find all workspaces matching the repo name (case-insensitive search recommended)
    const workspaces = await Workspace.find({ 
      githubRepo: { $regex: new RegExp(`^${repoFullName}$`, "i") } 
    });

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

          // Check for duplicate task first
          const existingTask = await Task.findOne({
            workspace: workspace._id,
            githubIssueNumber: Number(issueNumber),
          });

          if (existingTask) {
            console.log(`[Webhook] Task already exists for issue #${issueNumber} in workspace ${workspace._id}`);
            continue;
          }

          let creatorId = workspace.owner;
          if (creatorId && creatorId._id) creatorId = creatorId._id; 
          if (!creatorId) creatorId = fallbackId; 

          if (!creatorId) {
            console.error(`[Webhook Error] Skipping workspace ${workspace._id}: No valid User exists for createdBy.`);
            continue;
          }

          const newTask = await Task.create({
            title: payload.issue.title,
            description: payload.issue.body || "",
            status: "todo", // Make sure this matches your frontend column key/enum!
            priority: "Medium",
            workspace: workspace._id,
            githubIssueNumber: Number(issueNumber),
            createdBy: creatorId 
          });

          console.log(`[Webhook] Success: Created task for Workspace ${workspace._id}`);

          if (io) {
            // Broadcast to all sockets OR workspace room
            io.emit("taskCreated", newTask);
            io.to(workspace._id.toString()).emit("taskCreated", newTask);
          }
        } 
        
        else if (payload.action === "closed" || payload.action === "reopened") {
          const task = await Task.findOne({ 
            workspace: workspace._id, 
            githubIssueNumber: Number(issueNumber)
          });

          if (task) {
            task.status = payload.action === "closed" ? "completed" : "todo";
            await task.save();
            console.log(`[Webhook] Success: Updated task status to "${task.status}"`);

            if (io) {
              io.emit("taskUpdated", task);
              io.to(workspace._id.toString()).emit("taskUpdated", task);
            }
          }
        }

      } catch (workspaceError) {
        console.error(`[Webhook Workspace Loop Error] Workspace ID ${workspace._id}:`, workspaceError.message);
      }
    }
  } catch (error) {
    console.error("Global Webhook Controller Error:", error);
  }
};