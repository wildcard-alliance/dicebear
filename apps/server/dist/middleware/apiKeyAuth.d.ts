import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to validate API key for protected endpoints
 */
export default function apiKeyAuth(req: Request, res: Response, next: NextFunction): void;
