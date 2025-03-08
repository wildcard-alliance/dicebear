import { AppConfig } from './types';
/**
 * Application configuration loaded from environment variables
 */
declare const config: AppConfig;
/**
 * Validates that the configuration is valid
 */
export declare function validateConfig(): void;
export default config;
