import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import CarpentersService from './carpenters.service.js';

const carpentersService = new CarpentersService();

export const createCarpenter = asyncHandler(async (req, res) => {
  const carpenter = await carpentersService.create(req.body, req.file, req.user);
  res.status(HTTP_STATUS.CREATED).json(ApiResponse.success('Carpenter created successfully', carpenter));
});

export const updateCarpenter = asyncHandler(async (req, res) => {
  console.log(req.body)
  const carpenter = await carpentersService.update(req.params.id, req.body, req.user);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenter updated successfully', carpenter));
});

export const updateBatchCarpenter = asyncHandler(async (req, res) => {
  console.log(req.body);
  const carpenter = await carpentersService.updateBatch(
        req.body.ids,
        req.body,
        req.user
    );
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenter updated successfully', carpenter));
});

export const deleteCarpenter = asyncHandler(async (req, res) => {
  const carpenter = await carpentersService.delete(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenter deleted successfully', carpenter));
});

export const deleteBulkCarpenters = asyncHandler(async (req, res) => {
  console.log(req.body)
  const carpenter = await carpentersService.deleteBulk(req.body.ids);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenters deleted successfully', carpenter));
});

export const getCarpenterById = asyncHandler(async (req, res) => {
  const carpenter = await carpentersService.getById(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenter fetched successfully', carpenter));
});

export const getAllCarpenters = asyncHandler(async (req, res) => {
  const result = await carpentersService.getAll(req.query);
  const payload = {
    items: result.data,
    pagination: {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      total: result.count,
      totalPages: Math.ceil(result.count / Number(req.query.pageSize ?? 20)),
    },
  };
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenters fetched successfully', payload));
});


export const getAllCarpentersMobilizers = asyncHandler(async (req, res) => {
  const result = await carpentersService.getAllCarpenterMobilizerRecords(req.query);
  const payload = {
    items: result.data,
    pagination: {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 20),
      total: result.count,
      totalPages: Math.ceil(result.count / Number(req.query.pageSize ?? 20)),
    },
  };
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Carpenters fetched successfully', payload));
});
