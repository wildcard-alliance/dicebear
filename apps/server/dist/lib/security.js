"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserId = validateUserId;
exports.generateEditToken = generateEditToken;
exports.generateEditUrl = generateEditUrl;
exports.validateApiKey = validateApiKey;
const nanoid_1 = require("nanoid");
const config_1 = __importDefault(require("../config"));
const db_1 = require("./db");
/**
 * Generate a secure random token
 */
function generateRandomToken(length = 32) {
    return (0, nanoid_1.nanoid)(length);
}
/**
 * Validate that a user ID is in the correct format
 */
function validateUserId(userId) {
    // Simple validation - ensure it's a non-empty string
    // You might want to add more specific validation based on your user ID format
    return typeof userId === 'string' && userId.trim().length > 0;
}
/**
 * Generate and store an edit token for a user
 */
async function generateEditToken(userId) {
    if (!validateUserId(userId)) {
        throw new Error('Invalid user ID');
    }
    const token = generateRandomToken();
    const success = await (0, db_1.storeEditToken)(token, userId);
    if (!success) {
        throw new Error('Failed to store token');
    }
    return token;
}
/**
 * Generate a complete edit URL with token
 */
function generateEditUrl(userId, token) {
    return `${config_1.default.baseUrl}/editor/${userId}?token=${token}`;
}
/**
 * Validate an API key
 */
function validateApiKey(apiKey) {
    return apiKey === config_1.default.apiKey;
}
