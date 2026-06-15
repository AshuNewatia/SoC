import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";

<<<<<<< HEAD
// Load env variables
=======
>>>>>>> 1e242c1af1d06c4e09b667156192ca1d8b3330cf
dotenv.config();

const app = express();

<<<<<<< HEAD
// --- CORS CONFIGURATION ---
// This array tells Express exactly who is allowed to talk to the database.
const allowedOrigins = [
  'http://localhost:5173', // For your local testing
  process.env.CLIENT_URL   // Your live Render frontend URL (Set this in Render's dashboard!)
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

// Middleware
app.use(express.json()); // Parses incoming JSON payloads
=======
/* ---------------- Middleware ---------------- */

app.use(cors());

app.use(express.json());
>>>>>>> 1e242c1af1d06c4e09b667156192ca1d8b3330cf

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
<<<<<<< HEAD
      console.error("Database connection failed:", error);
=======
    console.error(error);
>>>>>>> 1e242c1af1d06c4e09b667156192ca1d8b3330cf
  });