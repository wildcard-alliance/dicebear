import { Router } from 'express';
import { saveAvatarPreferences } from '../lib/db';
import { validateAndConsumeEditToken } from '../lib/db';
import { validateUserId } from '../lib/security';
import { ApiError } from '../middleware/errorHandler';
import { AvatarPreferences } from '../types';

const router = Router();

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
    if (!validateUserId(userId)) {
      throw new ApiError('Invalid user ID format', 400);
    }
    
    if (!token) {
      throw new ApiError('Token is required', 400);
    }
    
    if (!style) {
      throw new ApiError('Style is required', 400);
    }
    
    if (!options || typeof options !== 'object') {
      throw new ApiError('Options object is required', 400);
    }
    
    // Validate the token
    const isValidToken = await validateAndConsumeEditToken(token, userId);
    if (!isValidToken) {
      throw new ApiError('Invalid or expired token', 401);
    }
    
    // Create preferences object
    const preferences: AvatarPreferences = {
      style,
      options,
      updatedAt: new Date().toISOString(),
    };
    
    // Save preferences
    const success = await saveAvatarPreferences(userId, preferences);
    
    if (!success) {
      throw new ApiError('Failed to save avatar preferences', 500);
    }
    
    res.json({
      success: true,
      message: 'Avatar preferences saved successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;