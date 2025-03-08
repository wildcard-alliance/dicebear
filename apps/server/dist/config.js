"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = validateConfig;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
/**
 * Application configuration loaded from environment variables
 */
const config = {
    // Server configuration
    port: parseInt(process.env.PORT || '3333', 10),
    baseUrl: process.env.BASE_URL || `http://localhost:${parseInt(process.env.PORT || '3333', 10)}`,
    // Security
    apiKey: process.env.API_KEY || 'development-api-key',
    // Database
    redisUrl: process.env.REDIS_URL,
    // Environment
    nodeEnv: process.env.NODE_ENV || 'development',
    // Token configuration
    tokenExpirySeconds: parseInt(process.env.TOKEN_EXPIRY_SECONDS || '3600', 10), // 1 hour default
    // CORS
    corsEnabled: process.env.CORS_ENABLED === 'true',
    // Avatar generation
    maxAvatarSize: parseInt(process.env.MAX_AVATAR_SIZE || '1024', 10),
};
/**
 * Validates that the configuration is valid
 */
function validateConfig() {
    // Required in production
    if (config.nodeEnv === 'production') {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY must be set in production environment');
        }
        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL must be set in production environment');
        }
    }
}
exports.default = config;
