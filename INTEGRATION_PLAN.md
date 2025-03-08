# DiceBear + Avatars Integration Plan

## Overview
This document outlines the strategy for integrating the Avatars service functionality into our DiceBear fork. The plan aims to create a unified application that preserves the Vue.js-based DiceBear editor while adding server-side capabilities for avatar storage, retrieval, and management.

## Goals

- Integrate Avatars functionality into DiceBear with minimal changes to DiceBear core
- Create a unified deployment model to simplify operations
- Maintain the ability to rebase from the upstream DiceBear repository
- Provide deterministic avatar generation based on user IDs
- Implement secure editing with token-based authentication
- Support avatar format conversion (SVG/PNG/WebP)

## Architecture

### Project Structure
```
/dicebear/
├── apps/
│   ├── editor/           # Existing Vue.js editor (minimal changes)
│   ├── docs/             # Existing docs app
│   └── server/           # NEW: Express server app
│       ├── src/
│       │   ├── api/           # API routes
│       │   ├── lib/           # Shared libraries
│       │   ├── middleware/    # Express middleware
│       │   └── index.ts       # Server entry point
│       ├── package.json
│       └── tsconfig.json
├── packages/            # Existing DiceBear packages
├── public/              # Static assets served by Express
│   └── editor/          # Built Vue.js editor output
└── package.json         # Root package.json with workspace config
```

### Key Components

1. **Express Server**
   - Serves both API endpoints and static files
   - Implements avatar generation, retrieval, and customization
   - Provides token-based security for editor access

2. **DiceBear Editor (Vue.js)**
   - Minimal modifications to support server-side saving
   - Addition of token handling and user context
   - Built to static files for serving by Express

3. **Unified Build Process**
   - Builds Vue.js editor to static files
   - Copies editor build to server's public directory
   - Builds and starts the Express server

## Implementation Plan

### Phase 1: Create Express Server App

1. **Create server package in DiceBear monorepo**
   - Set up Express with TypeScript
   - Implement static file serving from `/public`
   - Add basic health check routes

2. **Modify build process**
   - Update root `package.json` to include server in workspace
   - Create build script that builds editor and server

### Phase 2: Implement Core Avatars Functionality

3. **Database Layer**
   - Implement storage module with Redis support
   - Add local storage fallback for development
   - Port avatar preferences schema

4. **Avatar Generation APIs**
   - Create `/api/avatar/:userId` endpoint
   - Implement format conversion (SVG/PNG/WebP)
   - Add caching headers

5. **Security & Authentication**
   - Implement token generation and validation
   - Add middleware for security checks

### Phase 3: Editor Integration

6. **Minimal Editor Modifications**
   - Add save functionality that posts to API
   - Add token handling for authorization
   - Create user context integration

7. **Routing & Integration**
   - Set up Express routes to serve editor at `/editor/:userId`
   - Pass token and user context via URL params

### Phase 4: Testing & Deployment

8. **Unified Development Environment**
   - Create development script that runs both parts
   - Add hot-reloading support

9. **Production Build & Deployment**
   - Create production build script
   - Configure for deployment

## API Endpoints

The integrated application will expose the following APIs:

1. **Get Avatar**
   ```
   GET /api/avatar/:userId
   ```
   Query parameters:
   - `size`: Image size in pixels (default: 128)
   - `format`: Image format - svg, png, webp (default: svg)
   - `style`: Optional style override

2. **Save Avatar Preferences**
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

3. **Generate Edit Token (Protected)**
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
     "token": "generated-token",
     "editUrl": "http://example.com/editor/user-123?token=generated-token"
   }
   ```

## Future Rebasing Strategy

1. **Isolation of DiceBear Changes**
   - Keep changes to DiceBear editor minimal and isolated
   - Create a thin adapter layer in the editor that can be rebuilt
   - Document all changes made to DiceBear files

2. **Clean Directory Structure**
   - New server functionality stays in its own directory
   - Maintain clear boundaries between original and new code

3. **Component-based Architecture**
   - Use proper separation of concerns between components
   - Create interfaces between DiceBear and server

4. **When Rebasing from Upstream**
   - Pull upstream DiceBear changes
   - Rebuild adapter layer if needed
   - Update server to accommodate any API changes

## Security Considerations

- Token-based security for editor access
- One-time use tokens with expiration
- API key protection for token generation
- Proper validation of all inputs
- Secure headers and CORS configuration

## Technical Stack

- **Frontend**: Vue.js 3 (DiceBear Editor)
- **Backend**: Node.js with Express
- **Database**: Redis for production, in-memory for development
- **Image Processing**: Sharp for format conversion
- **Build Tools**: Vite for Vue, tsc for TypeScript compilation

This integration approach preserves the strengths of both systems while creating a unified, easy-to-deploy application.