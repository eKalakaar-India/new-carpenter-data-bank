import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import DashboardService from './dashboard.service.js';

const dashboardService = new DashboardService();

export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const analytics = await dashboardService.getDashboardAnalytics();
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Dashboard analytics fetched successfully', analytics));
});
