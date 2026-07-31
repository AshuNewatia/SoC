import Task from "../models/Task.js";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js"; 

export const handleGithubWebhook = async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`\n================ WEBHOOK INCOMING ================`);
  console.log(`[DEBUG] Received Header x-github-event: "${event}"`);

  // 1. Instantly return 200 OK for GitHub's initial ping test
  if (event === "ping") {
    console.log(`[DEBUG] Ping event received. Responding with 200 OK.`);
    return res.status(200).send("Pong! Webhook connected successfully.");
  }

  // Acknowledge all other events immediately to prevent GitHub timeouts
  if (!res.headersSent) {
    res.status(200).send("Webhook received");
  }

  // 2. Process issues...
  try {
    if (event !== "issues") {
      console.log(`[DEBUG] Event is "${event}" (not "issues"). Exiting.`);
      return;
    }

    if (!payload || !payload.issue || !payload.repository) {
      console.log("[DEBUG WARNING] Missing issue or repository payload structure.");
      return;
    }

    const issueNumber = payload.issue.number;
    const repoFullName = payload.repository.full_name; // e.g. "AshuNewatia/SoC"
    const action = payload.action;

    console.log(`[DEBUG] Action: "${action}" | Issue #${issueNumber} | Repo: "${repoFullName}"`);

    // Flexible regex search for matching workspace
    const searchRegex = repoFullName.replace('/', '\\/');
    console.log(`[DEBUG] Searching DB for Workspaces with githubRepo matching regex: /${searchRegex}/i`);

    const workspaces = await Workspace.find({ 
      githubRepo: { $regex: searchRegex, $options: "i" } 
    });

    console.log(`[DEBUG] Workspaces matching in DB: ${workspaces.length}`);

    if (!workspaces || workspaces.length === 0) {
      console.log(`[DEBUG WARNING] No workspace found where githubRepo matches "${repoFullName}". Check Workspace Settings in Mongo!`);
      return;
    }

    const io = req.app.get("io");
    if (!io) {
      console.log(`[DEBUG WARNING] Socket.io instance ("io") is NOT attached to req.app!`);
    }

    for (const workspace of workspaces) {
      console.log(`--- Processing Workspace ID: ${workspace._id} ---`);
      try {
        if (action === "opened") {

          // Check for duplicate task first
          const existingTask = await Task.findOne({
            workspace: workspace._id,
            githubIssueNumber: Number(issueNumber),
          });

          if (existingTask) {
            console.log(`[DEBUG] Task already exists in DB for Issue #${issueNumber} in Workspace ${workspace._id}. Task ID: ${existingTask._id}`);
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
            console.log(`[DEBUG] Workspace owner missing. Fallback User ID resolved: ${creatorId}`);
          }

          if (!creatorId) {
            console.error(`[DEBUG ERROR] Cannot create task for Workspace ${workspace._id}: No valid User found for 'createdBy'.`);
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

          console.log(`[DEBUG SUCCESS] 🎉 Created Task ID: ${newTask._id} for Workspace: ${workspace._id}`);

          if (io) {
            io.emit("taskCreated", newTask);
            io.to(workspace._id.toString()).emit("taskCreated", newTask);
            console.log(`[DEBUG SOCKET] Emitted "taskCreated" for Task ID: ${newTask._id}`);
          }
        } 
        
        else if (action === "closed" || action === "reopened") {
          const task = await Task.findOne({ 
            workspace: workspace._id, 
            githubIssueNumber: Number(issueNumber)
          });

          if (task) {
            task.status = action === "closed" ? "completed" : "todo";
            await task.save();
            console.log(`[DEBUG SUCCESS] Updated task status to "${task.status}" for Task ID: ${task._id}`);

            if (io) {
              io.emit("taskUpdated", task);
              io.to(workspace._id.toString()).emit("taskUpdated", task);
              console.log(`[DEBUG SOCKET] Emitted "taskUpdated" for Task ID: ${task._id}`);
            }
          } else {
            console.log(`[DEBUG WARNING] Could not find Task for Issue #${issueNumber} to update action "${action}"`);
          }
        } else {
          console.log(`[DEBUG] Ignored issue action: "${action}"`);
        }

      } catch (workspaceError) {
        console.error(`[DEBUG WORKSPACE LOOP ERROR] Workspace ID ${workspace._id}:`, workspaceError.message);
      }
    }
  } catch (error) {
    console.error("[DEBUG GLOBAL ERROR]:", error);
  }
};