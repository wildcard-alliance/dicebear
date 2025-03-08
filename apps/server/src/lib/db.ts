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
    return JSON.parse(data) as AvatarPreferences;
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
    await setValue(key, userId, config.tokenExpirySeconds);
    return true;
  } catch (error) {
    console.error(`Error storing token for user ${userId}:`, error);
    return false;
  }
}

/**
 * Validate and consume an edit token
 */
export async function validateAndConsumeEditToken(token: string, userId: string): Promise<boolean> {
  try {
    const key = `token:${token}`;
    const storedUserId = await getValue(key);
    
    // Check if token exists and matches the user ID
    if (!storedUserId || storedUserId !== userId) {
      return false;
    }
    
    // Consume the token (one-time use)
    await deleteValue(key);
    return true;
  } catch (error) {
    console.error(`Error validating token for user ${userId}:`, error);
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