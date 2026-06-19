import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socketHandler.js";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";

// Load env variables
dotenv.config();

const app = express();

/* ---------------- Middleware & CORS ---------------- */
// This array tells Express exactly who is allowed to talk to the database.
const allowedOrigins = [
  'http://localhost:5173', // For your local testing
  process.env.CLIENT_URL   // Your live frontend URL
];

console.log("========== SERVER STARTING ==========");
console.log("CLIENT_URL =", process.env.CLIENT_URL);
console.log("Allowed Origins =", allowedOrigins);

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

initializeSocket(io);

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
