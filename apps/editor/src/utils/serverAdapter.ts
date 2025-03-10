import { SelectedStyleOptions } from '../types';

/**
 * Extract user ID and token from URL
 * Format: /editor/:userId?token=xxx
 */
export function extractUserContext(): { 
  userId: string | null; 
  token: string | null;
} {
  // Get the URL path and search params  
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  
  // Extract userId from path
  const matches = path.match(/\/editor\/([^/]+)/);
  let userId = matches ? matches[1] : null;
  
  // Extract token from query params
  const token = params.get('token');

  return { userId, token };
}

/**
 * Check if we have a valid user context with token
 */
export function hasUserContext(): boolean {
  const { userId, token } = extractUserContext();
  return Boolean(userId && token);
}

/**
 * Save avatar preferences to the server
 * @param style The avatar style to save
 * @param options The avatar options to save
 */
export async function saveToServer(
  style: string,
  options: SelectedStyleOptions,
): Promise<{ success: boolean; message?: string }> {
  const { userId, token } = extractUserContext();

  console.log('SaveToServer called with:', {
    style,
    optionsType: typeof options,
    optionsIsArray: Array.isArray(options),
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    userId
  });
  
  if (!userId || !token) {
    console.error('Missing user ID or token:', { userId, hasToken: !!token });
    return {
      success: false,
      message: 'Missing user ID or token',
    };
  }
  
  // Ensure options is not an array to prevent server-side error
  const cleanedOptions = Array.isArray(options) ? {} : options;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Prepare payload with additional logging
    const payload = {
      token,
      style,
      options: cleanedOptions,
    };
    
    console.log(`Sending save request to /api/editor/${userId} with payload:`, {
      style,
      tokenProvided: !!payload.token,
      optionsType: typeof payload.options
    });
    
    console.log('Network request about to be sent:', {
      url: `/api/editor/${userId}`,
      method: 'POST',
      headers,
      payload: {
        token: payload.token ? `${payload.token.substring(0, 5)}...` : null,
        style: payload.style,
        optionsPresent: !!payload.options
      }
    });
    
    // Determine the API URL - use the server's port directly
    // When testing locally the editor runs on 5173 but the server runs on 3001
    const serverBaseUrl = 'http://localhost:3001';
    const apiUrl = `${serverBaseUrl}/api/editor/${userId}`;
    
    console.log(`Using API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    console.log('Save response details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()]),
      type: response.type,
      url: response.url,
      redirected: response.redirected,
      bodyUsed: response.bodyUsed
    });
    
    // Always clone the response before trying to read its body
    const responseClone = response.clone();
    let responseText = '';
    
    try {
      // Get the raw text regardless of status code
      responseText = await responseClone.text();
      console.log('Raw response text:', responseText);
    } catch (textError) {
      console.error('Failed to read response text:', textError);
      responseText = '';
    }
    
    if (!response.ok) {
      let errorData = { error: `Server error (${response.status})` };
      
      // Try to parse error as JSON if we have response text
      if (responseText) {
        try {
          errorData = JSON.parse(responseText);
          console.error('Server returned error:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          // Keep the default error if parsing fails
        }
      }
      
      // Detailed error message with status code
      return {
        success: false,
        message: errorData.error || `Server error (${response.status}): ${responseText || 'No details provided'}`,
      };
    }
    
    // If response is OK but empty, still treat as success
    if (responseText.trim() === '') {
      console.log('Server returned empty response with OK status, treating as success');
      return {
        success: true,
        message: 'Avatar saved successfully',
      };
    }
    
    // Try to parse success response as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Save successful, server response:', data);
      return {
        success: true,
        message: data.message || 'Avatar saved successfully',
      };
    } catch (parseError) {
      console.error('Failed to parse success response:', parseError, 'Raw response:', responseText);
      
      // If we have a non-empty response but it's not JSON, still treat as success in this case
      // since the server returned a 200-range status code
      if (responseText.trim() !== '') {
        console.log('Response is not JSON but status is OK, treating as success');
        return {
          success: true,
          message: 'Avatar saved successfully',
        };
      }
      
      return { 
        success: false, 
        message: 'Failed to parse server response' 
      };
    }
  } catch (error) {
    console.error('Network or unexpected error saving avatar:', error);
    return {
      success: false,
      message: error instanceof Error 
        ? `Save error: ${error.message}` 
        : 'Unknown error while saving avatar',
    };
  }
}

/**
 * Load avatar preferences from the server
 */
export async function loadFromServer(): Promise<{
  success: boolean;
  message?: string;
  data?: {
    style: string;
    options: SelectedStyleOptions;
  }
}> {
  const { userId, token } = extractUserContext();
  
  if (!userId || !token) {
    return {
      success: false,
      message: 'Missing user ID or token',
    };
  }
  
  // Determine the API URL - use the server's port directly
  // When testing locally the editor runs on 5173 but the server runs on 3001
  const serverBaseUrl = 'http://localhost:3001';
  let url = `${serverBaseUrl}/api/editor/${userId}`;
  url += `?token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      // Special case for 404 (no preferences yet)
      if (response.status === 404) {
        return {
          success: true,
          message: 'No saved preferences found',
          data: undefined
        };
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        message: errorData.error || `Server error: ${response.status}`,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Avatar preferences loaded successfully',
      data: {
        style: data.style,
        options: data.options
      }
    };
  } catch (error) {
    console.error('Error loading avatar preferences:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Show a notification
 */
export function showNotification(
  message: string,
  type: 'success' | 'error' = 'success',
  duration: number = 3000
): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '4px';
  notification.style.color = 'white';
  notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '9999';
  notification.style.transition = 'all 0.3s ease';
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after duration
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, duration);
}