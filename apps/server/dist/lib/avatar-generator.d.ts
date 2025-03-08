import { AvatarGenerationOptions } from '../types';
/**
 * Generate an avatar SVG string
 */
export declare function generateAvatarSvg(style: string, options?: Record<string, any>, seed?: string): Promise<string>;
/**
 * Generate an avatar in the requested format
 */
export declare function generateAvatar(options: AvatarGenerationOptions): Promise<Buffer | string>;
/**
 * Generate a deterministic avatar for a user
 * This creates a consistent avatar based on the user ID
 */
export declare function generateDeterministicAvatar(userId: string, style?: string, format?: 'svg' | 'png' | 'webp', size?: number): Promise<Buffer | string>;
