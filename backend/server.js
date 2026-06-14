import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";

dotenv.config();

const app = express();

/* ---------------- Middleware ---------------- */

app.use(cors());

app.use(express.json());

/* ---------------- Routes ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", workspaceRoutes);

/* ---------------- Health Check ---------------- */

app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

/* ---------------- HTTP Server ---------------- */

const server = http.createServer(app);

/* ---------------- Socket.io ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

/* ---------------- Online Users ---------------- */

const onlineUsers = new Map();

/* ---------------- Socket Events ---------------- */

io.on("connection", (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  socket.on("userJoined", (user) => {
    onlineUsers.set(socket.id, user);

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.values())
    );
  });

  socket.on("taskCreated", (task) => {
    socket.broadcast.emit("taskCreated", task);
  });

  socket.on("taskUpdated", (task) => {
    socket.broadcast.emit("taskUpdated", task);
  });

  socket.on("taskMoved", (task) => {
    socket.broadcast.emit("taskMoved", task);
  });

  socket.on("taskDeleted", (task) => {
    socket.broadcast.emit("taskDeleted", task);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User Disconnected: ${socket.id}`);

    onlineUsers.delete(socket.id);

    io.emit(
      "onlineUsers",
      Array.from(onlineUsers.values())
    );
  });
});

/* ---------------- Start Server ---------------- */

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(
        ` Server running on port ${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(error);
  });