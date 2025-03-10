# Testing Avatar Persistence Feature

This document outlines how to test the newly implemented avatar persistence feature in the DiceBear package.

## Setup Instructions

1. First, ensure both the server and editor components are running:

```bash
# Terminal 1: Start the server
cd packages/dicebear/apps/server
npm run dev

# Terminal 2: Start the editor
cd packages/dicebear/apps/editor
npm run dev
```

2. The server should be available at http://localhost:3000
3. The editor should be available at http://localhost:5174

## Test Cases

### 1. Anonymous User Persistence

This test verifies that anonymous users (no login) can have their avatar preferences saved and retrieved.

#### Steps:
1. Navigate to http://localhost:5174/test-avatar-persistence.html
2. Click "Open Anonymous Editor" button
3. Customize your avatar in the opened editor
4. Wait 2 seconds for auto-save to trigger (you should see "Auto-saved" indicator briefly appear)
5. Close the editor tab
6. Reopen the editor by clicking "Open Anonymous Editor" again
7. Verify that your previous customizations are loaded

#### Expected Results:
- The auto-save indicator should appear after making changes
- When reopening the editor, previous customizations should be loaded automatically
- The anonymous ID should be consistent between sessions (check in the test page)

### 2. Authenticated User Flow

This test verifies the token-based authentication flow.

#### Steps:
1. Navigate to http://localhost:5174/test-avatar-persistence.html
2. In the "Test Auth Token Generation" section, enter:
   - API Key: `test-api-key-1234` (or as configured in .env)
   - User ID: any test ID (e.g., `test-user-1`)
3. Click "Generate Token"
4. Click "Open Editor with Token" on the result
5. Customize your avatar in the opened editor
6. Wait for auto-save to trigger
7. Close the editor tab
8. Generate a new token for the same user ID
9. Open the editor again with the new token
10. Verify that your previous customizations are loaded

#### Expected Results:
- Token generation should succeed
- Auto-save should work in authenticated mode
- When reopening with a new token for the same user, previous customizations should load

### 3. Manual Save Button

This test verifies that the manual save button works correctly.

#### Steps:
1. Navigate to http://localhost:5174/test-avatar-persistence.html
2. Open either anonymous or authenticated editor
3. Make changes to your avatar
4. Instead of waiting for auto-save, click the "Save" button
5. Verify that a success notification appears
6. Close and reopen the editor
7. Verify that your changes were saved

#### Expected Results:
- The save button should be visible in the editor header
- Clicking it should show a loading state and then a success notification
- Changes should persist when reopening the editor

### 4. Error Handling

This test verifies that errors are handled gracefully.

#### Steps:
1. Stop the server component (Ctrl+C in the server terminal)
2. Open the editor and make changes
3. Try to save (either manually or via auto-save)
4. Verify that an error message appears
5. Restart the server
6. Try saving again
7. Verify that saving now succeeds

#### Expected Results:
- When the server is unavailable, the editor should show an error message
- When the server becomes available again, saving should work

## Advanced Testing

### Test with Network Throttling

1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Test auto-save functionality
5. Verify that saving still works (may take longer)

### Test Persistence Between Browsers

1. Save avatar preferences in one browser
2. Using the anonymous ID from the test page, construct a direct link to the avatar API:
   ```
   http://localhost:3000/api/avatar/{anonymousId}?size=200
   ```
3. Open this link in a different browser
4. Verify that the avatar is rendered correctly with your customizations

## Troubleshooting

If you encounter issues:

1. Check server logs for errors
2. Verify that the API key in your .env file matches what you're using for testing
3. Check browser console for JavaScript errors
4. Clear browser localStorage if you want to reset anonymous user testing
   - In Chrome DevTools: Application tab → Local Storage → Clear
   - In Firefox DevTools: Storage tab → Local Storage → Clear