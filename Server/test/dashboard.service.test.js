import test from 'node:test';
import assert from 'node:assert/strict';
import DashboardService from '../src/modules/dashboard/dashboard.service.js';

const service = new DashboardService();
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
service.repository = {
  getCarpenters: async () => [
    { created_at: `${currentYear}-${currentMonth}-15T00:00:00.000Z`, state: 'Maharashtra', district: 'Mumbai', has_insurance: true, has_certificate: true },
    { created_at: `${currentYear}-${currentMonth}-20T00:00:00.000Z`, state: 'Maharashtra', district: 'Pune', has_insurance: false, has_certificate: false },
    { created_at: `${currentYear}-${currentMonth}-10T00:00:00.000Z`, state: 'Gujarat', district: 'Ahmedabad', has_insurance: true, has_certificate: true },
  ],
  getRecentRegistrations: async () => [],
};

test('builds drilldown analytics for registrations, insurance and certificates', async () => {
  const analytics = await service.getDashboardAnalytics('monthly');

  assert.ok(analytics.dashboardAnalytics);
  assert.equal(analytics.dashboardAnalytics.registrations.Maharashtra.total, 2);
  assert.equal(analytics.dashboardAnalytics.registrations.Maharashtra.districts.Mumbai, 1);
  assert.equal(analytics.dashboardAnalytics.insurance.Maharashtra.insured, 1);
  assert.equal(analytics.dashboardAnalytics.insurance.Maharashtra.uninsured, 1);
  assert.equal(analytics.dashboardAnalytics.certificates.Maharashtra.completed, 1);
  assert.equal(analytics.dashboardAnalytics.certificates.Maharashtra.pending, 1);
  assert.ok(analytics.timelineAnalytics.monthly.registrations.length > 0);
  assert.ok(analytics.timelineAnalytics.monthly.insurance.length > 0);
  assert.ok(analytics.timelineAnalytics.monthly.certificates.length > 0);
});
