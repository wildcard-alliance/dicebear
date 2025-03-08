import { Router } from 'express';
import { checkConnection } from '../lib/db';
import config from '../config';
import { HealthCheck } from '../types';

const router = Router();

// Package version - would be read from package.json in a real implementation
const VERSION = '1.0.0';

/**
 * Health check endpoint
 * 
 * GET /api/health
 */
router.get('/', async (req, res) => {
  // Check database connection
  const dbStatus = await checkConnection();
  
  const healthCheck: HealthCheck = {
    status: dbStatus.connected ? 'ok' : 'error',
    version: VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: dbStatus,
  };
  
  res.json(healthCheck);
});

export default router;