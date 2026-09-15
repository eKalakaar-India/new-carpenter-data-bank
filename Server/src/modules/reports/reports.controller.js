/**
 * Reports Controller
 * Handles generation and download of batch reports in various formats
 */

import asyncHandler from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import DashboardService from '../dashboard/dashboard.service.js';
import { generateExcelReport, generateWordReport, generatePDFReport } from '../../utils/reportGenerator.js';
import { logger } from '../../utils/logger.js';

const dashboardService = new DashboardService();

/**
 * Download batch-wise Excel report
 */
export const downloadExcelReport = asyncHandler(async (req, res) => {
  const { fy } = req.query;
  
  try {
    const reportData = await dashboardService.getExcelReportData(fy || 'all');
    
    if (reportData.length === 0) {
      return res.status(HTTP_STATUS.OK).json(
        ApiResponse.success('No data available for the selected financial year', [])
      );
    }

    const buffer = await generateExcelReport(reportData, fy || 'all');
    const filename = `Batch-Report_${fy || 'All'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    logger.info({ fy, filename }, 'Excel report downloaded');
  } catch (error) {
    logger.error({ fy, error: error.message }, 'Excel report generation failed');
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error('Failed to generate Excel report', error.message)
    );
  }
});

/**
 * Download batch-wise Word document report
 */
export const downloadWordReport = asyncHandler(async (req, res) => {
  const { fy } = req.query;

  try {
    const reportData = await dashboardService.getDetailedBatchReportData(fy || 'all');

    if (reportData.length === 0) {
      return res.status(HTTP_STATUS.OK).json(
        ApiResponse.success('No data available for the selected financial year', [])
      );
    }

    const buffer = await generateWordReport(reportData, fy || 'all');
    const filename = `Batch-Report_${fy || 'All'}_${new Date().toISOString().slice(0, 10)}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    logger.info({ fy, filename }, 'Word report downloaded');
  } catch (error) {
    logger.error({ fy, error: error.message }, 'Word report generation failed');
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error('Failed to generate Word report', error.message)
    );
  }
});

/**
 * Download batch-wise PDF report
 */
export const downloadPDFReport = asyncHandler(async (req, res) => {
  const { fy } = req.query;

  try {
    const reportData = await dashboardService.getDetailedBatchReportData(fy || 'all');

    if (reportData.length === 0) {
      return res.status(HTTP_STATUS.OK).json(
        ApiResponse.success('No data available for the selected financial year', [])
      );
    }

    const buffer = await generatePDFReport(reportData, fy || 'all');
    const filename = `Batch-Report_${fy || 'All'}_${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
    logger.info({ fy, filename }, 'PDF report downloaded');
  } catch (error) {
    logger.error({ fy, error: error.message }, 'PDF report generation failed');
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      ApiResponse.error('Failed to generate PDF report', error.message)
    );
  }
});
