// Simple HTTP server to serve test files
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

// Map of file extensions to MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a proxy for API requests
function proxyRequest(req, res, targetUrl) {
  const parsedUrl = new URL(targetUrl);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: req.headers,
  };

  // Remove the host header to avoid conflicts
  delete options.headers.host;

  const proxyReq = http.request(options, (proxyRes) => {
    // Copy status code
    res.statusCode = proxyRes.statusCode;
    console.log(`Proxy response status: ${proxyRes.statusCode} for ${targetUrl}`);
    
    // Copy headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    // For debugging, collect the response data
    let responseData = [];
    proxyRes.on('data', (chunk) => {
      responseData.push(chunk);
    });
    
    proxyRes.on('end', () => {
      const body = Buffer.concat(responseData);
      const contentType = proxyRes.headers['content-type'] || '';
      
      // Log binary responses differently
      if (contentType.includes('image/')) {
        console.log(`Received image response (${body.length} bytes)`);
      } else if (body.length < 500 && !contentType.includes('application/octet-stream')) {
        try {
          console.log(`Response body for ${targetUrl}: ${body.toString().substring(0, 200)}...`);
        } catch (e) {
          console.log(`Error logging response body: ${e.message}`);
        }
      }
      
      // Send the response to the client
      res.end(body);
    });
  });

  // Handle proxy errors
  proxyReq.on('error', (e) => {
    console.error(`Proxy error for ${targetUrl}: ${e.message}`);
    res.statusCode = 500;
    res.end(`Proxy error: ${e.message}`);
  });

  // If we need to send a body with the request
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let requestBody = [];
    req.on('data', (chunk) => {
      requestBody.push(chunk);
    });
    
    req.on('end', () => {
      const body = Buffer.concat(requestBody);
      console.log(`Proxy request body for ${targetUrl}: ${body.toString().substring(0, 200)}...`);
      proxyReq.end(body);
    });
  } else {
    proxyReq.end();
  }
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  
  // Extract the pathname
  let pathname = parsedUrl.pathname;
  
  // Proxy API requests to the real server
  if (pathname.startsWith('/api/')) {
    const targetUrl = `http://localhost:3000${req.url}`;
    console.log(`Proxying API request: ${req.method} ${req.url} -> ${targetUrl}`);
    return proxyRequest(req, res, targetUrl);
  }
  
  // Special case for editor-bridge.js which is needed by the iframe
  if (pathname === '/editor/editor-bridge.js') {
    const filePath = path.join(__dirname, 'public', 'editor', 'editor-bridge.js');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading editor-bridge.js:', err);
        res.writeHead(500);
        res.end('Error loading editor-bridge.js');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(data);
    });
    return;
  }
  
  // Handle the editor routes from our actual HTTP server
  if (pathname.startsWith('/editor')) {
    // Just proxy directly to our real server 
    return proxyRequest(req, res, `http://localhost:3000${req.url}`);
  }
  
  // Serve static files from the public directory
  if (pathname === '/') {
    pathname = '/test-avatar-persistence.html';
  }
  
  // Determine the file path
  const filePath = path.join(__dirname, 'public', pathname);
  
  // Get the file extension
  const ext = path.extname(filePath);
  
  // Set the content type based on the file extension
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end(`File ${pathname} not found!`);
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Error getting the file: ${err.code}`);
      }
    } else {
      // Success! Send the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}/`);
  console.log(`Open http://localhost:${PORT}/test-avatar-persistence.html to run the persistence test`);
});