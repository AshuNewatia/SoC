import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import personalTaskRoutes from "./routes/personalTaskRoutes.js";

// Load env variables
dotenv.config();

const app = express();

/* ---------------- Middleware & CORS ---------------- */
// This array tells Express exactly who is allowed to talk to the database.
const allowedOrigins = [
  'http://localhost:5173', // For your local testing
  process.env.CLIENT_URL   // Your live frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) 
    // OR if the origin perfectly matches one of the URLs in our allowedOrigins array
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true, // This allows secure cookies and tokens to be sent
}));

app.use(express.json()); // Parses incoming JSON payloads

/* ---------------- Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", workspaceRoutes);
app.use("/api/myboard", personalTaskRoutes);

/* ---------------- Health Check ---------------- */
app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

/* ---------------- HTTP Server ---------------- */
const server = http.createServer(app);

/* ---------------- Socket.io ---------------- */
const io = new Server(server, {
  cors: {
    // We are allowing all origins for WebSockets here, 
    // but you can restrict this to allowedOrigins later for stricter security!
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
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
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
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
});

/* ---------------- Start Server ---------------- */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
      console.error("Database connection failed:", error);
  });