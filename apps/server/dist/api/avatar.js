"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../lib/db");
const avatar_generator_1 = require("../lib/avatar-generator");
const security_1 = require("../lib/security");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Get an avatar for a user
 *
 * GET /api/avatar/:userId
 * Query params:
 *   - size: number (default: 128)
 *   - format: 'svg' | 'png' | 'webp' (default: 'svg')
 *   - style: string (optional, overrides user preference)
 */
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!(0, security_1.validateUserId)(userId)) {
            throw new errorHandler_1.ApiError('Invalid user ID format', 400);
        }
        // Parse query parameters
        const format = req.query.format || 'svg';
        const size = parseInt(req.query.size || '128', 10);
        const overrideStyle = req.query.style;
        // Validate format
        if (!['svg', 'png', 'webp'].includes(format)) {
            throw new errorHandler_1.ApiError(`Invalid format: ${format}. Must be svg, png, or webp.`, 400);
        }
        // Get user preferences
        const preferences = await (0, db_1.getAvatarPreferences)(userId);
        let avatarData;
        // Generate the avatar based on preferences or deterministically
        if (preferences) {
            // If style override is provided, use it instead of saved preference
            const style = overrideStyle || preferences.style;
            avatarData = await (0, avatar_generator_1.generateAvatar)({
                style,
                options: preferences.options,
                format,
                size,
            });
        }
        else {
            // No saved preferences, generate deterministically
            const style = overrideStyle || 'adventurer'; // Default style
            avatarData = await (0, avatar_generator_1.generateDeterministicAvatar)(userId, style, format, size);
        }
        // Set cache headers
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        // Set content type based on format
        if (format === 'svg') {
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(avatarData);
        }
        else if (format === 'png') {
            res.setHeader('Content-Type', 'image/png');
            res.end(avatarData);
        }
        else if (format === 'webp') {
            res.setHeader('Content-Type', 'image/webp');
            res.end(avatarData);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
