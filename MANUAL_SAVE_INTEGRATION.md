# Manual Save Integration for DiceBear Editor

This document describes the implementation of manual save functionality for the DiceBear avatar editor. This replaces the previous auto-save functionality with a user-initiated save system.

## Implementation Overview

The updated implementation follows these key principles:

1. Changes to avatars are tracked but not automatically saved
2. The Save button is only enabled when there are unsaved changes
3. Visual indicators show when there are unsaved changes
4. Saving only occurs when the user explicitly clicks the Save button
5. Token consumption only happens on manual save operations

## Key Components Modified

### 1. SaveButton.vue
- Tracks the saved state of avatar configurations
- Detects unsaved changes by comparing current settings to saved state
- Visually indicates unsaved changes with an indicator
- Enables/disables the save button based on unsaved changes
- Only saves when the user explicitly clicks the button

### 2. App.vue
- Removed all auto-save functionality including timeouts and watchers
- No longer dispatches auto-save events

### 3. serverAdapter.ts
- Removed auto-save parameter from saveToServer function
- No longer sends X-Auto-Save header with requests

### 4. editor.ts (Server)
- Removed special handling for auto-save requests
- Always consumes tokens on save operations
- Maintains validateEditToken for GET requests only

## Testing the Manual Save Functionality

A test page is provided at the editor's public directory: `packages/dicebear/apps/editor/public/test-manual-save.html`.

### Testing Steps:

1. Start the server and editor:
   ```bash
   cd packages/dicebear/apps/server && npm run dev > ../../server.log 2>&1 &
   cd packages/dicebear/apps/editor && npm run dev > ../../editor.log 2>&1 &
   ```

2. Open http://localhost:5173/test-manual-save.html in your browser

3. Generate a test token by entering a user ID and clicking "Generate Token"

4. Click "Load Editor" to open the editor with the generated token

5. Verify the following behavior:
   - Initial state: Save button is disabled (gray)
   - Make changes to the avatar: Save button becomes enabled (yellow/orange) and "Unsaved changes" indicator appears
   - Click Save: Changes are persisted, button returns to disabled state, indicator disappears
   - Make more changes: Button becomes enabled again with indicator
   - Refresh the page and verify your last saved state is loaded, not the unsaved changes

## Implementation Details

### Change Detection
The system tracks changes by storing the last saved state (style name and serialized options). Any difference between current and saved state triggers the "unsaved changes" state.

### Visual Indicators
- Disabled save button: No unsaved changes
- Enabled save button (warning color): Unsaved changes present
- "Unsaved changes" text indicator: Appears when changes are pending

### Token Consumption
Tokens are now only consumed when the user explicitly saves changes, making more efficient use of tokens while still maintaining security.