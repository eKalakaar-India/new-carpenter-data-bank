import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import LinksService from './links.service.js';

const linksService = new LinksService();

export const uploadCertificateLinks = asyncHandler(async (req, res) => {
  const result = await linksService.uploadCertificateLinks(req.file?.buffer, req.user);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Certificate links processed successfully', result));
});

export const uploadInsuranceLinks = asyncHandler(async (req, res) => {
  const result = await linksService.uploadInsuranceLinks(req.file?.buffer, req.user);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Insurance links processed successfully', result));
});