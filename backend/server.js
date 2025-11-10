import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import bpReadingRoutes from './routes/bpReadings.js';
import medicalHistoryRoutes from './routes/medicalHistory.js';
import recommendationRoutes from './routes/recommendations.js';
import chatbotRoutes from './routes/chatbot.js';
import userRoutes from './routes/users.js';
import doctorDashboardRoutes from './routes/doctorDashboard.js';

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
// Allow both common frontend ports for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // Alternative port
  'http://localhost:5174' // Vite fallback port
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bp-readings', bpReadingRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctor-dashboard', doctorDashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

