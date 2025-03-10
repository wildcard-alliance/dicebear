# Avatar Persistence Integration Plan

## Current Implementation Status

After reviewing the codebase, I can see that avatar persistence is already well-implemented with both server-side and client-side components:

### Server-Side (packages/dicebear/apps/server)
- API endpoints for saving and retrieving avatar preferences
- Support for both anonymous and authenticated users
- Token-based security for authenticated users

### Client-Side (packages/dicebear/apps/editor)
- `serverAdapter.ts` handles communication with the server
- User context extraction from URL parameters or localStorage
- Auto-save functionality in App.vue
- Manual save button component

## Integration Plan

The good news is that avatar persistence is already integrated in the main editor. Here's how it works:

1. **Anonymous Users**:
   - When a user visits the editor without a userId/token in the URL
   - The system generates a unique ID stored in localStorage
   - Auto-save sends changes to the server using this anonymous ID
   - Preferences are retrieved using the same ID on future visits

2. **Authenticated Users**:
   - Requires a token generated via the `/api/auth/token` endpoint
   - Users access the editor via a URL with userId and token parameters
   - Changes are auto-saved with token-based authentication
   - Preferences are securely tied to the actual user account

## Testing

I've created a test page at `packages/dicebear/apps/editor/public/test-avatar-persistence.html` that can be accessed at http://localhost:5174/test-avatar-persistence.html when the editor is running.

This test page allows you to:
- Test anonymous mode
- Verify auto-save functionality 
- Test token generation and authenticated editing
- View saved avatars

## Recommended Adjustments

While the persistence functionality is already implemented, here are some possible improvements:

1. **URL Path Handling**:
   - The `extractUserContext` function in serverAdapter.ts looks for "/editor/" in the path
   - Consider updating this to handle different base paths if needed

2. **Error Handling**:
   - Add more specific error messages for different failure scenarios
   - Implement retry logic for network failures

3. **Cross-Origin Considerations**:
   - If the server and editor are on different domains, update API URLs in serverAdapter.ts
   - Enable CORS on the server if needed

4. **Performance Optimization**:
   - Consider implementing debounce for auto-save to reduce server load
   - Add client-side caching to reduce duplicate save requests

## Implementation Checklist

✅ Server API endpoints for avatar persistence  
✅ Client-side adapter for server communication  
✅ Anonymous user identification system  
✅ Auto-save functionality  
✅ Manual save button  
✅ Token-based authentication  
✅ Test page for verification  

## Next Steps

1. Test the persistence functionality using the test page
2. Review error handling and edge cases
3. Consider implementing the recommended adjustments if needed
4. Document the persistence features for end-users