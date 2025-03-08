"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const avatar_1 = __importDefault(require("./avatar"));
const editor_1 = __importDefault(require("./editor"));
const auth_1 = __importDefault(require("./auth"));
const health_1 = __importDefault(require("./health"));
const router = (0, express_1.Router)();
// Mount API routes
router.use('/avatar', avatar_1.default);
router.use('/editor', editor_1.default);
router.use('/auth', auth_1.default);
router.use('/health', health_1.default);
exports.default = router;
