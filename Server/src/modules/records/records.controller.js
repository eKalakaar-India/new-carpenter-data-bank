import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import RecordsService from './records.service.js';
import ApiError from '../../utils/ApiError.js';

const recordsService = new RecordsService();

export const createRecord = asyncHandler(async (req, res) => {
  const record = await recordsService.create(req.body);
  res.status(HTTP_STATUS.CREATED).json(ApiResponse.success('Record created successfully', record));
});

export const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordsService.getById(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Record fetched successfully', record));
});

export const getAllRecords = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const search = req.query.search ? String(req.query.search) : undefined;
  const sort = req.query.sort ? String(req.query.sort).split(',') : undefined;

  const result = await recordsService.getAll({}, { page, pageSize, search, sort });
  const payload = {
    items: result.data,
    pagination: {
      page,
      pageSize,
      total: result.count,
      totalPages: Math.ceil(result.count / pageSize),
    },
  };

  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Records fetched successfully', payload));
});

export const updateRecord = asyncHandler(async (req, res) => {
  console.log(req.body);
  const record = await recordsService.update(req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Record updated successfully', record));
});

export const deleteRecord = asyncHandler(async (req, res) => {
  await recordsService.delete(req.params.id);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Record deleted successfully', null));
});
