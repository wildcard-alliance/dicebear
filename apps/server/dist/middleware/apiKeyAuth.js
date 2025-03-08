"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = apiKeyAuth;
const security_1 = require("../lib/security");
/**
 * Middleware to validate API key for protected endpoints
 */
function apiKeyAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !(0, security_1.validateApiKey)(apiKey)) {
        res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
        return;
    }
    next();
}
