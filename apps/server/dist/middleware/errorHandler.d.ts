import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class for API errors
 */
export declare class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
/**
 * Global error handling middleware
 */
export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
