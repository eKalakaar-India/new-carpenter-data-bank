import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { StorageService } from './storage.service.js';

const storageService = new StorageService();

export const getSignedFileUrl = asyncHandler(async (req, res) => {
  const { path: filePath } = req.query;

  if (!filePath) {
    throw new Error('File path is required');
  }

  const signedUrl = await storageService.getSignedUrl(String(filePath));

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Signed URL fetched successfully', { signedUrl }));
});
