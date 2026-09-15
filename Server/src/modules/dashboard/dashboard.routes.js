import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import { 
  getDashboardAnalytics, 
  getDistrictDistribution, 
  getCityDistribution,
  getAvailableFinancialYears,
  getDashboardKPIs,
  getExcelReportData,
  getDetailedBatchReportData
} from './dashboard.controller.js';

const router = Router();

const DASHBOARD_ROLES = ['Super Admin', 'Operation Head', 'Technical Head'];

router.get('/', authenticate, authorize(DASHBOARD_ROLES), getDashboardAnalytics);
router.get('/kpis', authenticate, authorize(DASHBOARD_ROLES), getDashboardKPIs);
router.get('/financial-years', authenticate, authorize(DASHBOARD_ROLES), getAvailableFinancialYears);
router.get('/districts', authenticate, authorize(DASHBOARD_ROLES), getDistrictDistribution);
router.get('/cities', authenticate, authorize(DASHBOARD_ROLES), getCityDistribution);
router.get('/reports/excel', authenticate, authorize(DASHBOARD_ROLES), getExcelReportData);
router.get('/reports/batch-details', authenticate, authorize(DASHBOARD_ROLES), getDetailedBatchReportData);

export default router;
