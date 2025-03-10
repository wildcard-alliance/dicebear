import { Router } from 'express';
import { saveAvatarPreferences, getAvatarPreferences } from '../lib/db';
import { validateAndConsumeEditToken, validateEditToken } from '../lib/db';
import { validateUserId } from '../lib/security';
import { ApiError } from '../middleware/errorHandler';
import config from '../config';
import { AvatarPreferences } from '../types';

// Create Express router
const router = Router();

/**
 * Save avatar preferences for a user
 * 
 * POST /api/editor/:userId (token required)
 * Body: {
 *   token: string, (required)
 *   style: string, (required)
 *   options: object (required)
 * }
 */
router.post('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    console.log(`[SAVE] Received save request for user ${userId}, body type:`, typeof req.body);
    
    // Check for empty request body
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error(`[SAVE] Empty request body for user ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Empty request body'
      });
    }
    
    const { token, style, options } = req.body;
    
    console.log(`[SAVE] Editor save request for user ${userId}:`, {
      style,
      tokenProvided: !!token,
      tokenLength: token ? token.length : 0,
      styleProvided: !!style,
      optionsProvided: !!options,
      optionsType: typeof options,
      optionsIsArray: Array.isArray(options),
      optionsKeys: options && typeof options === 'object' && !Array.isArray(options) 
        ? Object.keys(options) : 'N/A'
    });
    
    // Validate inputs
    if (!validateUserId(userId)) {
      console.error(`[SAVE] Invalid user ID format: ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    if (!token) {
      console.error(`[SAVE] Token is required for user ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    if (!style) {
      console.error(`[SAVE] Style is required for user ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Style is required'
      });
    }
    
    if (!options || typeof options !== 'object') {
      console.error(`[SAVE] Options object is required for user ${userId}`);
      return res.status(400).json({
        success: false,
        error: 'Options object is required'
      });
    }

    console.log(`[SAVE] Input validation passed for user ${userId}`);
    
    // Handle potentially problematic options
    let cleanedOptions = options;
    
    // If options is an array, convert to an empty object
    if (Array.isArray(options)) {
      console.warn(`Options for user ${userId} is an array, converting to empty object`);
      cleanedOptions = {};
    }
    
    // Validate and consume the token
    console.log(`[SAVE] Validating token for user ${userId} in ${config.nodeEnv} mode`);
    const isValidToken = await validateAndConsumeEditToken(token, userId);
    
    if (!isValidToken) {
      // In development mode, we'll allow saves even with invalid tokens
      // This helps with testing and debugging
      if (config.nodeEnv === 'development') {
        console.warn(`[SAVE] Token validation failed but proceeding anyway in dev mode for user ${userId}`);
        // Don't throw error, just log warning and continue with save
      } else {
        console.error(`[SAVE] Token validation failed for user ${userId}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    }
    
    // Create preferences object
    const preferences: AvatarPreferences = {
      style,
      options: cleanedOptions,
      updatedAt: new Date().toISOString(),
    };
    
    console.log(`[SAVE] Saving preferences for user ${userId}:`, JSON.stringify(preferences));
    
    // Save preferences
    const success = await saveAvatarPreferences(userId, preferences);
    
    if (!success) {
      console.error(`[SAVE] Failed to save preferences for user ${userId}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to save avatar preferences'
      });
    } else {
      console.log(`[SAVE] Successfully saved preferences for user ${userId}`);
    }
    
    // Set content type explicitly before sending response
    res.setHeader('Content-Type', 'application/json');
    
    // Ensure we're sending a properly formatted JSON response
    return res.status(200).json({
      success: true,
      message: 'Avatar preferences saved successfully',
    });
  } catch (error) {
    console.error(`[SAVE] Error in editor endpoint:`, error);
    
    // Send a consistent error response
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown server error'
    });
  }
});

/**
 * Get saved avatar preferences for a user
 * 
 * GET /api/editor/:userId (token required)
 * Query params:
 *   token: string (required)
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const token = req.query.token as string | undefined;
    
    console.log(`Loading preferences for user ${userId}`);
    
    // Validate inputs
    if (!validateUserId(userId)) {
      throw new ApiError('Invalid user ID format', 400);
    }
    
    if (!token) {
      throw new ApiError('Token is required', 400);
    }
    
    // Validate token (but don't consume it)
    const isValidToken = await validateEditToken(token, userId);
    if (!isValidToken) {
      throw new ApiError('Invalid or expired token', 401);
    }
    
    // Get preferences
    const preferences = await getAvatarPreferences(userId);
    
    if (!preferences) {
      // Not found is actually OK - the user just hasn't saved preferences yet
      return res.status(404).json({
        success: false,
        message: 'No avatar preferences found',
      });
    }
    
    res.json(preferences);
  } catch (error) {
    next(error);
  }
});

export default router;