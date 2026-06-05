import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import connectDB from "./config/database.js"

const app = express();

connectDB();

app.use(cors());
app.use(express.json()); 


// Routes
app.use('/api/auth', authRouter);



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));