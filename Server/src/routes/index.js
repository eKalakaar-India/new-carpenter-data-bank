import { Router } from 'express';
import recordsRoutes from '../modules/records/records.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import carpentersRoutes from '../modules/carpenters/carpenters.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import batchesRouter from '../modules/Batches/batches.routes.js'
import fileRouter from '../modules/uploads/upload.routes.js'
import linkRouter from '../modules/Links/links.route.js'
import galleryRoutes from "../modules/gallery/gallery.routes.js";
import storageRoutes from '../modules/storage/storage.routes.js';


const router = Router();
router.use('/records', recordsRoutes);
router.use('/auth', authRoutes);
router.use('/carpenters', carpentersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/batches', batchesRouter)
router.use('/file', fileRouter)
router.use('/links', linkRouter)
router.use("/gallery", galleryRoutes);
router.use('/storage', storageRoutes);


export default router;
