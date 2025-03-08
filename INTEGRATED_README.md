# DiceBear Integrated Avatar Service

This project combines the DiceBear avatar library with server-side avatar management capabilities, providing a full-featured avatar generation and customization solution.

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
# Install dependencies
npm install
```

### Development

Run both the editor and server in development mode:

```bash
npm run dev
```

This starts:
- DiceBear Editor on http://localhost:3001
- API Server on http://localhost:3000

You can also run them separately:

```bash
# Run only the server
npm run dev:server

# Run only the editor
npm run dev:editor
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

If you encounter build issues, you can install and start components individually:

```bash
# For server issues
cd apps/server
npm install --force
npm run dev

# For editor issues
cd apps/editor
npm install --force
npm run dev
```

For avatar generation issues, make sure all required style modules are installed:

```bash
cd apps/server
npm install @dicebear/core @dicebear/adventurer @dicebear/bottts --force
```

A test page is available at http://localhost:3000/test-avatar.html to verify avatar generation capability.

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

## License

MIT