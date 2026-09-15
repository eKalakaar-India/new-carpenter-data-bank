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

export const getAvailableFinancialYears = asyncHandler(async (req, res) => {
  const years = await dashboardService.getAvailableFinancialYears();
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Financial years fetched successfully', years));
});

export const getDashboardKPIs = asyncHandler(async (req, res) => {
  const { fy } = req.query;
  const kpis = await dashboardService.getDashboardKPIs(fy || 'all');
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Dashboard KPIs fetched successfully', kpis));
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

export const getExcelReportData = asyncHandler(async (req, res) => {
  const { fy } = req.query;
  const data = await dashboardService.getExcelReportData(fy || 'all');
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Excel report data fetched successfully', data));
});

export const getDetailedBatchReportData = asyncHandler(async (req, res) => {
  const { fy } = req.query;
  const data = await dashboardService.getDetailedBatchReportData(fy || 'all');
  res.status(HTTP_STATUS.OK).json(ApiResponse.success('Detailed batch report data fetched successfully', data));
});
