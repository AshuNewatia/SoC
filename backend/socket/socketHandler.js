export const initializeSocket = (io) => {
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    socket.on("userJoined", (user) => {
      onlineUsers.set(socket.id, user);

      // Join workspace room
      if (user.workspaceId) {
        socket.join(user.workspaceId);
      }

      const workspaceUsers = Array.from(onlineUsers.values()).filter((e) => e.workspaceId === user.workspaceId);

      io.to(user.workspaceId).emit(
        "onlineUsers",
        workspaceUsers
      );
    });

    socket.on("taskCreated", (task) => {
      io.to(task.workspace).emit(
        "taskCreated",
        task
      );
    });

    socket.on("taskUpdated", (task) => {
      io.to(task.workspace).emit(
        "taskUpdated",
        task
      );
    });

    socket.on("taskMoved", (task) => {
      io.to(task.workspace).emit(
        "taskMoved",
        task
      );
    });

    socket.on("taskDeleted", (task) => {
      io.to(task.workspace).emit(
        "taskDeleted",
        task
      );
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);

      const disconnectedUser = onlineUsers.get(socket.id);

      if (disconnectedUser) {
        onlineUsers.delete(socket.id);

        const workspaceUsers = Array.from(
          onlineUsers.values()
        ).filter(
          (u) =>
            u.workspaceId ===
            disconnectedUser.workspaceId
        );

        io.to(disconnectedUser.workspaceId).emit(
          "onlineUsers",
          workspaceUsers
        );
      }
    });
  });
};