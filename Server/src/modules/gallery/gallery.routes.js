import express from "express";

import GalleryController from "./gallery.controller.js";

import {
  uploadSingleImage,
  uploadMultipleImages,
} from "../../middlewares/upload.middleware.js";

import {
  validateBody,
  validateUploadedImage,
  validateMultipleImages,
} from "./gallery.validation.js";

import {
  uploadImageSchema,
  deleteImageSchema,
  getImagesSchema,
} from "./gallery.validation.js";

import { authenticate } from "../../middlewares/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Upload Single Image
|--------------------------------------------------------------------------
*/

router.post(
  "/upload",
  authenticate,
  uploadSingleImage,
  validateUploadedImage,
  validateBody(uploadImageSchema),
  GalleryController.uploadSingleImage
);

/*
|--------------------------------------------------------------------------
| Upload Multiple Images
|--------------------------------------------------------------------------
*/

router.post(
  "/upload/multiple",
  authenticate,
  uploadMultipleImages,
  validateMultipleImages,
  validateBody(uploadImageSchema),
  GalleryController.uploadMultipleImages
);

router.post(
  "/upload/video",
  authenticate,
  GalleryController.uploadMultipleImages
);

/*
|--------------------------------------------------------------------------
| Replace Image
|--------------------------------------------------------------------------
*/

router.put(
  "/replace",
  authenticate,
  uploadSingleImage,
  validateUploadedImage,
  validateBody(uploadImageSchema),
  GalleryController.replaceImage
);

/*
|--------------------------------------------------------------------------
| Get Images By Carpenter
|--------------------------------------------------------------------------
*/

router.get(
  "/:carpenterId",
  authenticate,
  (req, res, next) => {
    req.body = {
      carpenter_id: req.params.carpenterId,
    };

    next();
  },
  validateBody(getImagesSchema),
  GalleryController.getImages
);

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

router.delete(
  "/:imageId",
  authenticate,
  (req, res, next) => {
    req.body = {
      image_id: req.params.imageId,
    };

    next();
  },
  validateBody(deleteImageSchema),
  GalleryController.deleteImage
);

export default router;