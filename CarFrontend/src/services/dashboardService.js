import axios from 'axios';

/**
 * Dashboard service layer.
 *
 * Uses the shared axios singleton (no separate instance) - vaultStore.js
 * already sets axios.defaults.baseURL and the Authorization header as a
 * module-level side effect, and Dashboard.jsx imports useVaultStore before
 * this service is ever called.
 *
 * getDashboardStats() is deliberately NOT an HTTP call. The backend's single
 * /api/dashboard endpoint (dashboard.service.js#getDashboardAnalytics)
 * already returns everything the KPI cards need, and that payload is fetched
 * once by useVaultStore's fetchAnalytics(). This just re-shapes it - no
 * second round trip for data the app already has.
 *
 * getDistrictMetrics(state) and getCityMetrics(state, district) hit new,
 * genuinely-needed endpoints: the existing /api/dashboard payload's
 * districtwiseCount is global (not scoped to a state), and it has no
 * city/town breakdown at all. Backed by DashboardService#getDistrictDistribution
 * and #getCityDistribution.
 */

const normalizeApiResponse = (payload) => payload?.data ?? payload;
const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.message ||
  error?.response?.data?.error ||
  'Request failed';

async function getJson(url, config) {
  try {
    const response = await axios.get(url, config);
    return normalizeApiResponse(response.data);
  } catch (error) {
    if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') throw error;
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Pure mapper - no network call. Pass in the analyticsData already held by
 * useVaultStore. Returns null if analyticsData hasn't loaded yet.
 */
export function getDashboardStats(analyticsData) {
  if (!analyticsData) return null;
  
  const { general = {}, training = {}, insurance = {} } = analyticsData;
  return {
    totalCarpenters: general.totalCarpenters,
    totalInsurance: insurance.insured,
    totalCertificates: general.certificateDispatched,
    monthlyRegistrations: general.monthlyRegistrations,
    completedTraining:  training.completedTraining
  };
}

/**
 * Get available financial years from the backend.
 * Returns array of financial years in format "YYYY-YY"
 */
export async function getAvailableFinancialYears(signal) {
  return getJson('/api/dashboard/financial-years', { signal });
}

/**
 * Get KPI data filtered by financial year.
 * If fy is 'all', returns data for all years.
 */
export async function getDashboardKPIs(fy = 'all', signal) {
  return getJson('/api/dashboard/kpis', { params: { fy }, signal });
}

export async function getDistrictMetrics(state, signal) {
  return getJson('/api/dashboard/districts', { params: { state }, signal });
}

export async function getCityMetrics(state, district, signal) {
  return getJson('/api/dashboard/cities', { params: { state, district }, signal });
}

/**
 * Download batch-wise Excel report
 * @param {string} fy - Financial year (or 'all')
 */
export async function downloadExcelReport(fy = 'all') {
  try {
    const response = await axios.get('/api/reports/excel', {
      params: { fy },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Download batch-wise Word document report
 * @param {string} fy - Financial year (or 'all')
 */
export async function downloadWordReport(fy = 'all') {
  try {
    const response = await axios.get('/api/reports/word', {
      params: { fy },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Download batch-wise PDF report
 * @param {string} fy - Financial year (or 'all')
 */
export async function downloadPDFReport(fy = 'all') {
  try {
    const response = await axios.get('/api/reports/pdf', {
      params: { fy },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

const dashboardService = {
  getDashboardStats,
  getAvailableFinancialYears,
  getDashboardKPIs,
  getDistrictMetrics,
  getCityMetrics,
  downloadExcelReport,
  downloadWordReport,
  downloadPDFReport,
};

export default dashboardService;
