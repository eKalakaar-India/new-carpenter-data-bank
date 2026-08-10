import { HTTP_STATUS } from '../../utils/constants.js';
import BatchService from './batches.service.js';
import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';


const batchesService = new BatchService();

export const createBatch = asyncHandler(async (req, res) => {
  console.log(req.body);
  const batch = await batchesService.create(req.body, req.user);
  res.status(HTTP_STATUS.CREATED).json(ApiResponse.success('Batch created successfully', batch));
});

export const updateBatch= asyncHandler(async (req, res) => {
  const carpenter = await batchesService.update(req.params.id, req.body, req.user);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Batch updated successfully', carpenter));
});

export const completeBatch = asyncHandler(async (req, res) => {
  const images = req.files?.batch_img || [];
  const video = req.files?.batch_video?.[0] || null;
  console.log(images, video);
  const carpenter = await batchesService.updateCompleteStatus(images, video, req.params.id, req.body, req.user);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Batch updated successfully', carpenter));
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const carpenter = await batchesService.deleteBatch(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Batch deleted successfully', carpenter));
});

export const getBatchById = asyncHandler(async (req, res) => {
  const carpenter = await batchesService.getById(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Batch fetched successfully', carpenter));
});

export const getAllBatches = asyncHandler(async (req, res) => {
  const result = await batchesService.getAll(req.query);
  const payload = {
    items: result.data,
    pagination: {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      total: result.count,
      totalPages: Math.ceil(result.count / Number(req.query.pageSize ?? 20)),
    },
  };
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Batches fetched successfully', payload));
});


