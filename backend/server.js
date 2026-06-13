// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import connectDB from './config/db.js';
// import mongoose from 'mongoose';
// import authRoutes from './routes/authRoutes.js';

// // Load env variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json()); // Parses incoming JSON payloads


// // Routes
// app.use('/api/auth', authRoutes);

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error(
      "❌ MongoDB Error:",
      err
    );
  });

const app = express();

/* ---------------- Middleware ---------------- */

app.use(cors());

app.use(express.json());

/* ---------------- Routes ---------------- */

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

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
  console.log(
    `🟢 User Connected: ${socket.id}`
  );

  /* ---------- User Joined ---------- */

  socket.on("userJoined", (user) => {
    onlineUsers.set(socket.id, user);

    const users = Array.from(
      onlineUsers.values()
    );

    io.emit("onlineUsers", users);

    io.emit("activity", {
      type: "join",
      message: `${user.name} joined workspace`,
      time: new Date(),
    });

    console.log(
      "ONLINE USERS:",
      users
    );
  });

  /* ---------- Task Created ---------- */

  socket.on(
    "taskCreated",
    (updatedBoard) => {
      socket.broadcast.emit(
        "taskCreated",
        updatedBoard
      );

      io.emit("activity", {
        type: "create",
        message:
          "New task created",
        time: new Date(),
      });
    }
  );

  /* ---------- Task Moved ---------- */

  socket.on(
    "taskMoved",
    (updatedBoard) => {
      socket.broadcast.emit(
        "taskMoved",
        updatedBoard
      );

      io.emit("activity", {
        type: "move",
        message:
          "Task moved between columns",
        time: new Date(),
      });
    }
  );

  /* ---------- Disconnect ---------- */

  socket.on("disconnect", () => {
    console.log(
      `🔴 User Disconnected: ${socket.id}`
    );

    const user =
      onlineUsers.get(socket.id);

    if (user) {
      io.emit("activity", {
        type: "leave",
        message: `${user.name} left workspace`,
        time: new Date(),
      });
    }

    onlineUsers.delete(socket.id);

    const users = Array.from(
      onlineUsers.values()
    );

    io.emit("onlineUsers", users);

    console.log(
      "ONLINE USERS:",
      users
    );
  });
});



/* ---------------- Health Check ---------------- */

app.get("/", (req, res) => {
  res.send(
    "Realtime Kanban Backend Running "
  );
});

/* ---------------- Start Server ---------------- */

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    ` Server running on port ${PORT}`
  );
});