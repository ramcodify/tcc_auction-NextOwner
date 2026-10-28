import express from 'express';
import { getDatabaseStatus } from '../config/db.js';

const router = express.Router();
const startTime = Date.now();

// Server overall health
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nextowner-server',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connectivity health check
router.get('/db', (req, res) => {
  const dbStatus = getDatabaseStatus();

  if (dbStatus.isConnected) {
    return res.status(200).json({
      status: 'healthy',
      database: dbStatus,
      message: 'MongoDB is connected and ready.'
    });
  }

  return res.status(503).json({
    status: 'unhealthy',
    database: dbStatus,
    message: dbStatus.lastError || 'MongoDB is not connected. Verify MONGODB_URI and service availability.'
  });
});

export default router;
