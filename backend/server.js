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
// console.log(process.env.MONGO_URI);

const app = express();

// Middleware
app.use(cors());
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
      console.error(error);
  });
