"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.default = errorHandler;
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    // Handle custom API errors
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: err.message
        });
        return;
    }
    // Handle unexpected errors
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
}
