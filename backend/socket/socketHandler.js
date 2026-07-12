export const initializeSocket = (io) => {
  const workspaceStreams = new Map();
  const socketToWorkspace = new Map();
  const socketToUser = new Map();

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    socket.on("userJoined", (user) => {
      const { workspaceId } = user;
      const { userId } = user;
      if (!workspaceId) return;

      socket.join(workspaceId);
      socketToUser.set(socket.id, userId);
      socketToWorkspace.set(socket.id, workspaceId);

      if (!workspaceStreams.has(workspaceId)) {
        workspaceStreams.set(workspaceId, new Map());
      }
      const workspace = workspaceStreams.get(workspaceId);

      if (!workspace.has(userId)) {
        workspace.set(userId, {
          user,
          sockets: new Set(),
        });
      }

      workspace.get(userId).sockets.add(socket.id);

      const workspaceUsers = Array.from(workspaceStreams.get(workspaceId).values()).map(entry => entry.user);
      io.to(workspaceId).emit("onlineUsers", workspaceUsers);
    });

    socket.on("taskCreated", (task) => {
      if (task?.workspace) io.to(task.workspace).emit("taskCreated", task);
    });

    socket.on("taskUpdated", (task) => {
      if (task?.workspace) io.to(task.workspace).emit("taskUpdated", task);
    });

    socket.on("taskMoved", (task) => {
      if (task?.workspace) io.to(task.workspace).emit("taskMoved", task);
    });

    socket.on("taskDeleted", (task) => {
      if (task?.workspace) io.to(task.workspace).emit("taskDeleted", task);
    });

    socket.on("commentCreated", (comment) => {
      if (comment?.workspace) io.to(comment.workspace).emit("commentCreated", comment);
    });
    socket.on("commentUpdated", (comment) => {
      if (comment?.workspace) io.to(comment.workspace).emit("commentUpdated", comment);
    });
    socket.on("commentDeleted", (comment) => {
      if (comment?.workspace) io.to(comment.workspace).emit("commentDeleted", comment);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);

      const workspaceId = socketToWorkspace.get(socket.id);
      const userId = socketToUser.get(socket.id);

      if (!workspaceId || !userId) return;

      const workspace = workspaceStreams.get(workspaceId);

      if (!workspace) return;

      const userEntry = workspace.get(userId);

      if (!userEntry) return;

      // Remove only this socket
      userEntry.sockets.delete(socket.id);

      // Remove mappings
      socketToWorkspace.delete(socket.id);
      socketToUser.delete(socket.id);

      // If no sockets left, remove the user
      if (userEntry.sockets.size === 0) {
        workspace.delete(userId);
      }

      // If workspace becomes empty, remove it
      if (workspace.size === 0) {
        workspaceStreams.delete(workspaceId);
      } else {
        const workspaceUsers = Array.from(workspace.values()).map(
          (entry) => entry.user
        );

        io.to(workspaceId).emit("onlineUsers", workspaceUsers);
      }
    });
  });
};