import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { getDashboardAnalytics, getDistrictDistribution, getCityDistribution } from './dashboard.controller.js';

const router = Router();

const DASHBOARD_ROLES = ['Super Admin', 'Operation Head', 'Technical Head'];

router.get('/', authenticate, authorize(DASHBOARD_ROLES), getDashboardAnalytics);
router.get('/districts', authenticate, authorize(DASHBOARD_ROLES), getDistrictDistribution);
router.get('/cities', authenticate, authorize(DASHBOARD_ROLES), getCityDistribution);

export default router;
