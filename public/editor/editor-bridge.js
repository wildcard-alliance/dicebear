/**
 * DiceBear Editor Bridge Script
 * 
 * This script establishes communication between the editor and the server.
 * It sets up global variables and event listeners for the editor to access.
 */

(function() {
  // Get editor parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Extract userId from path: /editor/:userId
  const pathParts = window.location.pathname.split('/');
  const userId = pathParts[pathParts.length - 1];
  const style = urlParams.get('style') || '';
  
  // Setup global variables for the editor
  window.DICEBEAR_EDITOR = {
    userId: userId,
    token: token,
    apiUrl: '/api',
    initialStyle: style
  };
  
  // Also keep avatarBridge for backwards compatibility
  window.avatarBridge = {
    userId: userId,
    token: token,
    
    // Check if we have valid authentication
    isAuthenticated: function() {
      return !!this.userId && !!this.token;
    },
    
    // Load preferences from API
    loadPreferences: async function() {
      if (!this.isAuthenticated()) {
        console.error('Not authenticated');
        return null;
      }
      
      try {
        const response = await fetch(`/api/avatar/${this.userId}`);
        if (!response.ok) {
          throw new Error(`Failed to load: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Notify that preferences are loaded
        window.dispatchEvent(new CustomEvent('dicebear:preferences-loaded', { detail: data }));
        
        return data;
      } catch (error) {
        console.error('Error loading preferences:', error);
        return null;
      }
    },
    
    // Save preferences to API
    savePreferences: async function(style, options) {
      if (!this.isAuthenticated()) {
        console.error('Not authenticated');
        return false;
      }
      
      try {
        const response = await fetch(`/api/editor/${this.userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            style: style,
            options: options
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Notify that preferences were saved
        window.dispatchEvent(new CustomEvent('dicebear:preferences-saved', { detail: data }));
        
        return data.success;
      } catch (error) {
        console.error('Error saving preferences:', error);
        return false;
      }
    }
  };
  
  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Avatar Bridge initialized for user:', window.avatarBridge.userId);
    
    // Add authentication status indicator if not already present
    if (!document.getElementById('status-badge')) {
      const statusDiv = document.createElement('div');
      statusDiv.id = 'status-badge-auth';
      statusDiv.style.position = 'fixed';
      statusDiv.style.bottom = '10px';
      statusDiv.style.right = '10px';
      statusDiv.style.padding = '8px 12px';
      statusDiv.style.backgroundColor = window.avatarBridge.isAuthenticated() ? '#28a745' : '#dc3545';
      statusDiv.style.color = 'white';
      statusDiv.style.borderRadius = '4px';
      statusDiv.style.fontSize = '12px';
      statusDiv.style.zIndex = '9999';
      statusDiv.textContent = window.avatarBridge.isAuthenticated() ? 'Authenticated' : 'Not Authenticated';
      
      // Add to body when it's available
      if (document.body) {
        document.body.appendChild(statusDiv);
      } else {
        window.addEventListener('load', () => {
          document.body.appendChild(statusDiv);
        });
      }
    }
  });
})();
