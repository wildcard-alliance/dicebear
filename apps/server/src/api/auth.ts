import { Router } from 'express';
import { generateEditToken, generateEditUrl, validateUserId } from '../lib/security';
import apiKeyAuth from '../middleware/apiKeyAuth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

/**
 * Generate an edit token
 * 
 * POST /api/auth/token
 * Headers: X-API-Key: <api-key>
 * Body: { userId: string }
 */
router.post('/token', apiKeyAuth, async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }
    
    if (!validateUserId(userId)) {
      throw new ApiError('Invalid user ID format', 400);
    }
    
    const token = await generateEditToken(userId);
    const editUrl = generateEditUrl(userId, token);
    
    res.json({
      success: true,
      token,
      editUrl
    });
  } catch (error) {
    next(error);
  }
});

export default router;