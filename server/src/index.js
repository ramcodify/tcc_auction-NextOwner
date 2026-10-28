import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NEXTowner Campus Auction API',
    version: '1.0.0',
    phase: 'Phase 2 - Authentication & Navigation',
    endpoints: {
      health: '/api/health',
      databaseHealth: '/api/health/db',
      auth: '/api/auth'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[NEXTowner Server] Running on http://localhost:${PORT}`);
    console.log(`[Health check] http://localhost:${PORT}/api/health`);
    console.log(`[Database check] http://localhost:${PORT}/api/health/db`);
  });
};

startServer();

export default app;
