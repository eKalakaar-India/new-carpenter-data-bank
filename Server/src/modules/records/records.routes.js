import { Router } from 'express';
import validate from '../../middlewares/validate.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import {
  createRecordSchema,
  recordIdParamSchema,
  recordQuerySchema,
  updateRecordSchema,
} from './records.validation.js';
import {
  createRecord,
  deleteRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
} from './records.controller.js';

const router = Router();

router.get('/', validate(recordQuerySchema, 'query'), asyncHandler(getAllRecords));
router.post('/', validate(createRecordSchema, 'body'), asyncHandler(createRecord));
router.get('/:id', validate(recordIdParamSchema, 'params'), asyncHandler(getRecordById));
router.put('/:id', validate(recordIdParamSchema, 'params'), asyncHandler(updateRecord));
router.delete('/:id', validate(recordIdParamSchema, 'params'), asyncHandler(deleteRecord));

export default router;
