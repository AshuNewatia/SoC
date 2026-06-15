import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from "./routes/taskRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";

// Load env variables
dotenv.config();

const app = express();

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', taskRoutes);
app.use('/api', workspaceRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
      app.listen(PORT, () =>
          console.log(`Server running on port ${PORT}`)
      );
  })
  .catch((error) => {
      console.error("Database connection failed:", error);
  });