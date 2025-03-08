"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const config_1 = __importDefault(require("../config"));
const router = (0, express_1.Router)();
// Package version - would be read from package.json in a real implementation
const VERSION = '1.0.0';
/**
 * Health check endpoint
 *
 * GET /api/health
 */
router.get('/', async (req, res) => {
    // Check database connection
    const dbStatus = await (0, db_1.checkConnection)();
    const healthCheck = {
        status: dbStatus.connected ? 'ok' : 'error',
        version: VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.default.nodeEnv,
        database: dbStatus,
    };
    res.json(healthCheck);
});
exports.default = router;
