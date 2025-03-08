import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import apiRoutes from './api';
import errorHandler from './middleware/errorHandler';
import config, { validateConfig } from './config';

// Validate configuration
validateConfig();

// Create Express app
const app = express();

// Apply middleware
app.use(helmet({ contentSecurityPolicy: false })); // Security headers
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS
if (config.corsEnabled) {
  app.use(cors());
}

// API routes
app.use('/api', apiRoutes);

// Serve static files from /public
const publicPath = path.join(__dirname, '../../..', 'public');
app.use(express.static(publicPath));

// Serve editor for /editor routes with injected bridge script
app.get('/editor/*', (req, res) => {
  const editorHtmlPath = path.join(publicPath, 'editor', 'index.html');
  
  // Read the original editor HTML
  fs.readFile(editorHtmlPath, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading editor HTML:', err);
      res.status(500).send('Error loading editor');
      return;
    }
    
    try {
      // Inject our bridge script before closing </body> tag
      const bridgeScriptTag = '<script src="/editor/editor-bridge.js"></script>';
      const modifiedHtml = html.replace('</body>', `${bridgeScriptTag}\n</body>`);
      
      // Send the modified HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(modifiedHtml);
    } catch (error) {
      console.error('Error injecting bridge script:', error);
      res.status(500).send('Error loading editor');
    }
  });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Base URL: ${config.baseUrl}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;