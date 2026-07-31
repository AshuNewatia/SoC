import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socketHandler.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import personalTaskRoutes from "./routes/personalTaskRoutes.js";
import quickNoteRoutes from "./routes/quickNoteRoutes.js";
import personalActivityRoutes from "./routes/personalActivityRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import myBoardRoutes from "./routes/myBoardRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import workspaceAnalyticsRoutes from "./routes/workspaceAnalyticsRoutes.js";

dotenv.config();

const app = express();

// 1. JSON Body Parser (Must be declared before routes!)
app.use(express.json()); 

// 2. Logging Middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// 🟢 3. Webhook Endpoint (Placed BEFORE CORS so GitHub requests bypass browser Origin restrictions)
app.use('/api/webhooks', webhookRoutes);

// 4. CORS Configuration for standard client requests
const allowedOrigins = [
  'http://localhost:5173', 
  process.env.CLIENT_URL   
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true, 
}));

// 5. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", memberRoutes);
app.use("/api/workspaces", activityRoutes);
app.use("/api/myboard", personalTaskRoutes);
app.use("/api/notes", quickNoteRoutes);
app.use("/api/personal-activity", personalActivityRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/my-board", myBoardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/workspace-analytics", workspaceAnalyticsRoutes);

app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

// 6. Server & Socket.IO Initialization
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set('io', io);

initializeSocket(io);

io.on("connection", (socket) => {
  console.log("User connected to socket:", socket.id);
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });