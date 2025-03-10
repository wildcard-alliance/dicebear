import Redis from 'ioredis';
import { AvatarPreferences } from '../types';
import config from '../config';

// In-memory storage for development
const memoryStore: Record<string, string> = {};

let redisClient: Redis | null = null;

/**
 * Initialize the Redis client if configured
 */
async function getRedisClient(): Promise<Redis | null> {
  if (redisClient) {
    return redisClient;
  }
  
  if (config.redisUrl) {
    try {
      redisClient = new Redis(config.redisUrl);
      await redisClient.ping();
      console.log('Redis connection established');
      return redisClient;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Check if the database is connected
 */
export async function checkConnection(): Promise<{ connected: boolean; message?: string }> {
  if (config.redisUrl) {
    try {
      const client = await getRedisClient();
      if (client) {
        await client.ping();
        return { connected: true };
      }
      return { connected: false, message: 'Redis client not initialized' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { connected: false, message };
    }
  }
  
  // Using in-memory store
  return { connected: true, message: 'Using in-memory storage' };
}

/**
 * Get a value from the database
 */
export async function getValue(key: string): Promise<string | null> {
  const client = await getRedisClient();
  
  if (client) {
    return client.get(key);
  }
  
  // Fallback to in-memory store
  return memoryStore[key] || null;
}

/**
 * Set a value in the database
 */
export async function setValue(key: string, value: string, expirySeconds?: number): Promise<void> {
  const client = await getRedisClient();
  
  if (client) {
    if (expirySeconds) {
      await client.set(key, value, 'EX', expirySeconds);
    } else {
      await client.set(key, value);
    }
    return;
  }
  
  // Fallback to in-memory store
  memoryStore[key] = value;
  
  // Handle expiry in development mode
  if (expirySeconds) {
    setTimeout(() => {
      delete memoryStore[key];
    }, expirySeconds * 1000);
  }
}

/**
 * Delete a value from the database
 */
export async function deleteValue(key: string): Promise<boolean> {
  const client = await getRedisClient();
  
  if (client) {
    const result = await client.del(key);
    return result > 0;
  }
  
  // Fallback to in-memory store
  if (key in memoryStore) {
    delete memoryStore[key];
    return true;
  }
  
  return false;
}

/**
 * Get avatar preferences for a user
 */
export async function getAvatarPreferences(userId: string): Promise<AvatarPreferences | null> {
  const key = `avatar:${userId}`;
  const data = await getValue(key);
  
  if (!data) {
    return null;
  }
  
  try {
    console.log(`Raw preferences data for user ${userId}:`, data);
    const preferences = JSON.parse(data) as AvatarPreferences;
    
    // Ensure the options field is an object (not array, string, etc.)
    if (!preferences.options || typeof preferences.options !== 'object' || Array.isArray(preferences.options)) {
      console.error(`Invalid options format for user ${userId}, options:`, preferences.options);
      preferences.options = {}; // Reset to empty object if it's not valid
    }
    
    // Additional safety checks for style
    if (!preferences.style || typeof preferences.style !== 'string') {
      console.error(`Invalid style format for user ${userId}, style:`, preferences.style);
      preferences.style = 'bottts'; // Reset to a default style if not valid
    }
    
    console.log(`Processed preferences for user ${userId}:`, JSON.stringify(preferences));
    return preferences;
  } catch (error) {
    console.error(`Error parsing preferences for user ${userId}:`, error);
    return null;
  }
}

/**
 * Save avatar preferences for a user
 */
export async function saveAvatarPreferences(userId: string, preferences: AvatarPreferences): Promise<boolean> {
  try {
    const key = `avatar:${userId}`;
    // Add updatedAt timestamp
    const prefsWithTimestamp: AvatarPreferences = {
      ...preferences,
      updatedAt: new Date().toISOString(),
    };
    
    await setValue(key, JSON.stringify(prefsWithTimestamp));
    return true;
  } catch (error) {
    console.error(`Error saving preferences for user ${userId}:`, error);
    return false;
  }
}

/**
 * Store an edit token
 */
export async function storeEditToken(token: string, userId: string): Promise<boolean> {
  try {
    const key = `token:${token}`;
    // Store token with a longer expiry to prevent premature expiration
    await setValue(key, userId, config.tokenExpirySeconds * 2);
    return true;
  } catch (error) {
    console.error(`Error storing token for user ${userId}:`, error);
    return false;
  }
}

/**
 * Validate an edit token without consuming it
 * Used for auto-save and GET requests where we want to keep using the token
 */
export async function validateEditToken(token: string, userId: string): Promise<boolean> {
  try {
    const key = `token:${token}`;
    console.log(`[TOKEN] Validating token for user ${userId} (read-only, token not consumed)`);
    const storedUserId = await getValue(key);
    
    // Check if token exists and matches the user ID
    console.log(`[TOKEN] Token validation result: ${Boolean(storedUserId && storedUserId === userId)}`);
    return Boolean(storedUserId && storedUserId === userId);
  } catch (error) {
    console.error(`Error validating token for user ${userId}:`, error);
    return false;
  }
}

/**
 * Validate and consume an edit token
 */
export async function validateAndConsumeEditToken(token: string, userId: string): Promise<boolean> {
  try {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error(`[TOKEN] Token is empty, null, or invalid for user ${userId}`);
      return false;
    }
    
    const key = `token:${token}`;
    console.log(`[TOKEN] Validating and consuming token for user ${userId}, token length: ${token.length}`);
    
    // Check if token key exists without validation first
    const storedUserId = await getValue(key);
    
    console.log(`[TOKEN] Token lookup result for ${userId}: ${storedUserId || 'not found'}`);
    
    // If token doesn't exist but we're in development mode, allow it
    if (!storedUserId) {
      const isDev = process.env.NODE_ENV === 'development';
      console.log(`[TOKEN] Token does not exist for user ${userId}. Development mode: ${isDev}`);
      
      if (isDev) {
        console.log(`[TOKEN] Development mode - allowing token bypass for user ${userId}`);
        return true;
      }
      
      return false;
    }
    
    // Check if token exists and matches the user ID
    const isValid = storedUserId === userId;
    
    if (!isValid) {
      console.error(`[TOKEN] Token validation failed for user ${userId}. Token exists, but userId mismatch. Expected: ${userId}, Found: ${storedUserId}`);
      return false;
    }
    
    // Consume the token (one-time use)
    console.log(`[TOKEN] Token validated successfully for user ${userId}, consuming token`);
    
    try {
      await deleteValue(key);
    } catch (deleteError) {
      console.error(`[TOKEN] Failed to delete token for user ${userId}:`, deleteError);
      // Even if token deletion fails, we validated it successfully
      // so return true to allow the save operation
    }
    
    return true;
  } catch (error) {
    console.error(`[TOKEN] Error validating token for user ${userId}:`, error);
    // In development mode, allow saving even if token validation fails
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TOKEN] Development mode - allowing token validation bypass due to error`);
      return true;
    }
    return false;
  }
}

/**
 * Close the database connection
 */
export async function closeConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}