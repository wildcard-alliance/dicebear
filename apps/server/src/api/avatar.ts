import { Router } from 'express';
import { getAvatarPreferences, getValue } from '../lib/db';
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
 *   - options: JSON string of style-specific options (optional)
 *   - any style-specific option can be passed directly as a query parameter (e.g. ?backgroundColor=ff0000)
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log(`Avatar request for userId: ${userId}, query:`, req.query);
    
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
    
    // Extract options from query parameters
    const queryOptions: Record<string, any> = extractOptionsFromQuery(req.query);
    console.log(`DEBUG: Query options extracted for ${userId}:`, JSON.stringify(queryOptions));
    
    // Get user preferences
    const preferences = await getAvatarPreferences(userId);
    console.log(`Retrieved preferences for ${userId}:`, JSON.stringify(preferences));
    
    let avatarData: Buffer | string;
    
    try {
      // Generate the avatar based on preferences or deterministically
      if (preferences) {
        // If style override is provided, use it instead of saved preference
        const style = overrideStyle || preferences.style || 'bottts';
        console.log(`Using style ${style} for user ${userId}`);
        
        // Merge options: base options from preferences, overridden by query parameters
        const mergedOptions = {
          ...(preferences.options || {}),
          ...queryOptions
        };
        
        console.log(`DEBUG: Using merged options for ${userId}:`, JSON.stringify(mergedOptions));
        
        avatarData = await generateAvatar({
          style,
          options: mergedOptions,
          format,
          size,
          seed: userId  // Use userId as seed for consistency
        });
      } else {
        // No saved preferences, generate deterministically
        const style = overrideStyle || 'bottts'; // Default style
        console.log(`No preferences found, using default style ${style} for user ${userId}`);
        
        // If we have query options, use them with generateAvatar
        if (Object.keys(queryOptions).length > 0) {
          console.log(`Using query options:`, queryOptions);
          avatarData = await generateAvatar({
            style,
            options: queryOptions,
            format,
            size,
            seed: userId
          });
        } else {
          // Use the simpler function if no extra options
          avatarData = await generateDeterministicAvatar(userId, style, format, size);
        }
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
      console.error('Error generating or sending avatar:', error);
      
      // Generate a fallback error SVG
      const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="#f8d7da"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="16">Error generating avatar</text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="12">${error instanceof Error ? error.message : 'Unknown error'}</text>
      </svg>`;
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(errorSvg);
    }
  } catch (error) {
    console.error('Error in avatar endpoint:', error);
    
    // Generate an error SVG as fallback
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#f8d7da"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="16">Error handling request</text>
      <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="12">${error instanceof Error ? error.message : 'Unknown error'}</text>
    </svg>`;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(500).send(errorSvg);
  }
});

/**
 * Helper function to extract avatar options from query parameters
 * 
 * This function handles two ways of passing options:
 * 1. A JSON string in the 'options' parameter
 * 2. Direct query parameters matching option names
 * 
 * Reserved parameter names (not treated as options): 
 * format, size, style, t (for cache busting)
 */
function extractOptionsFromQuery(query: any): Record<string, any> {
  const options: Record<string, any> = {};
  const reservedParams = ['format', 'size', 'style', 't'];
  
  // First, check if there's a JSON options string
  if (query.options && typeof query.options === 'string') {
    try {
      const parsedOptions = JSON.parse(query.options);
      Object.assign(options, parsedOptions);
    } catch (e) {
      console.warn('Failed to parse options JSON:', e);
    }
  }
  
  // Then process individual query parameters
  for (const [key, value] of Object.entries(query)) {
    // Skip reserved parameters
    if (reservedParams.includes(key)) continue;
    // Skip the 'options' parameter which we already processed
    if (key === 'options') continue;
    
    // Handle different data types appropriately
    if (typeof value === 'string') {
      // Handle boolean values
      if (value.toLowerCase() === 'true') {
        options[key] = true;
      } else if (value.toLowerCase() === 'false') {
        options[key] = false;
      } 
      // Handle numeric values
      else if (!isNaN(Number(value)) && value.trim() !== '') {
        options[key] = Number(value);
      } 
      // Handle arrays passed as comma-separated values
      else if (value.includes(',')) {
        options[key] = value.split(',').map(item => item.trim());
      } 
      // Otherwise, keep as string
      else {
        options[key] = value;
      }
    } else {
      // For non-string values (should be rare in query params)
      options[key] = value;
    }
  }
  
  console.log('Extracted options from query:', options);
  return options;
}

/**
 * Debug endpoint to inspect avatar preferences
 * GET /api/avatar/:userId/inspect
 */
router.get('/:userId/inspect', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!validateUserId(userId)) {
      throw new ApiError('Invalid user ID format', 400);
    }
    
    // Get stored preferences
    const preferences = await getAvatarPreferences(userId);
    
    // Get raw storage data
    const key = `avatar:${userId}`;
    const rawData = await getValue(key);
    
    // Build response with debug info
    const response = {
      userId,
      storageKey: key,
      hasPreferences: !!preferences,
      rawData,
      parsedPreferences: preferences,
      debugInfo: {
        timestamp: new Date().toISOString(),
        optionsType: preferences ? typeof preferences.options : null,
        optionsIsArray: preferences ? Array.isArray(preferences.options) : null,
        styleType: preferences ? typeof preferences.style : null,
      }
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;