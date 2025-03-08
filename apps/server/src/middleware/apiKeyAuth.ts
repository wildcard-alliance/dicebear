import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../lib/security';

/**
 * Middleware to validate API key for protected endpoints
 */
export default function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey || !validateApiKey(apiKey)) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    return;
  }
  
  next();
}