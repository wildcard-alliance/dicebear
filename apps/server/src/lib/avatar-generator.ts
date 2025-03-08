import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';
import * as adventurerNeutral from '@dicebear/adventurer-neutral';
import * as avataaars from '@dicebear/avataaars';
import * as avataaarsNeutral from '@dicebear/avataaars-neutral';
import * as bottts from '@dicebear/bottts';
import * as initials from '@dicebear/initials';
import sharp from 'sharp';
import { AvatarGenerationOptions } from '../types';
import config from '../config';

// Validate the avatar size
function validateSize(size: number): number {
  if (size < 16) return 16; // Minimum size
  if (size > config.maxAvatarSize) return config.maxAvatarSize; // Maximum size
  return size;
}

// Get the style module for DiceBear
function getStyleModule(styleName: string): any {
  // Default to adventurer style
  if (!styleName || styleName === 'default') {
    styleName = 'adventurer';
  }
  
  // Map style names to their respective modules
  switch (styleName) {
    case 'adventurer':
      return adventurer;
    case 'adventurer-neutral':
      return adventurerNeutral;
    case 'avataaars':
      return avataaars;
    case 'avataaars-neutral':
      return avataaarsNeutral;
    case 'bottts':
      return bottts;
    case 'initials':
      return initials;
    default:
      // Fallback to adventurer if the style is not found
      console.warn(`Avatar style '${styleName}' not found, using adventurer as fallback`);
      return adventurer;
  }
}

/**
 * Generate an avatar SVG string
 */
export async function generateAvatarSvg(
  style: string,
  options: Record<string, any> = {},
  seed?: string
): Promise<string> {
  try {
    const styleModule = getStyleModule(style);
    
    // Clean the options by removing undefined/null values
    const cleanOptions = Object.entries(options)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    // Create the avatar using the @dicebear/core createAvatar function
    const avatar = createAvatar(styleModule, {
      seed: seed || Math.random().toString(),
      ...cleanOptions,
    });
    
    // Return the SVG string
    return avatar.toString();
  } catch (error) {
    console.error('Error generating avatar SVG:', error);
    throw new Error(`Failed to generate avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate an avatar in the requested format
 */
export async function generateAvatar(options: AvatarGenerationOptions): Promise<Buffer | string> {
  const { style, options: styleOptions, format, size = 128 } = options;
  
  // Validate size
  const validatedSize = validateSize(size);
  
  // Generate the SVG
  const svgString = await generateAvatarSvg(style, styleOptions);
  
  // Return SVG string directly if that's the requested format
  if (format === 'svg') {
    return svgString;
  }
  
  // Convert to PNG or WebP using Sharp
  const svgBuffer = Buffer.from(svgString);
  
  try {
    if (format === 'png') {
      return await sharp(svgBuffer)
        .resize(validatedSize, validatedSize)
        .png()
        .toBuffer();
    } else if (format === 'webp') {
      return await sharp(svgBuffer)
        .resize(validatedSize, validatedSize)
        .webp()
        .toBuffer();
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error(`Error converting SVG to ${format}:`, error);
    throw new Error(`Failed to convert avatar to ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a deterministic avatar for a user
 * This creates a consistent avatar based on the user ID
 */
export async function generateDeterministicAvatar(
  userId: string,
  style: string = 'adventurer',
  format: 'svg' | 'png' | 'webp' = 'svg',
  size: number = 128
): Promise<Buffer | string> {
  return generateAvatar({
    style,
    options: {},
    format,
    size,
  });
}