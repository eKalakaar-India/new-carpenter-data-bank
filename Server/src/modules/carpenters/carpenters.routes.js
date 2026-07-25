import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import { authenticate, authorize } from '../../middlewares/auth.js';
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
} from './carpenters.controller.js';

const router = Router();

router.get('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterQuerySchema, 'query'), getAllCarpenters);
router.post('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head', 'Mobilizer']), validate(createCarpenterSchema, 'body'), createCarpenter);
router.get('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterIdParamSchema, 'params'), getCarpenterById);
router.put('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterIdParamSchema, 'params'), validate(updateCarpenterSchema, 'body'), updateCarpenter);
router.delete('/:id', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), validate(carpenterIdParamSchema, 'params'), deleteCarpenter);

export default router;
