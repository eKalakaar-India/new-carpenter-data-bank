import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {createBatchSchema} from './batches.validation.js'
import {uploadBatchMedia,} from '../../middlewares/uploadVideo.middleware.js'

import {
  getAllBatches,
  createBatch,
  getBatchById,
  updateBatch,
  completeBatch,
  deleteBatch
} from './batches.controller.js';


const router = Router();
router.get('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), getAllBatches);
router.post('/create', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(createBatchSchema, 'body'), createBatch);
router.get('/single/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), getBatchById);
router.put('/edit/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), updateBatch);
router.put('/complete-batch/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), uploadBatchMedia, completeBatch)
router.delete('/delete/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), deleteBatch);
export default router;