/**
 * Validate that a user ID is in the correct format
 */
export declare function validateUserId(userId: string): boolean;
/**
 * Generate and store an edit token for a user
 */
export declare function generateEditToken(userId: string): Promise<string>;
/**
 * Generate a complete edit URL with token
 */
export declare function generateEditUrl(userId: string, token: string): string;
/**
 * Validate an API key
 */
export declare function validateApiKey(apiKey: string): boolean;
