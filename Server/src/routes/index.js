import { Router } from 'express';
import recordsRoutes from '../modules/records/records.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import carpentersRoutes from '../modules/carpenters/carpenters.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

const router = Router();
router.use('/records', recordsRoutes);
router.use('/auth', authRoutes);
router.use('/carpenters', carpentersRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
