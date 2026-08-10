import { Router } from 'express';
import asyncHandler from '../../middlewares/asyncHandler.js';
import { getSignedFileUrl } from './storage.controller.js';

const router = Router();

router.get('/signed-url', asyncHandler(getSignedFileUrl));

export default router;
