import { SelectedStyleOptions } from '../types';

/**
 * Extract user ID and token from URL
 * Format: /editor/:userId?token=xxx
 */
export function extractUserContext(): { userId: string | null; token: string | null } {
  // Get the URL path and search params
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  
  // Extract userId from path
  const matches = path.match(/\/editor\/([^/]+)/);
  const userId = matches ? matches[1] : null;
  
  // Extract token from query params
  const token = params.get('token');
  
  return { userId, token };
}

/**
 * Check if we're in server mode with a valid user context
 */
export function isServerMode(): boolean {
  const { userId, token } = extractUserContext();
  return Boolean(userId && token);
}

/**
 * Save avatar preferences to the server
 */
export async function saveToServer(
  style: string,
  options: SelectedStyleOptions
): Promise<{ success: boolean; message?: string }> {
  const { userId, token } = extractUserContext();
  
  if (!userId || !token) {
    return {
      success: false,
      message: 'Missing user context or token',
    };
  }
  
  try {
    const response = await fetch(`/api/editor/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        style,
        options,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.error || `Server error: ${response.status}`,
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Avatar saved successfully',
    };
  } catch (error) {
    console.error('Error saving avatar:', error);
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