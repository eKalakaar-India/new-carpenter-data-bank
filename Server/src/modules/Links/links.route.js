import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import multer from 'multer';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '../uploads/upload.validation.js';
// ASSUMPTION: a shared multer instance exporting `.single(fieldName)`,
// mirroring how your existing uploadFilePreview/uploadDocument actions in
// vaultStore.js already send `formData.append('file', file)` to other
// endpoints - so those endpoints must already be backed by something like
// this. Point me to the real file/export if the path or shape differs.
// import upload from '../../middlewares/upload.js';
import { uploadCertificateLinks, uploadInsuranceLinks } from './links.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Only .xlsx or .xls files are allowed.'));
  },
});

// Wrap multer so file-type/size errors come back as clean JSON instead of
// an unhandled error bubbling past this route.
function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    return next();
  });
}

const router = Router();

const LINKS_UPLOAD_ROLES = ['Super Admin', 'Operation Head', 'Project Head'];

// Mount this router the same way dashboard.routes.js is mounted, e.g.
// app.use('/api/links', linksRoutes) - matches the frontend paths below.
router.post(
  '/certificates/upload',
  authenticate,
  authorize(LINKS_UPLOAD_ROLES),
  handleUpload,
  uploadCertificateLinks
);

router.post(
  '/insurance/upload',
  authenticate,
  authorize(LINKS_UPLOAD_ROLES),
  handleUpload,
  uploadInsuranceLinks
);

export default router;