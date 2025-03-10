# Dicebear (Forked) Package

## Overview
This package is a fork of the open source Dicebear package. This project combines the DiceBear avatar library with server-side avatar management capabilities, providing a full-featured avatar generation and customization solution.

### What is Dicebear?
This is copied from the DiceBear README:

With DiceBear you can create awesome avatars for your project in no time. Whether you are looking for abstract shapes or lovingly designed characters, you will find something suitable among our avatar styles. And no matter how and for what you want to use the avatars, DiceBear offers the right solution!

In addition to purely random avatars, you can also create deterministic avatars for user identities. With the built-in PRNG you create the same avatar over and over again based on a seed. But also individual avatars are possible! Just use the countless options that each avatar style provides.

And thanks to the JavaScript library, HTTP API, CLI, Figma plugin, Editor and Playground, your next avatar is always just a stone's throw away!

## Features

- 🎭 Generate deterministic avatars based on user IDs
- 🎨 Web-based avatar editor for customization 
- 🔒 Secure editing with token-based authentication
- 💾 Persistent storage of avatar preferences
- ⚡ Fast, on-demand avatar generation with caching
- 🖼️ Multiple output formats (SVG, PNG, WebP)

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn 
- Redis (optional, for production)

### Installation

```bash
# Install dependencies for both server and editor components
cd packages/dicebear/apps/server && npm install --force
cd packages/dicebear/apps/editor && npm install --force

# Install avatar style modules for the server
cd packages/dicebear/apps/server && npm install @dicebear/core @dicebear/adventurer @dicebear/bottts --force
```

### Development

Since the package is part of a monorepo, you need to start the editor and server components individually:

```bash
# Start the server (in one terminal)
cd packages/dicebear/apps/server && npm run dev

# Start the editor (in another terminal)
cd packages/dicebear/apps/editor && npm run dev
```

This starts:
- DiceBear Editor on http://localhost:5173
- API Server on http://localhost:3000

For background running (as per Smarty Pants development rules):

```bash
# Start the server in the background
cd packages/dicebear/apps/server && npm run dev > ../../server.log 2>&1 &

# Start the editor in the background
cd packages/dicebear/apps/editor && npm run dev > ../../editor.log 2>&1 &

# Check logs with
cat packages/dicebear/server.log
cat packages/dicebear/editor.log
```

### Environment Setup

Before starting the server, create a `.env` file in the server directory:

```bash
# Create the .env file from the template in the troubleshooting section
cd packages/dicebear/apps/server
cat > .env << EOF
# Server configuration
PORT=3000
BASE_URL=http://localhost:3000

# Security
API_KEY=test-api-key-1234

# Environment
NODE_ENV=development

# Token configuration
TOKEN_EXPIRY_SECONDS=3600

# CORS
CORS_ENABLED=true

# Avatar generation
MAX_AVATAR_SIZE=1024
EOF
```

### Production Build

Build the integrated application:

```bash
npm run build:integrated
```

This:
1. Builds the DiceBear editor
2. Copies it to the public directory
3. Builds the server

### Running in Production

Start the production server:

```bash
npm run start
```

The server will be available at http://localhost:3000 (or the port specified in your environment).

### Troubleshooting

#### Common Issues

1. **Missing Modules/Dependencies**: Install dependencies for each component using the '--force' flag:

```bash
# For server component
cd packages/dicebear/apps/server
npm install --force

# For editor component
cd packages/dicebear/apps/editor
npm install --force
```

2. **Avatar Generation Issues**: Make sure all required style modules are installed:

```bash
cd packages/dicebear/apps/server
npm install @dicebear/core @dicebear/adventurer @dicebear/bottts --force
```

3. **PrimeVue Component Warnings**: The editor may show console warnings about unresolved PrimeVue components (ProgressSpinner, Dialog, Button). These warnings don't affect core functionality.

4. **Missing Test Page**: The test page reference (http://localhost:3000/test-avatar.html) might return a 404 error if not set up. This doesn't affect the editor's functionality.

#### Verifying the Installation

To test if the integration is working correctly:

1. Start both the server and editor components as described above
2. Navigate to http://localhost:5173/ to access the editor interface
3. You should see the avatar editor UI with various styles to select and customize

The editor interface should show customization tabs for Style, Background Color, Earrings, Eyebrows, Eyes, Features, Glasses, Hair, and Hair Color.

## Testing

Run the integration test script:

```bash
npm run test:integration
```

This will:
1. Check if the server is running
2. Generate a test user and token
3. Test avatar generation 
4. Provide a URL to test the editor integration

## API Endpoints

### Get Avatar

```
GET /api/avatar/:userId
```

Query parameters:
- `size`: Image size in pixels (default: 128)
- `format`: Image format - svg, png, webp (default: svg)
- `style`: Optional style override

### Generate Edit Token (Protected)

```
POST /api/auth/token
```

Headers:
```
X-API-Key: your-api-key
```

Request body:
```json
{
  "userId": "user-123"
}
```

Response:
```json
{
  "success": true,
  "token": "generated-token",
  "editUrl": "http://example.com/editor/user-123?token=generated-token"
}
```

### Save Avatar Preferences (Token Required)

```
POST /api/editor/:userId
```

Request body:
```json
{
  "token": "required-security-token",
  "style": "avataaars",
  "options": {
    "backgroundColor": "#e0e0e0",
    "...": "other style-specific options"
  }
}
```

## Configuration

Create a `.env` file based on the provided `.env.example`:

```
# Server configuration
PORT=3000
BASE_URL=http://localhost:3000

# Security
API_KEY=your-secure-api-key-here

# Database
REDIS_URL=redis://localhost:6379

# Environment
NODE_ENV=development

# Token configuration
TOKEN_EXPIRY_SECONDS=3600

# CORS
CORS_ENABLED=true

# Avatar generation
MAX_AVATAR_SIZE=1024
```

## Architecture

This project integrates:
- DiceBear editor (Vue.js)
- Express server for API endpoints
- Redis (or in-memory) storage for user preferences

The editor is compiled to static files and served by the Express server, creating a unified application.

## Security

- Token-based authentication for avatar editing
- API key protection for admin endpoints
- One-time use tokens with expiration
- Proper validation of all inputs

## Running Tools
You can run any monorepo tool from within this package directory using npm:

```bash
# Run a tool from the dicebear package directory
npm run tool -- <tool-name> [arguments]

# Examples:
npm run tool -- query vercel "What is Edge Config?"
npm run tool -- browser-use "Look up avatar generation examples"
npm run tool -- perplexity "Latest DiceBear versions"
```

The tool system automatically detects that you're in the dicebear package and ensures proper context is preserved. This is the same syntax used at the monorepo root.