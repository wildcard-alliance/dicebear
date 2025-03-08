import { nanoid } from 'nanoid';
import config from '../config';
import { storeEditToken } from './db';

/**
 * Generate a secure random token
 */
function generateRandomToken(length: number = 32): string {
  return nanoid(length);
}

/**
 * Validate that a user ID is in the correct format
 */
export function validateUserId(userId: string): boolean {
  // Simple validation - ensure it's a non-empty string
  // You might want to add more specific validation based on your user ID format
  return typeof userId === 'string' && userId.trim().length > 0;
}

/**
 * Generate and store an edit token for a user
 */
export async function generateEditToken(userId: string): Promise<string> {
  if (!validateUserId(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const token = generateRandomToken();
  const success = await storeEditToken(token, userId);
  
  if (!success) {
    throw new Error('Failed to store token');
  }
  
  return token;
}

/**
 * Generate a complete edit URL with token
 */
export function generateEditUrl(userId: string, token: string): string {
  return `${config.baseUrl}/editor/${userId}?token=${token}`;
}

/**
 * Validate an API key
 */
export function validateApiKey(apiKey: string): boolean {
  return apiKey === config.apiKey;
}