"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const db_2 = require("../lib/db");
const security_1 = require("../lib/security");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Save avatar preferences for a user
 *
 * POST /api/editor/:userId
 * Body: {
 *   token: string, (required)
 *   style: string, (required)
 *   options: object (required)
 * }
 */
router.post('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { token, style, options } = req.body;
        // Validate inputs
        if (!(0, security_1.validateUserId)(userId)) {
            throw new errorHandler_1.ApiError('Invalid user ID format', 400);
        }
        if (!token) {
            throw new errorHandler_1.ApiError('Token is required', 400);
        }
        if (!style) {
            throw new errorHandler_1.ApiError('Style is required', 400);
        }
        if (!options || typeof options !== 'object') {
            throw new errorHandler_1.ApiError('Options object is required', 400);
        }
        // Validate the token
        const isValidToken = await (0, db_2.validateAndConsumeEditToken)(token, userId);
        if (!isValidToken) {
            throw new errorHandler_1.ApiError('Invalid or expired token', 401);
        }
        // Create preferences object
        const preferences = {
            style,
            options,
            updatedAt: new Date().toISOString(),
        };
        // Save preferences
        const success = await (0, db_1.saveAvatarPreferences)(userId, preferences);
        if (!success) {
            throw new errorHandler_1.ApiError('Failed to save avatar preferences', 500);
        }
        res.json({
            success: true,
            message: 'Avatar preferences saved successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
