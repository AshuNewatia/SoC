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
import analyticsRoutes from "./routes/analyticsRoutes.js"


dotenv.config();

const app = express();

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

app.use(express.json()); 
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
app.use('/api/webhooks', webhookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces", memberRoutes);
app.use("/api/workspaces", activityRoutes);
app.use("/api/myboard", personalTaskRoutes);
app.use("/api/notes", quickNoteRoutes);
app.use("/api/personal-activity", personalActivityRoutes);
app.use('/api', taskRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.send("CampusFlow Backend Running 🚀");
});

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

app.set('io', io)

initializeSocket(io);

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
