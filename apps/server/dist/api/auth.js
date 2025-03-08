"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const security_1 = require("../lib/security");
const apiKeyAuth_1 = __importDefault(require("../middleware/apiKeyAuth"));
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Generate an edit token
 *
 * POST /api/auth/token
 * Headers: X-API-Key: <api-key>
 * Body: { userId: string }
 */
router.post('/token', apiKeyAuth_1.default, async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            throw new errorHandler_1.ApiError('User ID is required', 400);
        }
        if (!(0, security_1.validateUserId)(userId)) {
            throw new errorHandler_1.ApiError('Invalid user ID format', 400);
        }
        const token = await (0, security_1.generateEditToken)(userId);
        const editUrl = (0, security_1.generateEditUrl)(userId, token);
        res.json({
            success: true,
            token,
            editUrl
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
