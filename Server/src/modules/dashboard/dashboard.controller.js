import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import DashboardService from './dashboard.service.js';

const dashboardService = new DashboardService();

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  const analytics = await dashboardService.getDashboardAnalytics(period);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Dashboard analytics fetched successfully', analytics));
});

export const getDistrictDistribution = asyncHandler(async (req, res) => {
  const { state } = req.query;
  const districts = await dashboardService.getDistrictDistribution(state);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('District distribution fetched successfully', districts));
});

export const getCityDistribution = asyncHandler(async (req, res) => {
  const { state, district } = req.query;
  const cities = await dashboardService.getCityDistribution(state, district);
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('City distribution fetched successfully', cities));
});
