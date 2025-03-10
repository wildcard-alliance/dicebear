# Avatar Persistence Integration

This document outlines the implementation of automatic avatar persistence for the DiceBear editor. This feature enables users to have their avatar customizations automatically saved to the server without requiring manual intervention.

## Implementation Overview

The avatar persistence feature has been integrated into the default editor page with the following components:

1. **Auto-save functionality**: Changes to the avatar are automatically saved after 2 seconds of inactivity
2. **Manual save functionality**: Users can still manually save their changes using the Save button
3. **Server-side token handling**: Tokens are validated but not consumed for auto-save requests
4. **Visual feedback**: Users receive visual confirmation when auto-save occurs

## System Components

### Client-side Components

1. **App.vue**: 
   - Detects when a user has authentication context (userId + token)
   - Sets up auto-save functionality that monitors changes to avatar options
   - Dispatches custom 'dicebear:auto-save' events after period of user inactivity

2. **SaveButton.vue**:
   - Implements both manual save and auto-save functionality
   - Provides visual feedback during save operations
   - Displays an "Auto-saved" badge when auto-save completes
   - Handles error conditions with retry logic

3. **serverAdapter.ts**:
   - Adds `isAutoSave` parameter to differentiate between manual and automatic saves
   - Sets appropriate headers for auto-save requests to prevent token consumption

### Server-side Components

1. **editor.ts (API endpoints)**:
   - Handles auto-save requests without consuming one-time tokens
   - Added `x-auto-save` header detection to determine request type
   - Validates tokens without consuming them for auto-save and GET operations

2. **db.ts**:
   - Added `validateEditToken` function for non-consuming token validation
   - Maintains existing `validateAndConsumeEditToken` for manual saves

## How It Works

1. When a user loads the editor page with a valid token:
   - The system checks for authentication context (userId + token)
   - Auto-save monitoring is enabled if context is found

2. As the user makes changes to their avatar:
   - A timer starts/resets after each change
   - After 2 seconds of inactivity, an auto-save event triggers

3. During auto-save:
   - The current avatar style and options are sent to the server
   - The request includes an `x-auto-save: true` header
   - The server validates the token but doesn't consume it
   - A subtle "Auto-saved" indicator briefly appears

4. If the user manually clicks Save:
   - The token is validated AND consumed (one-time use)
   - A more prominent success notification appears

## Testing

A test page has been created at `/test-avatar-persistence.html` to demonstrate and test the persistence functionality:

1. Generate a token for a test user
2. Open the editor with that token and make changes
3. Changes are automatically saved as you modify the avatar
4. Return to the test page and refresh to see that changes persist

## Technical Design Decisions

1. **Token Consumption**:
   - Tokens are not consumed during auto-save to allow for continuous editing
   - Manual saves still consume tokens for compatibility with existing flows

2. **Error Handling**:
   - Auto-save attempts are silently retried before showing errors to users
   - After multiple failures, users are notified of persistence issues

3. **Visual Feedback**:
   - Minimal UI interruption for auto-saves to avoid disrupting the user experience
   - Clear success/error states for manual saves

## Future Enhancements

Potential improvements for the avatar persistence feature:

1. Implement conflict resolution for simultaneous edits
2. Add offline support with local storage fallback
3. Add version history/undo functionality
4. Improve error recovery mechanisms