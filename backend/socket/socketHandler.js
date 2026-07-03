export const initializeSocket = (io) => {
  const workspaceStreams = new Map();
  const socketToWorkspace = new Map();

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    socket.on("userJoined", (user) => {
      const { workspaceId } = user;
      if (!workspaceId) return;

      socket.join(workspaceId);
      socketToWorkspace.set(socket.id, workspaceId);

      if (!workspaceStreams.has(workspaceId)) {
        workspaceStreams.set(workspaceId, new Map());
      }
      workspaceStreams.get(workspaceId).set(socket.id, user);

      const workspaceUsers = Array.from(workspaceStreams.get(workspaceId).values());
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

    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);

      const workspaceId = socketToWorkspace.get(socket.id);

      if (workspaceId && workspaceStreams.has(workspaceId)) {
        const usersInWorkspace = workspaceStreams.get(workspaceId);

        usersInWorkspace.delete(socket.id);
        socketToWorkspace.delete(socket.id);

        if (usersInWorkspace.size === 0) {
          workspaceStreams.delete(workspaceId);
        } else {
          io.to(workspaceId).emit("onlineUsers", Array.from(usersInWorkspace.values()));
        }
      }
    });
  });
};