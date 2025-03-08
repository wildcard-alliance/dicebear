import { AvatarPreferences } from '../types';
/**
 * Check if the database is connected
 */
export declare function checkConnection(): Promise<{
    connected: boolean;
    message?: string;
}>;
/**
 * Get a value from the database
 */
export declare function getValue(key: string): Promise<string | null>;
/**
 * Set a value in the database
 */
export declare function setValue(key: string, value: string, expirySeconds?: number): Promise<void>;
/**
 * Delete a value from the database
 */
export declare function deleteValue(key: string): Promise<boolean>;
/**
 * Get avatar preferences for a user
 */
export declare function getAvatarPreferences(userId: string): Promise<AvatarPreferences | null>;
/**
 * Save avatar preferences for a user
 */
export declare function saveAvatarPreferences(userId: string, preferences: AvatarPreferences): Promise<boolean>;
/**
 * Store an edit token
 */
export declare function storeEditToken(token: string, userId: string): Promise<boolean>;
/**
 * Validate and consume an edit token
 */
export declare function validateAndConsumeEditToken(token: string, userId: string): Promise<boolean>;
/**
 * Close the database connection
 */
export declare function closeConnection(): Promise<void>;
