#!/usr/bin/env node
const http = require('http');
const { exec } = require('child_process');
const readline = require('readline');

const API_KEY = 'development-api-key'; // Use the default development API key

// Create interface for command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generates a valid token for testing
async function generateToken(userId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      userId
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseData}`));
          return;
        }

        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Fetch an avatar for a user
async function fetchAvatar(userId, format = 'svg') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/avatar/${userId}?format=${format}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseData}`));
          return;
        }

        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Run the tests
async function runTests() {
  console.log('-------------------------------------');
  console.log('🧪 DiceBear Integration Test Script');
  console.log('-------------------------------------');
  
  try {
    const userId = `test-user-${Date.now()}`;
    
    console.log(`📋 Using test user ID: ${userId}`);
    console.log('\n1️⃣ Testing token generation...');
    
    const tokenData = await generateToken(userId);
    console.log('✅ Token generated successfully');
    console.log(`🔑 Token: ${tokenData.token}`);
    console.log(`🌐 Editor URL: ${tokenData.editUrl}`);
    
    console.log('\n2️⃣ Testing avatar generation...');
    try {
      await fetchAvatar(userId);
      console.log('✅ Avatar generated successfully');
    } catch (error) {
      console.error('❌ Avatar generation failed:', error.message);
    }
    
    console.log('\n📝 To complete the test:');
    console.log('1. Open the editor URL in your browser');
    console.log('2. Customize the avatar');
    console.log('3. Click the "Save" button');
    console.log('4. Verify that the avatar is saved (success notification appears)');
    console.log('5. Refresh the avatar in your browser to see the changes');
    
    console.log('\n🔎 Would you like to open the editor URL in your default browser? (y/n)');
    
    rl.question('> ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        const command = process.platform === 'win32'
          ? `start "${tokenData.editUrl}"`
          : process.platform === 'darwin'
            ? `open "${tokenData.editUrl}"`
            : `xdg-open "${tokenData.editUrl}"`;
        
        exec(command, (error) => {
          if (error) {
            console.error('❌ Failed to open URL:', error.message);
          } else {
            console.log('🌐 Editor opened in browser');
          }
          rl.close();
        });
      } else {
        console.log(`🌐 Editor URL: ${tokenData.editUrl}`);
        rl.close();
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    rl.close();
  }
}

// Ensure the server is running
console.log('🔍 Checking if server is running...');

http.get('http://localhost:3000/api/health', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Server is running');
      runTests();
    } else {
      console.error('❌ Server returned error:', data);
      rl.close();
    }
  });
}).on('error', () => {
  console.error('❌ Server is not running.');
  console.log('📋 Please start the server first:');
  console.log('   npm run dev:server');
  rl.close();
});