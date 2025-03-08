"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAvatarSvg = generateAvatarSvg;
exports.generateAvatar = generateAvatar;
exports.generateDeterministicAvatar = generateDeterministicAvatar;
const core_1 = require("@dicebear/core");
const adventurer = __importStar(require("@dicebear/adventurer"));
const adventurerNeutral = __importStar(require("@dicebear/adventurer-neutral"));
const avataaars = __importStar(require("@dicebear/avataaars"));
const avataaarsNeutral = __importStar(require("@dicebear/avataaars-neutral"));
const bottts = __importStar(require("@dicebear/bottts"));
const initials = __importStar(require("@dicebear/initials"));
const sharp_1 = __importDefault(require("sharp"));
const config_1 = __importDefault(require("../config"));
// Validate the avatar size
function validateSize(size) {
    if (size < 16)
        return 16; // Minimum size
    if (size > config_1.default.maxAvatarSize)
        return config_1.default.maxAvatarSize; // Maximum size
    return size;
}
// Get the style module for DiceBear
function getStyleModule(styleName) {
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
async function generateAvatarSvg(style, options = {}, seed) {
    try {
        const styleModule = getStyleModule(style);
        // Clean the options by removing undefined/null values
        const cleanOptions = Object.entries(options)
            .filter(([_, value]) => value !== undefined && value !== null)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        // Create the avatar using the @dicebear/core createAvatar function
        const avatar = (0, core_1.createAvatar)(styleModule, {
            seed: seed || Math.random().toString(),
            ...cleanOptions,
        });
        // Return the SVG string
        return avatar.toString();
    }
    catch (error) {
        console.error('Error generating avatar SVG:', error);
        throw new Error(`Failed to generate avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate an avatar in the requested format
 */
async function generateAvatar(options) {
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
            return await (0, sharp_1.default)(svgBuffer)
                .resize(validatedSize, validatedSize)
                .png()
                .toBuffer();
        }
        else if (format === 'webp') {
            return await (0, sharp_1.default)(svgBuffer)
                .resize(validatedSize, validatedSize)
                .webp()
                .toBuffer();
        }
        else {
            throw new Error(`Unsupported format: ${format}`);
        }
    }
    catch (error) {
        console.error(`Error converting SVG to ${format}:`, error);
        throw new Error(`Failed to convert avatar to ${format}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Generate a deterministic avatar for a user
 * This creates a consistent avatar based on the user ID
 */
async function generateDeterministicAvatar(userId, style = 'adventurer', format = 'svg', size = 128) {
    return generateAvatar({
        style,
        options: {},
        format,
        size,
    });
}
