"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const fs_1 = __importDefault(require("fs"));
const api_1 = __importDefault(require("./api"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const config_1 = __importStar(require("./config"));
// Validate configuration
(0, config_1.validateConfig)();
// Create Express app
const app = (0, express_1.default)();
// Apply middleware
app.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // Security headers
app.use((0, morgan_1.default)('dev')); // Logging
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Configure CORS
if (config_1.default.corsEnabled) {
    app.use((0, cors_1.default)());
}
// API routes
app.use('/api', api_1.default);
// Serve static files from /public
const publicPath = path_1.default.join(__dirname, '../../..', 'public');
app.use(express_1.default.static(publicPath));
// Serve editor for /editor routes with injected bridge script
app.get('/editor/*', (req, res) => {
    const editorHtmlPath = path_1.default.join(publicPath, 'editor', 'index.html');
    // Read the original editor HTML
    fs_1.default.readFile(editorHtmlPath, 'utf8', (err, html) => {
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
        }
        catch (error) {
            console.error('Error injecting bridge script:', error);
            res.status(500).send('Error loading editor');
        }
    });
});
// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
// Error handling middleware
app.use(errorHandler_1.default);
// Start the server
const PORT = config_1.default.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config_1.default.nodeEnv}`);
    console.log(`Base URL: ${config_1.default.baseUrl}`);
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
exports.default = app;
