import * as core from '@dicebear/core';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';
import * as adventurerNeutral from '@dicebear/adventurer-neutral';
import * as avataaars from '@dicebear/avataaars';
import * as avataaarsNeutral from '@dicebear/avataaars-neutral';
import * as bigEars from '@dicebear/big-ears';
import * as bigEarsNeutral from '@dicebear/big-ears-neutral';
import * as bigSmile from '@dicebear/big-smile';
import * as bottts from '@dicebear/bottts';
import * as botttsNeutral from '@dicebear/bottts-neutral';
import * as croodles from '@dicebear/croodles';
import * as croodlesNeutral from '@dicebear/croodles-neutral';
import * as dylan from '@dicebear/dylan';
import * as funEmoji from '@dicebear/fun-emoji';
import * as glass from '@dicebear/glass';
import * as icons from '@dicebear/icons';
import * as identicon from '@dicebear/identicon';
import * as initials from '@dicebear/initials';
import * as lorelei from '@dicebear/lorelei';
import * as loreleiNeutral from '@dicebear/lorelei-neutral';
import * as micah from '@dicebear/micah';
import * as miniavs from '@dicebear/miniavs';
import * as notionists from '@dicebear/notionists';
import * as notionistsNeutral from '@dicebear/notionists-neutral';
import * as openPeeps from '@dicebear/open-peeps';
import * as personas from '@dicebear/personas';
import * as pixelArt from '@dicebear/pixel-art';
import * as pixelArtNeutral from '@dicebear/pixel-art-neutral';
import * as rings from '@dicebear/rings';
import * as shapes from '@dicebear/shapes';
import * as thumbs from '@dicebear/thumbs';
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
  
  // Convert camelCase to kebab-case for style names like "bigSmile" to "big-smile"
  const kebabStyleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  
  // Map style names to their respective modules
  switch (kebabStyleName) {
    case 'adventurer':
      return adventurer;
    case 'adventurer-neutral':
      return adventurerNeutral;
    case 'avataaars':
      return avataaars;
    case 'avataaars-neutral':
      return avataaarsNeutral;
    case 'big-ears':
      return bigEars;
    case 'big-ears-neutral':
      return bigEarsNeutral;
    case 'big-smile':
      return bigSmile;
    case 'bottts':
      return bottts;
    case 'bottts-neutral':
      return botttsNeutral;
    case 'croodles':
      return croodles;
    case 'croodles-neutral':
      return croodlesNeutral;
    case 'dylan':
      return dylan;
    case 'fun-emoji':
      return funEmoji;
    case 'glass':
      return glass;
    case 'icons':
      return icons;
    case 'identicon':
      return identicon;
    case 'initials':
      return initials;
    case 'lorelei':
      return lorelei;
    case 'lorelei-neutral':
      return loreleiNeutral;
    case 'micah':
      return micah;
    case 'miniavs':
      return miniavs;
    case 'notionists':
      return notionists;
    case 'notionists-neutral':
      return notionistsNeutral;
    case 'open-peeps':
      return openPeeps;
    case 'personas':
      return personas;
    case 'pixel-art':
      return pixelArt;
    case 'pixel-art-neutral':
      return pixelArtNeutral;
    case 'rings':
      return rings;
    case 'shapes':
      return shapes;
    case 'thumbs':
      return thumbs;
    default:
      // Try to find a match by normalizing names
      const styleMap: Record<string, any> = {
        'adventurer': adventurer,
        'adventurerneutral': adventurerNeutral,
        'adventurer-neutral': adventurerNeutral, 
        'avataaars': avataaars,
        'avataaaars': avataaars,
        'avataarsneutral': avataaarsNeutral,
        'avataaars-neutral': avataaarsNeutral,
        'bigears': bigEars,
        'big-ears': bigEars,
        'bigearsneutral': bigEarsNeutral,
        'big-ears-neutral': bigEarsNeutral,
        'bigsmile': bigSmile,
        'big-smile': bigSmile,
        'smile': bigSmile,
        'bottts': bottts,
        'bots': bottts,
        'botttsneutral': botttsNeutral,
        'bottts-neutral': botttsNeutral,
        'croodles': croodles,
        'croodlesneutral': croodlesNeutral,
        'croodles-neutral': croodlesNeutral,
        'dylan': dylan,
        'funemoji': funEmoji,
        'fun-emoji': funEmoji,
        'emoji': funEmoji,
        'glass': glass,
        'glasses': glass,
        'icons': icons,
        'icon': icons,
        'identicon': identicon,
        'identicons': identicon,
        'initials': initials,
        'initial': initials,
        'lorelei': lorelei,
        'loreleineutral': loreleiNeutral,
        'lorelei-neutral': loreleiNeutral,
        'micah': micah,
        'miniavs': miniavs,
        'notionists': notionists,
        'notionistsneutral': notionistsNeutral,
        'notionists-neutral': notionistsNeutral,
        'openpeeps': openPeeps,
        'open-peeps': openPeeps,
        'peeps': openPeeps,
        'personas': personas,
        'pixelart': pixelArt,
        'pixel-art': pixelArt,
        'pixelartneutral': pixelArtNeutral,
        'pixel-art-neutral': pixelArtNeutral,
        'rings': rings,
        'shapes': shapes,
        'thumbs': thumbs,
      };
      
      // Normalize the style name by removing all non-alphanumeric characters and converting to lowercase
      const normalizedName = styleName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (styleMap[normalizedName]) {
        console.log(`Using normalized style name '${normalizedName}' for '${styleName}'`);
        return styleMap[normalizedName];
      }
      
      // Fallback to adventurer if the style is not found
      console.warn(`Avatar style '${styleName}' not found, using bottts as fallback`);
      return bottts;
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
    
    // Ensure options is an object and not an array
    let validOptions: Record<string, any> = {};
    
    if (options && typeof options === 'object' && !Array.isArray(options)) {
      validOptions = options;
    } else {
      console.warn(`Invalid options format provided: ${typeof options}, using empty object instead`);
    }
    
    // Debug output of options before cleaning
    console.log(`DEBUG: Raw options before cleaning:`, JSON.stringify(validOptions, null, 2));
    
    // Safely clean the options by removing undefined/null values and handling arrays
    const cleanOptions: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(validOptions)) {
      // Skip undefined or null values
      if (value === undefined || value === null) continue;
      
      // If value is an array, make a copy to avoid modifying the original
      if (Array.isArray(value)) {
        // Filter out any undefined/null entries from the array
        cleanOptions[key] = value.filter(item => item !== undefined && item !== null);
      } else {
        cleanOptions[key] = value;
      }
    }
    
    console.log(`Creating avatar with style "${style}", seed "${seed || Math.random().toString()}", cleaned options:`, JSON.stringify(cleanOptions));
    
    // Create the avatar using the @dicebear/core createAvatar function
    // Use a try/catch specifically for the avatar creation
    try {
      // Prepare sanitized options - fix the backgroundColor format
      let sanitizedOptions: Record<string, any> = {};
      
      // Set the seed
      sanitizedOptions.seed = seed || Math.random().toString();
      
      // Only add non-empty options and ensure colors have # prefix
      for (const [key, value] of Object.entries(cleanOptions)) {
        // Skip empty values
        if (value === '' || value === null || value === undefined) {
          continue;
        }
        
        // Handle color values - add # prefix if needed
        const colorProps = ['backgroundColor', 'hairColor', 'skinColor', 'glassesColor', 'clothesColor',
                          'background', 'eyes', 'mouth', 'base', 'clothes', 'face', 'hair', 'accessory'];
      
        if (colorProps.includes(key) && 
            typeof value === 'string' && value.trim() !== '' && !value.startsWith('#') &&
            /^[0-9a-fA-F]{3,6}$/.test(value)) {
          // Only add # if it looks like a hex color
          sanitizedOptions[key] = `#${value}`;
          console.log(`DEBUG: Added # prefix to color value for ${key}: ${value} -> ${sanitizedOptions[key]}`);
        } else {
          sanitizedOptions[key] = value;
        }
      }
      
      // Log the options we're using
      console.log(`DEBUG: Using sanitized options for ${style}:`, JSON.stringify(sanitizedOptions, null, 2));
      
      // Create avatar with DiceBear API
      const avatar = createAvatar(styleModule, sanitizedOptions);
      const svgString = avatar.toString();
      console.log(`Generated SVG (${svgString.length} chars)`);
      return svgString;
    } catch (createError) {
      console.error(`Error in avatar creation:`, createError);
      
      // Try again with minimal options - just the seed
      try {
        console.log(`Retrying with only seed for style "${style}"`);
        
        const avatar = createAvatar(styleModule, {
          seed: seed || Math.random().toString()
        });
        const svgString = avatar.toString();
        return svgString;
      } catch (retryError) {
        throw new Error(`Failed on retry: ${retryError instanceof Error ? retryError.message : 'unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error generating avatar SVG:', error);
    // Return a fallback SVG with error message
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#f8d7da"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="16">Error generating avatar</text>
      <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#721c24" font-size="12">${error instanceof Error ? error.message : 'Unknown error'}</text>
    </svg>`;
    return errorSvg;
  }
}

/**
 * Generate an avatar in the requested format
 */
export async function generateAvatar(options: AvatarGenerationOptions): Promise<Buffer | string> {
  const { style, options: styleOptions, format, size = 128, seed } = options;
  
  // Validate size
  const validatedSize = validateSize(size);
  
  // Ensure styleOptions is an object and not something else
  // This fixes the "arr.sort is not a function" error
  const validStyleOptions = typeof styleOptions === 'object' && styleOptions !== null 
    ? styleOptions 
    : {};
    
  console.log('Avatar options:', { style, format, size, seed: seed || 'random', styleOptions: validStyleOptions });
  
  // Generate the SVG with the seed if provided
  const svgString = await generateAvatarSvg(style, validStyleOptions, seed);
  
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
  // Use the userId as the seed to ensure consistency
  return generateAvatar({
    style,
    options: {},
    format,
    size,
    seed: userId // This ensures the avatar is always the same for a given userId
  });
}