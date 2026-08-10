import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {
  uploadSingleImage
} from "../../middlewares/upload.middleware.js";

import {
  validateBody,
  validateUploadedImage
} from "../gallery/gallery.validation.js";

import {
  uploadImageSchema
} from "../gallery/gallery.validation.js";

import {
  createCarpenterSchema,
  carpenterIdParamSchema,
  carpenterQuerySchema,
  updateCarpenterSchema,
} from './carpenters.validation.js';
import {
  createCarpenter,
  deleteCarpenter,
  getAllCarpenters,
  getCarpenterById,
  updateCarpenter,
  updateBatchCarpenter,
  getAllCarpentersMobilizers,
  deleteBulkCarpenters
} from './carpenters.controller.js';

const router = Router();

router.get('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterQuerySchema, 'query'), getAllCarpenters);
router.get('/fetch/mobilizer-records', authenticate, authorize(['Mobilizer']), getAllCarpentersMobilizers);
router.post('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head', 'Mobilizer']), uploadSingleImage, validateUploadedImage, validate(createCarpenterSchema, 'body'),  createCarpenter);
router.get('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterIdParamSchema, 'params'), getCarpenterById);
router.put('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']),  updateCarpenter);
router.put('/addtobatch/batches', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), updateBatchCarpenter);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterIdParamSchema, 'params'), deleteCarpenter);
router.post('/participants/bulk-delete', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), deleteBulkCarpenters);
export default router;
