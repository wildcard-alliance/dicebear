"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = checkConnection;
exports.getValue = getValue;
exports.setValue = setValue;
exports.deleteValue = deleteValue;
exports.getAvatarPreferences = getAvatarPreferences;
exports.saveAvatarPreferences = saveAvatarPreferences;
exports.storeEditToken = storeEditToken;
exports.validateAndConsumeEditToken = validateAndConsumeEditToken;
exports.closeConnection = closeConnection;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
// In-memory storage for development
const memoryStore = {};
let redisClient = null;
/**
 * Initialize the Redis client if configured
 */
async function getRedisClient() {
    if (redisClient) {
        return redisClient;
    }
    if (config_1.default.redisUrl) {
        try {
            redisClient = new ioredis_1.default(config_1.default.redisUrl);
            await redisClient.ping();
            console.log('Redis connection established');
            return redisClient;
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            return null;
        }
    }
    return null;
}
/**
 * Check if the database is connected
 */
async function checkConnection() {
    if (config_1.default.redisUrl) {
        try {
            const client = await getRedisClient();
            if (client) {
                await client.ping();
                return { connected: true };
            }
            return { connected: false, message: 'Redis client not initialized' };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { connected: false, message };
        }
    }
    // Using in-memory store
    return { connected: true, message: 'Using in-memory storage' };
}
/**
 * Get a value from the database
 */
async function getValue(key) {
    const client = await getRedisClient();
    if (client) {
        return client.get(key);
    }
    // Fallback to in-memory store
    return memoryStore[key] || null;
}
/**
 * Set a value in the database
 */
async function setValue(key, value, expirySeconds) {
    const client = await getRedisClient();
    if (client) {
        if (expirySeconds) {
            await client.set(key, value, 'EX', expirySeconds);
        }
        else {
            await client.set(key, value);
        }
        return;
    }
    // Fallback to in-memory store
    memoryStore[key] = value;
    // Handle expiry in development mode
    if (expirySeconds) {
        setTimeout(() => {
            delete memoryStore[key];
        }, expirySeconds * 1000);
    }
}
/**
 * Delete a value from the database
 */
async function deleteValue(key) {
    const client = await getRedisClient();
    if (client) {
        const result = await client.del(key);
        return result > 0;
    }
    // Fallback to in-memory store
    if (key in memoryStore) {
        delete memoryStore[key];
        return true;
    }
    return false;
}
/**
 * Get avatar preferences for a user
 */
async function getAvatarPreferences(userId) {
    const key = `avatar:${userId}`;
    const data = await getValue(key);
    if (!data) {
        return null;
    }
    try {
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`Error parsing preferences for user ${userId}:`, error);
        return null;
    }
}
/**
 * Save avatar preferences for a user
 */
async function saveAvatarPreferences(userId, preferences) {
    try {
        const key = `avatar:${userId}`;
        // Add updatedAt timestamp
        const prefsWithTimestamp = {
            ...preferences,
            updatedAt: new Date().toISOString(),
        };
        await setValue(key, JSON.stringify(prefsWithTimestamp));
        return true;
    }
    catch (error) {
        console.error(`Error saving preferences for user ${userId}:`, error);
        return false;
    }
}
/**
 * Store an edit token
 */
async function storeEditToken(token, userId) {
    try {
        const key = `token:${token}`;
        await setValue(key, userId, config_1.default.tokenExpirySeconds);
        return true;
    }
    catch (error) {
        console.error(`Error storing token for user ${userId}:`, error);
        return false;
    }
}
/**
 * Validate and consume an edit token
 */
async function validateAndConsumeEditToken(token, userId) {
    try {
        const key = `token:${token}`;
        const storedUserId = await getValue(key);
        // Check if token exists and matches the user ID
        if (!storedUserId || storedUserId !== userId) {
            return false;
        }
        // Consume the token (one-time use)
        await deleteValue(key);
        return true;
    }
    catch (error) {
        console.error(`Error validating token for user ${userId}:`, error);
        return false;
    }
}
/**
 * Close the database connection
 */
async function closeConnection() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}
