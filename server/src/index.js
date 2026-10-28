import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './services/notificationService.js';
import { startAuctionClosureService } from './services/auctionClosureService.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import savedSearchRoutes from './routes/savedSearchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
});
initSocket(io);

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ai', aiRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NEXTowner Campus Auction API',
    version: '1.0.0',
    phase: 'Complete Platform Architecture Active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      auctions: '/api/auctions',
      watchlist: '/api/watchlist',
      savedSearches: '/api/saved-searches',
      notifications: '/api/notifications',
      activity: '/api/activity',
      ai: '/api/ai'
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
  startAuctionClosureService();

  httpServer.listen(PORT, () => {
    console.log(`[NEXTowner Server] Running on http://localhost:${PORT}`);
    console.log(`[Health check] http://localhost:${PORT}/api/health`);
    console.log(`[Socket.IO] Real-time engine attached.`);
  });
};

startServer();

export default app;
