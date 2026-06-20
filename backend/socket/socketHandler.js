export const initializeSocket = (io) => {
  // Structure: Map<workspaceId, Map<socketId, userData>>
  const workspaceStreams = new Map();
  // Quick lookup to find a user's workspace on disconnect: Map<socketId, workspaceId>
  const socketToWorkspace = new Map();

  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id}`);

    socket.on("userJoined", (user) => {
      const { workspaceId } = user;
      if (!workspaceId) return;

      // 1. Join the Socket.io room for broadcasting
      socket.join(workspaceId);
      socketToWorkspace.set(socket.id, workspaceId);

      // 2. Initialize the workspace map if it doesn't exist
      if (!workspaceStreams.has(workspaceId)) {
        workspaceStreams.set(workspaceId, new Map());
      }
      
      // 3. Add user to the specific workspace pool
      workspaceStreams.get(workspaceId).set(socket.id, user);

      // 4. Send back ONLY this workspace's online users
      const workspaceUsers = Array.from(workspaceStreams.get(workspaceId).values());
      io.to(workspaceId).emit("onlineUsers", workspaceUsers);
    });

    // --- Task Event Handlers ---
    // Note: Consider verifying if socket.rooms.has(task.workspace) for security
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

    // --- Disconnect Handler ---
    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);

      const workspaceId = socketToWorkspace.get(socket.id);

      if (workspaceId && workspaceStreams.has(workspaceId)) {
        const usersInWorkspace = workspaceStreams.get(workspaceId);
        
        // Remove the user from the workspace map
        usersInWorkspace.delete(socket.id);
        socketToWorkspace.delete(socket.id);

        // If no one is left in the workspace, clear the memory entirely
        if (usersInWorkspace.size === 0) {
          workspaceStreams.delete(workspaceId);
        } else {
          // Otherwise, notify remaining members with the updated list
          io.to(workspaceId).emit("onlineUsers", Array.from(usersInWorkspace.values()));
        }
      }
    });
  });
};