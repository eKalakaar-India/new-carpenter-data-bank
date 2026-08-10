import DashboardRepository from './dashboard.repository.js';
import { logger } from '../../utils/logger.js';

class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
  }

  async getDashboardAnalytics(period = 'monthly') {
    const carpenters = await this.repository.getCarpenters();
    const recentRegistrations = await this.repository.getRecentRegistrations(10);

    const totalCarpenters = carpenters.length;
    const activeCarpenters = carpenters.filter((carpenter) => this.isTrainingCompleted(carpenter)).length;
    const inactiveCarpenters = totalCarpenters - activeCarpenters;

    const today = new Date().toISOString().slice(0, 10);
    const todaysRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.startsWith(today)).length;
    const monthlyRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.slice(0, 7) === today.slice(0, 7)).length;
    const yearlyRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.slice(0, 4) === today.slice(0, 4)).length;

    const completedTraining = carpenters.filter((carpenter) => this.isTrainingCompleted(carpenter)).length;
    const pendingTraining = carpenters.filter((carpenter) => !this.isTrainingCompleted(carpenter)).length;
    const trainingPercentage = totalCarpenters ? Math.round((completedTraining / totalCarpenters) * 100) : 0;

    const insured = carpenters.filter((carpenter) => this.isInsured(carpenter)).length;
    const notInsured = carpenters.filter((carpenter) => !this.isInsured(carpenter)).length;
    const insurancePercentage = totalCarpenters ? Math.round((insured / totalCarpenters) * 100) : 0;
    const certificateDispatched = carpenters.filter((carpenter) => this.isCertificateCompleted(carpenter)).length;
    const genderDistribution = this.groupBy(carpenters, 'gender');
    const ageGroupDistribution = this.groupAgeRanges(carpenters);
    const statewiseCount = this.groupBy(carpenters, 'state');
    const districtwiseCount = this.groupBy(carpenters, 'district');
    const tradewiseCount = this.groupBy(carpenters, 'trade');
    const scopedForPeriod = carpenters;

    logger.info('Dashboard analytics accessed');

    return {
      general: {
        totalCarpenters,
        totalActiveCarpenters: activeCarpenters,
        totalInactiveCarpenters: inactiveCarpenters,
        todaysRegistrations,
        monthlyRegistrations,
        yearlyRegistrations,
        certificateDispatched
      },
      training: {
        completedTraining,
        pendingTraining,
        trainingPercentage,
      },
      insurance: {
        insured,
        notInsured,
        insurancePercentage,
      },
      demographics: {
        genderDistribution,
        ageGroupDistribution,
        statewiseCount,
        districtwiseCount,
        tradewiseCount,
      },
      registrationTrends: {
        dailyRegistrationGraph: this.buildDailyTrend(carpenters),
        monthlyRegistrationGraph: this.buildMonthlyTrend(carpenters),
        yearlyRegistrationGraph: this.buildYearlyTrend(carpenters),
      },
      topStatistics: {
        top10Districts: this.topItems(districtwiseCount, 10),
        top10Trades: this.topItems(tradewiseCount, 10),
      },
      searchAnalytics: {
        totalSearchResults: totalCarpenters,
        filterStatistics: {
          state: Object.keys(statewiseCount).length,
          district: Object.keys(districtwiseCount).length,
          trade: Object.keys(tradewiseCount).length,
        },
      },
      dashboardAnalytics: {
        registrations: this.buildRegistrationAnalytics(scopedForPeriod),
        insurance: this.buildInsuranceAnalytics(scopedForPeriod),
        certificates: this.buildCertificateAnalytics(scopedForPeriod),
      },
      timelineAnalytics: this.buildTimelineAnalytics(scopedForPeriod),
      recentActivities: recentRegistrations.slice(0, 10),
    };
  }

  /**
   * District-wise counts scoped to a single state. Added for the dashboard's
   * drilldown chart - getDashboardAnalytics()'s districtwiseCount is global
   * across all states, so it can't answer "districts within Maharashtra".
   * Reuses the same getCarpenters() call and groupBy/topItems helpers as
   * getDashboardAnalytics() rather than adding a new repository method.
   */
  async getDistrictDistribution(state) {
    const carpenters = await this.repository.getCarpenters();
    const scoped = state ? carpenters.filter((carpenter) => carpenter.state === state) : carpenters;
    const districtwiseCount = this.groupBy(scoped, 'district');
    return this.topItems(districtwiseCount, Object.keys(districtwiseCount).length);
  }

  /**
   * City/town-wise counts scoped to a single state + district. Assumes the
   * carpenter record's field is named `city` - rename below if your schema
   * uses `town` or something else instead.
   */
  async getCityDistribution(state, district) {
    const carpenters = await this.repository.getCarpenters();
    const scoped = carpenters.filter(
      (carpenter) => (!state || carpenter.state === state) && (!district || carpenter.district === district)
    );
    const citywiseCount = this.groupBy(scoped, 'city');
    return this.topItems(citywiseCount, Object.keys(citywiseCount).length);
  }

  async isCertificateCompleted(carpenter){
    return carpenter.has_certificate === true
  }

  isTrainingCompleted(carpenter) {
    return carpenter?.batch_data?.status === "COMPLETED";
  }

  isInsured(carpenter) {
    const value = carpenter.has_insurance;
    return value === true || value === 'true' || value === 'TRUE' || value === 'yes' || value === 'YES' || value === 'Y';
  }

  matchesPeriod(createdAt, period = 'monthly') {
    const date = createdAt ? new Date(createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.floor((month - 1) / 3) + 1;

    if (period === 'monthly') {
      return year === currentYear && month === currentMonth;
    }

    if (period === 'quarterly') {
      return year === currentYear && quarter === currentQuarter;
    }

    return year === currentYear;
  }

  buildTimelineAnalytics(items) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthly = {
      registrations: [],
      insurance: [],
      certificates: [],
    };

    let registrationsCount = 0;
    let insuranceCount = 0;
    let certificatesCount = 0;

    monthNames.forEach((name, index) => {
      const monthIndex = index + 1;
      const monthItems = items.filter((item) => {
        const date = item.created_at ? new Date(item.created_at) : null;
        return date && date.getFullYear() === currentYear && date.getMonth() + 1 === monthIndex;
      });

      registrationsCount += monthItems.length;
      insuranceCount += monthItems.filter((item) => this.isInsured(item)).length;
      certificatesCount += monthItems.filter((item) => this.isCertificateCompleted(item)).length;

      monthly.registrations.push({ name, value: registrationsCount });
      monthly.insurance.push({ name, value: insuranceCount });
      monthly.certificates.push({ name, value: certificatesCount });
    });

    return { monthly };
  }

  buildRegistrationAnalytics(items) {
    return items.reduce((acc, carpenter) => {
      const state = carpenter.state || 'UNKNOWN';
      const district = carpenter.district || 'UNKNOWN';
      if (!acc[state]) {
        acc[state] = { total: 0, districts: {} };
      }
      acc[state].total += 1;
      acc[state].districts[district] = (acc[state].districts[district] || 0) + 1;
      return acc;
    }, {});
  }

  buildInsuranceAnalytics(items) {
    return items.reduce((acc, carpenter) => {
      const state = carpenter.state || 'UNKNOWN';
      const district = carpenter.district || 'UNKNOWN';
      const insured = this.isInsured(carpenter);

      if (!acc[state]) {
        acc[state] = { insured: 0, uninsured: 0, districts: {} };
      }

      if (insured) acc[state].insured += 1;
      else acc[state].uninsured += 1;

      if (!acc[state].districts[district]) {
        acc[state].districts[district] = { insured: 0, uninsured: 0 };
      }
      if (insured) acc[state].districts[district].insured += 1;
      else acc[state].districts[district].uninsured += 1;

      return acc;
    }, {});
  }

  buildCertificateAnalytics(items) {
    return items.reduce((acc, carpenter) => {
      const state = carpenter.state || 'UNKNOWN';
      const district = carpenter.district || 'UNKNOWN';
      const completed = this.isCertificateCompleted(carpenter);

      if (!acc[state]) {
        acc[state] = { completed: 0, pending: 0, districts: {} };
      }

      if (completed) acc[state].completed += 1;
      else acc[state].pending += 1;

      if (!acc[state].districts[district]) {
        acc[state].districts[district] = { completed: 0, pending: 0 };
      }
      if (completed) acc[state].districts[district].completed += 1;
      else acc[state].districts[district].pending += 1;

      return acc;
    }, {});
  }

  groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || 'UNKNOWN';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  groupAgeRanges(items) {
    return items.reduce((acc, item) => {
      const age = Number(item.age || 0);
      let bucket = 'UNKNOWN';

      if (age < 30) bucket = 'Below 30';
      else if (age < 40) bucket = '30-39';
      else if (age < 50) bucket = '40-49';
      else bucket = '50+';

      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});
  }

  buildDailyTrend(items) {
    return items.reduce((acc, item) => {
      const day = item.created_at?.slice(0, 10) || 'UNKNOWN';
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
  }

  buildMonthlyTrend(items) {
    return items.reduce((acc, item) => {
      const month = item.created_at?.slice(0, 7) || 'UNKNOWN';
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
  }

  buildYearlyTrend(items) {
    return items.reduce((acc, item) => {
      const year = item.created_at?.slice(0, 4) || 'UNKNOWN';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
  }

  topItems(map, limit) {
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }
}

export default DashboardService;
