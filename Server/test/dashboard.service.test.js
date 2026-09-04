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
  const financialYear = `${currentYear - (Number(currentMonth) < 4 ? 1 : 0)}-${String(currentYear + (Number(currentMonth) < 4 ? 0 : 1)).slice(-2)}`;
  const timeline = analytics.timelineAnalytics.yearly[financialYear];
  assert.deepEqual(analytics.timelineAnalytics.years, [financialYear]);
  assert.deepEqual(timeline.monthly.registrations.map(({ name }) => name), [
    'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
  ]);
  assert.equal(timeline.totals.registrations, 3);
  assert.equal(timeline.totals.insurance, 2);
  assert.equal(timeline.totals.certificates, 2);
});
