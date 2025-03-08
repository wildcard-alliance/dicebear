#!/bin/bash
set -e

# Set directories
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/public/editor"
LOG_FILE="$ROOT_DIR/editor-build.log"

# Clean previous editor
echo "Starting editor build at $(date)" > "$LOG_FILE"
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR"

# Create the simplified editor
echo "Creating simplified editor..." | tee -a "$LOG_FILE"

# Create editor bridge
cat > "$PUBLIC_DIR/editor-bridge.js" << 'EOF'
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
EOF

# Create a basic HTML editor
cat > "$PUBLIC_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DiceBear Avatar Editor</title>
  <script src="editor-bridge.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #212121;
      background-color: #f4f7fc;
    }
    
    #app {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background-color: #4272d7;
      color: white;
      padding: 16px 20px;
      text-align: center;
    }
    
    .preview {
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      background-color: #4272d7;
    }
    
    .preview-image {
      max-width: 250px;
      max-height: 250px;
      background-color: white;
      border-radius: 16px;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }
    
    .options {
      flex: 1;
      padding: 20px;
      background-color: white;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      margin-top: -20px;
      position: relative;
      z-index: 1;
      box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.05);
    }
    
    .tabs-nav {
      display: flex;
      overflow-x: auto;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 20px;
      padding-bottom: 10px;
    }
    
    .tab-button {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 8px 16px;
      margin-right: 10px;
      cursor: pointer;
      font-weight: 600;
      color: #757575;
    }
    
    .tab-button.active {
      color: #4272d7;
      border-bottom-color: #4272d7;
    }
    
    .option-group {
      margin-bottom: 24px;
    }
    
    .option-label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #424242;
    }
    
    .option-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      color: #212121;
      background-color: #f9f9f9;
    }
    
    .color-picker {
      width: 100%;
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f9f9f9;
    }
    
    .option-row {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    
    .option-col {
      flex: 1;
    }
    
    .btn {
      padding: 10px 20px;
      background-color: #4272d7;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn:hover {
      background-color: #3563c8;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #757575;
    }
    
    .status-badge {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background-color: #4CAF50;
      color: white;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 12px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .loader {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-left: 10px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="header">
      <h1>DiceBear Avatar Editor</h1>
    </div>
    
    <div class="preview">
      <img id="preview-image" class="preview-image" src="" alt="Avatar preview">
    </div>
    
    <div class="options">
      <div class="tabs-nav">
        <button id="tab-style" class="tab-button active">Style</button>
        <button id="tab-options" class="tab-button">Options</button>
      </div>
      
      <div id="tab-content-style" class="tab-content">
        <div class="option-group">
          <label class="option-label">Avatar Style</label>
          <select id="style-selector" class="option-control">
            <option value="adventurer">Adventurer</option>
            <option value="adventurer-neutral">Adventurer Neutral</option>
            <option value="avataaars">Avataaars</option>
            <option value="avataaars-neutral">Avataaars Neutral</option>
            <option value="big-ears">Big Ears</option>
            <option value="big-ears-neutral">Big Ears Neutral</option>
            <option value="bottts">Bottts</option>
            <option value="croodles">Croodles</option>
            <option value="micah">Micah</option>
            <option value="pixel-art">Pixel Art</option>
          </select>
        </div>
      </div>
      
      <div id="tab-content-options" class="tab-content" style="display: none;">
        <div class="option-row">
          <div class="option-col">
            <div class="option-group">
              <label class="option-label">Background Color</label>
              <input type="color" id="bg-color" class="color-picker" value="#ffffff">
            </div>
          </div>
          <div class="option-col">
            <div class="option-group">
              <label class="option-label">Random Seed</label>
              <input type="text" id="seed" class="option-control" placeholder="Leave empty for random">
            </div>
          </div>
        </div>
        
        <div id="style-specific-options" class="style-options">
          <!-- Dynamic options will be generated here -->
        </div>
      </div>
      
      <button id="save-button" class="btn">Save Avatar</button>
    </div>
    
    <div class="footer">
      Powered by DiceBear
    </div>
    
    <div id="status-badge" class="status-badge" style="display: none;">
      Saving... <span class="loader"></span>
    </div>
  </div>

  <script>
    // Avatar styles and their options
    const styles = {
      'adventurer': {
        backgroundColor: true,
        seed: true
      },
      'adventurer-neutral': {
        backgroundColor: true,
        seed: true
      },
      'avataaars': {
        backgroundColor: true,
        seed: true
      },
      'avataaars-neutral': {
        backgroundColor: true,
        seed: true
      },
      'big-ears': {
        backgroundColor: true,
        seed: true
      },
      'big-ears-neutral': {
        backgroundColor: true,
        seed: true
      },
      'bottts': {
        backgroundColor: true,
        seed: true
      },
      'croodles': {
        backgroundColor: true,
        seed: true
      },
      'micah': {
        backgroundColor: true,
        seed: true
      },
      'pixel-art': {
        backgroundColor: true,
        seed: true
      }
    };

    document.addEventListener('DOMContentLoaded', function() {
      // Elements
      const previewImage = document.getElementById('preview-image');
      const styleSelector = document.getElementById('style-selector');
      const bgColorInput = document.getElementById('bg-color');
      const seedInput = document.getElementById('seed');
      const saveButton = document.getElementById('save-button');
      const statusBadge = document.getElementById('status-badge');
      
      const tabStyle = document.getElementById('tab-style');
      const tabOptions = document.getElementById('tab-options');
      const tabContentStyle = document.getElementById('tab-content-style');
      const tabContentOptions = document.getElementById('tab-content-options');
      
      // Current state
      let currentStyle = 'bottts';
      let currentOptions = {
        backgroundColor: 'ffffff',
        seed: ''
      };
      
      // Switch tabs
      tabStyle.addEventListener('click', function() {
        tabStyle.classList.add('active');
        tabOptions.classList.remove('active');
        tabContentStyle.style.display = 'block';
        tabContentOptions.style.display = 'none';
      });
      
      tabOptions.addEventListener('click', function() {
        tabOptions.classList.add('active');
        tabStyle.classList.remove('active');
        tabContentOptions.style.display = 'block';
        tabContentStyle.style.display = 'none';
      });
      
      // Update preview when style changes
      styleSelector.addEventListener('change', function() {
        currentStyle = this.value;
        updatePreview();
      });
      
      // Update preview when options change
      bgColorInput.addEventListener('change', function() {
        currentOptions.backgroundColor = this.value.substring(1); // Remove # from hex
        updatePreview();
      });
      
      seedInput.addEventListener('change', function() {
        currentOptions.seed = this.value;
        updatePreview();
      });
      
      // Save avatar
      saveButton.addEventListener('click', function() {
        saveAvatar();
      });
      
      // Update preview
      function updatePreview() {
        const params = new URLSearchParams();
        
        // Add options
        for (const [key, value] of Object.entries(currentOptions)) {
          if (value) {
            params.append(key, value);
          }
        }
        
        // Create API URL
        const apiUrl = `/api/avatar/${window.avatarBridge?.userId || 'default'}?style=${currentStyle}&${params.toString()}`;
        
        // Update preview image
        previewImage.src = apiUrl;
      }
      
      // Save avatar preferences
      async function saveAvatar() {
        if (!window.avatarBridge) {
          alert('Authentication bridge not available. Unable to save.');
          return;
        }
        
        statusBadge.style.display = 'block';
        
        try {
          const success = await window.avatarBridge.savePreferences(currentStyle, currentOptions);
          
          setTimeout(() => {
            statusBadge.style.display = 'none';
            if (success) {
              alert('Avatar preferences saved successfully!');
            } else {
              alert('Failed to save avatar preferences.');
            }
          }, 1000);
        } catch (error) {
          statusBadge.style.display = 'none';
          alert('Error saving avatar: ' + error.message);
        }
      }
      
      // Initialize
      function initialize() {
        // Set initial style if available from bridge
        if (window.DICEBEAR_EDITOR?.initialStyle) {
          currentStyle = window.DICEBEAR_EDITOR.initialStyle;
        }
        
        // Update style selector
        styleSelector.value = currentStyle;
        
        // Load saved preferences
        if (window.avatarBridge?.loadPreferences) {
          window.avatarBridge.loadPreferences()
            .then(prefs => {
              if (prefs && prefs.style) {
                currentStyle = prefs.style;
                styleSelector.value = currentStyle;
              }
              
              if (prefs && prefs.options) {
                const options = prefs.options[currentStyle] || {};
                
                if (options.backgroundColor) {
                  currentOptions.backgroundColor = options.backgroundColor;
                  bgColorInput.value = '#' + options.backgroundColor;
                }
                
                if (options.seed) {
                  currentOptions.seed = options.seed;
                  seedInput.value = options.seed;
                }
              }
              
              updatePreview();
            })
            .catch(err => {
              console.error('Failed to load preferences:', err);
              updatePreview();
            });
        } else {
          updatePreview();
        }
      }
      
      // Initialize the editor
      initialize();
    });
  </script>
</body>
</html>
EOF

echo "Successfully created simplified editor!" | tee -a "$LOG_FILE"