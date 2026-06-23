export const isOwner = (workspace, userId) =>
  workspace.owner.toString() === userId.toString();

export const isAdmin = (workspace, userId) =>
  workspace.admins.some(
    admin => admin.toString() === userId.toString()
  );

export const canManageWorkspace = (workspace, userId) =>
  isOwner(workspace, userId) ||
  isAdmin(workspace, userId);