import { Router } from 'express';
import avatarRouter from './avatar';
import editorRouter from './editor';
import authRouter from './auth';
import healthRouter from './health';

const router = Router();

// Mount API routes
router.use('/avatar', avatarRouter);
router.use('/editor', editorRouter);
router.use('/auth', authRouter);
router.use('/health', healthRouter);

export default router;