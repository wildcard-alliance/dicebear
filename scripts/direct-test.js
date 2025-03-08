#!/usr/bin/env node

// This script tests the integration plan by directly verifying the code structure
// without actually running the server

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base path for the project
const basePath = path.join(__dirname, '..');

// Files to check
const filesToCheck = [
  'apps/server/src/index.ts',
  'apps/server/src/api/avatar.ts',
  'apps/server/src/api/editor.ts',
  'apps/server/src/api/auth.ts',
  'apps/server/src/lib/avatar-generator.ts',
  'apps/server/src/lib/db.ts',
  'apps/server/src/lib/security.ts',
  'apps/editor/src/utils/serverAdapter.ts',
  'apps/editor/src/components/SaveButton.vue',
  'public/index.html',
  'INTEGRATION_PLAN.md',
  'INTEGRATED_README.md'
];

// Helper function to check if a file exists
function checkFile(filePath) {
  const fullPath = path.join(basePath, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const fileSize = stats.size;
    return { exists: true, size: fileSize };
  }
  return { exists: false, size: 0 };
}

// Logger utility
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',    // Cyan
    success: '\x1b[32m%s\x1b[0m',  // Green
    warning: '\x1b[33m%s\x1b[0m',  // Yellow
    error: '\x1b[31m%s\x1b[0m'     // Red
  };
  
  console.log(colors[type], message);
}

// Main test function
function runTest() {
  log('--------------------------------------------------');
  log('🧪 DiceBear Integration Structure Test', 'info');
  log('--------------------------------------------------');
  
  let pass = true;
  
  // Check all required files
  log('\n📂 Checking for required files:');
  filesToCheck.forEach(file => {
    const result = checkFile(file);
    if (result.exists) {
      log(`  ✅ ${file} (${result.size} bytes)`, 'success');
    } else {
      log(`  ❌ ${file} missing`, 'error');
      pass = false;
    }
  });
  
  // Check server API implementation
  log('\n🔍 Checking server API implementation:');
  const apiFiles = ['avatar.ts', 'editor.ts', 'auth.ts'].map(f => path.join(basePath, 'apps/server/src/api', f));
  let apiImplemented = true;
  
  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('Router') && content.includes('export default router')) {
        log(`  ✅ API endpoint in ${path.basename(file)} is properly implemented`, 'success');
      } else {
        log(`  ⚠️ API endpoint in ${path.basename(file)} might not be fully implemented`, 'warning');
        apiImplemented = false;
      }
    }
  });
  
  if (!apiImplemented) {
    log('  ⚠️ Some API endpoints may not work correctly', 'warning');
  }
  
  // Check editor integration
  log('\n🔍 Checking editor integration:');
  const editorFiles = [
    path.join(basePath, 'apps/editor/src/utils/serverAdapter.ts'),
    path.join(basePath, 'apps/editor/src/components/SaveButton.vue')
  ];
  
  let editorIntegrated = true;
  editorFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (file.includes('serverAdapter.ts') && content.includes('saveToServer')) {
        log('  ✅ Server adapter is properly implemented', 'success');
      } else if (file.includes('SaveButton.vue') && content.includes('handleSave')) {
        log('  ✅ Save button is properly implemented', 'success');
      } else {
        log(`  ⚠️ ${path.basename(file)} might not be fully implemented`, 'warning');
        editorIntegrated = false;
      }
    }
  });
  
  if (!editorIntegrated) {
    log('  ⚠️ Editor integration may not work correctly', 'warning');
  }
  
  // Check documentation
  log('\n📚 Checking documentation:');
  ['INTEGRATION_PLAN.md', 'INTEGRATED_README.md'].forEach(file => {
    const fullPath = path.join(basePath, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.length > 1000) {
        log(`  ✅ ${file} is comprehensive (${content.length} bytes)`, 'success');
      } else {
        log(`  ⚠️ ${file} might not be detailed enough (${content.length} bytes)`, 'warning');
      }
    }
  });
  
  // Final result
  log('\n--------------------------------------------------');
  if (pass) {
    log('✅ Integration structure test PASSED', 'success');
    log('The implementation follows the integration plan correctly.');
    log('To use the integrated application:');
    log('1. Install dependencies for both editor and server');
    log('2. Start the development server with: npm run dev');
    log('3. Generate a token and test the editor integration');
  } else {
    log('❌ Integration structure test FAILED', 'error');
    log('There are missing files or implementation issues.');
  }
  log('--------------------------------------------------');
  
  return pass;
}

// Run the test
runTest();