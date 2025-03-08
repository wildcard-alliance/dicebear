import { Router } from 'express';
import { getAvatarPreferences } from '../lib/db';
import { generateAvatar, generateDeterministicAvatar } from '../lib/avatar-generator';
import { validateUserId } from '../lib/security';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

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
    
    if (!validateUserId(userId)) {
      throw new ApiError('Invalid user ID format', 400);
    }
    
    // Parse query parameters
    const format = (req.query.format as 'svg' | 'png' | 'webp') || 'svg';
    const size = parseInt(req.query.size as string || '128', 10);
    const overrideStyle = req.query.style as string;
    
    // Validate format
    if (!['svg', 'png', 'webp'].includes(format)) {
      throw new ApiError(`Invalid format: ${format}. Must be svg, png, or webp.`, 400);
    }
    
    // Get user preferences
    const preferences = await getAvatarPreferences(userId);
    
    let avatarData: Buffer | string;
    
    // Generate the avatar based on preferences or deterministically
    if (preferences) {
      // If style override is provided, use it instead of saved preference
      const style = overrideStyle || preferences.style;
      
      avatarData = await generateAvatar({
        style,
        options: preferences.options,
        format,
        size,
      });
    } else {
      // No saved preferences, generate deterministically
      const style = overrideStyle || 'bottts'; // Default style
      avatarData = await generateDeterministicAvatar(userId, style, format, size);
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Set content type based on format
    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(avatarData);
    } else if (format === 'png') {
      res.setHeader('Content-Type', 'image/png');
      res.end(avatarData as Buffer);
    } else if (format === 'webp') {
      res.setHeader('Content-Type', 'image/webp');
      res.end(avatarData as Buffer);
    }
  } catch (error) {
    next(error);
  }
});

export default router;