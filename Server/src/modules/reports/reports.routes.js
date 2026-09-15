/**
 * Reports Routes
 * Endpoints for downloading batch reports in various formats
 */

import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { 
  downloadExcelReport, 
  downloadWordReport, 
  downloadPDFReport 
} from './reports.controller.js';

const router = Router();

const REPORT_ROLES = ['Super Admin', 'Operation Head', 'Technical Head'];

// Download reports in various formats
router.get('/excel', authenticate, authorize(REPORT_ROLES), downloadExcelReport);
router.get('/word', authenticate, authorize(REPORT_ROLES), downloadWordReport);
router.get('/pdf', authenticate, authorize(REPORT_ROLES), downloadPDFReport);

export default router;
