import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js"; 

export const handleGithubWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  // 1. Instantly return 200 OK for GitHub's initial ping test
  if (event === "ping") {
    return res.status(200).send("Pong! Webhook connected successfully.");
  }

  // Acknowledge all other events immediately to prevent GitHub timeouts
  if (!res.headersSent) {
    res.status(200).send("Webhook received");
  }

  // 2. Process issues...
  try {
    if (event !== "issues") return;

    if (!payload || !payload.issue || !payload.repository) {
      console.log("[Webhook Warning] Missing issue or repository payload");
      return;
    }

    const issueNumber = payload.issue.number;
    const repoFullName = payload.repository.full_name; // e.g. "AshuNewatia/SoC"
    
    // Find all workspaces where githubRepo ends with or contains "AshuNewatia/SoC"
    const workspaces = await Workspace.find({ 
      githubRepo: { $regex: repoFullName.replace('/', '\\/'), $options: "i" } 
    });

    if (!workspaces || workspaces.length === 0) {
      console.log(`[Webhook Warning] No workspaces found matching repo: ${repoFullName}`);
      return;
    }

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

          // Resolve creatorId safely
          let creatorId = workspace.owner;
          if (creatorId && typeof creatorId === "object" && creatorId._id) {
            creatorId = creatorId._id;
          }

          if (!creatorId) {
            const fallbackUser = await User.findOne();
            creatorId = fallbackUser ? fallbackUser._id : null;
          }

          if (!creatorId) {
            console.error(`[Webhook Error] Cannot create task for Workspace ${workspace._id}: No valid User found for 'createdBy'.`);
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