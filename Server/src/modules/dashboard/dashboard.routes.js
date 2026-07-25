import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { getDashboardAnalytics } from './dashboard.controller.js';

const router = Router();

router.get('/', authenticate, authorize(['Super Admin', 'Operation Head', 'Technical Head']), getDashboardAnalytics);

export default router;
