import DashboardRepository from './dashboard.repository.js';
import { logger } from '../../utils/logger.js';

class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
  }

  async getDashboardAnalytics() {
    const carpenters = await this.repository.getCarpenters();
    const recentRegistrations = await this.repository.getRecentRegistrations(10);

    const totalCarpenters = carpenters.length;
    const activeCarpenters = carpenters.filter((carpenter) => carpenter.has_certificate === 'COMPLETED').length;
    const inactiveCarpenters = totalCarpenters - activeCarpenters;

    const today = new Date().toISOString().slice(0, 10);
    const todaysRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.startsWith(today)).length;
    const monthlyRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.slice(0, 7) === today.slice(0, 7)).length;
    const yearlyRegistrations = carpenters.filter((carpenter) => carpenter.created_at?.slice(0, 4) === today.slice(0, 4)).length;

    const completedTraining = carpenters.filter((carpenter) => carpenter.has_certificate === 'TRUE').length;
    const pendingTraining = carpenters.filter((carpenter) => carpenter.has_certificate === 'FALSE').length;
    const trainingPercentage = totalCarpenters ? Math.round((completedTraining / totalCarpenters) * 100) : 0;

    const insured = carpenters.filter((carpenter) => carpenter.insurance_enrolled === 'INSURED').length;
    const notInsured = carpenters.filter((carpenter) => carpenter.insurance_enrolled === 'NOT_INSURED').length;
    const insurancePercentage = totalCarpenters ? Math.round((insured / totalCarpenters) * 100) : 0;

    const genderDistribution = this.groupBy(carpenters, 'gender');
    const ageGroupDistribution = this.groupAgeRanges(carpenters);
    const statewiseCount = this.groupBy(carpenters, 'state');
    const districtwiseCount = this.groupBy(carpenters, 'district');
    const tradewiseCount = this.groupBy(carpenters, 'trade');

    logger.info('Dashboard analytics accessed');

    return {
      general: {
        totalCarpenters,
        totalActiveCarpenters: activeCarpenters,
        totalInactiveCarpenters: inactiveCarpenters,
        todaysRegistrations,
        monthlyRegistrations,
        yearlyRegistrations,
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
      recentActivities: recentRegistrations.slice(0, 10),
    };
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
