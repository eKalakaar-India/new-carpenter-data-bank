import * as GalleryService from "./gallery.service.js";
import  ApiResponse  from "../../utils/ApiResponse.js";
import ApiError  from "../../utils/ApiError.js";

/**
 * Upload Single Image
 */
const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Image is required.");
    }

    const image = await GalleryService.uploadSingleImage({
      file: req.file,
      carpenterId: req.body.carpenter_id,
      imageType: req.body.image_type,
      uploadedBy: req.user.id,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        image,
        "Image uploaded successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Single Video
 */
const uploadSingleVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Image is required.");
    }

    const image = await GalleryService.uploadSingleVideo(req.file);

    return res.status(201).json(
      new ApiResponse(
        201,
        image,
        "Video uploaded successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Multiple Images
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      throw new ApiError(400, "Please upload at least one image.");
    }

    const images = await GalleryService.uploadMultipleImages({
      files: req.files,
      carpenterId: req.body.carpenter_id,
      imageType: req.body.image_type,
      uploadedBy: req.user.id,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        images,
        "Images uploaded successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Images By Carpenter
 */
const getImages = async (req, res, next) => {
  try {
    const images = await GalleryService.getImages(
      req.params.carpenterId
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        images,
        "Images fetched successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Image
 */
const deleteImage = async (req, res, next) => {
  try {
    await GalleryService.deleteImage(
      req.params.imageId,
      req.user.id
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Image deleted successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Replace Image
 */
const replaceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "Image is required.");
    }

    const image = await GalleryService.replaceImage({
      file: req.file,
      carpenterId: req.body.carpenter_id,
      imageType: req.body.image_type,
      uploadedBy: req.user.id,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        image,
        "Image replaced successfully."
      )
    );
  } catch (error) {
    next(error);
  }
};


export default {
  uploadSingleImage,
  uploadMultipleImages,
  getImages,
  deleteImage,
  replaceImage,
};