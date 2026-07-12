import Workspace from "../models/Workspace.js";

export const getTaskFilter = async (user) => {
  if (user.role === "student") {
    return {
      assignedTo: user._id,
    };
  }

  const workspaces = await Workspace.find({
    $or: [
      { owner: user._id },
      { admins: user._id },
      { members: user._id },
    ],
  }).select("_id");

  return {
    workspace: {
      $in: workspaces.map((w) => w._id),
    },
  };
};