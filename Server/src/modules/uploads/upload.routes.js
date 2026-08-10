import express from 'express';
import multer from 'multer';
import {uploadExcel, listParticipants, getBatch} from './upload.controller.js';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from './upload.validation.js';
import { authenticate, authorize } from '../../middlewares/auth.js';


const router = express.Router();

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

router.post('/upload', authenticate, authorize(['Super Admin', 'Operation Head', 'Project Head']), handleUpload, uploadExcel);
router.get('/', listParticipants);
router.get('/batch/:batchId', getBatch);

export default router;

// In your main app entrypoint (e.g. backend/src/app.js):
//
//   const participantsRoutes = require('./modules/participants/participants.routes');
//   app.use('/api/participants', participantsRoutes);