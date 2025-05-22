// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './utils/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';

import jobRoutes from './routes/jobRoutes.js';



dotenv.config(); // Load .env variables

const app = express();

// CORS config
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('common'));

// DB connection
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
// Health check or default
app.get('/', (req, res) => {
  res.send('AI Job Match API is running...');
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
