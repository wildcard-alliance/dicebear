/**
 * Avatar preferences type - defines how an avatar should be rendered
 */
export interface AvatarPreferences {
    /** The avatar style (e.g., 'adventurer', 'avataaars', etc.) */
    style: string;
    /** Style-specific options */
    options: Record<string, any>;
    /** When the preferences were last updated */
    updatedAt?: string;
}
/**
 * Edit token for secure avatar editing
 */
export interface EditToken {
    /** The user ID this token is for */
    userId: string;
    /** When the token was created */
    createdAt: string;
    /** When the token expires */
    expiresAt: string;
    /** Whether the token has been used */
    used?: boolean;
}
/**
 * Avatar generation options
 */
export interface AvatarGenerationOptions {
    /** The avatar style to use */
    style: string;
    /** Style-specific options */
    options: Record<string, any>;
    /** The format to generate (svg, png, webp) */
    format: 'svg' | 'png' | 'webp';
    /** The size in pixels (for raster formats) */
    size?: number;
}
/**
 * Format for the health check response
 */
export interface HealthCheck {
    status: 'ok' | 'error';
    version: string;
    timestamp: string;
    uptime: number;
    environment: string;
    database?: {
        connected: boolean;
        message?: string;
    };
}
/**
 * App configuration from environment variables
 */
export interface AppConfig {
    /** Port to run the server on */
    port: number;
    /** Base URL for the server */
    baseUrl: string;
    /** API key for securing admin endpoints */
    apiKey: string;
    /** Redis connection URL */
    redisUrl?: string;
    /** Node environment */
    nodeEnv: string;
    /** Token validity period in seconds */
    tokenExpirySeconds: number;
    /** Whether to allow CORS requests */
    corsEnabled: boolean;
    /** Maximum size for a generated avatar */
    maxAvatarSize: number;
}
