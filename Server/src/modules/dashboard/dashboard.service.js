import DashboardRepository from './dashboard.repository.js';
import { logger } from '../../utils/logger.js';
import { supabase } from '../../config/supabase.js';

class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
  }

  /**
   * Extracts unique financial years from carpenters data based on created_at field.
   * Returns sorted array of financial years in format "YYYY-YY" (e.g., "2025-26")
   */
  async getAvailableFinancialYears() {
    const carpenters = await this.repository.getCarpenters();
    const years = new Set();

    carpenters.forEach((carpenter) => {
      if (carpenter.created_at) {
        const fy = this.getFinancialYear(new Date(carpenter.created_at));
        years.add(fy);
      }
    });

    // Also check batches table for workshop_date
    const { data: batches, error } = await supabase.from('batches').select('workshop_date');
    if (!error && batches) {
      batches.forEach((batch) => {
        if (batch.workshop_date) {
          const fy = this.getFinancialYear(new Date(batch.workshop_date));
          years.add(fy);
        }
      });
    }

    return Array.from(years).sort();
  }

  /**
   * Calculates financial year from a date (April-March).
   * April 2025 to March 2026 = FY "2025-26"
   */
  getFinancialYear(date) {
    if (!date || Number.isNaN(date.getTime())) return null;
    const month = date.getMonth(); // 0-indexed, so March = 2
    const year = date.getFullYear();
    // If month is January, February, or March (0, 1, 2), current FY started in previous year
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  }

  /**
   * Filters carpenters by financial year (based on created_at).
   * If fy is 'all' or null, returns all carpenters.
   */
  filterByFinancialYear(carpenters, fy) {
    if (!fy || fy === 'all') return carpenters;
    return carpenters.filter((carpenter) => {
      if (!carpenter.created_at) return false;
      return this.getFinancialYear(new Date(carpenter.created_at)) === fy;
    });
  }

  /**
   * Gets KPI data filtered by financial year.
   * FY filter only affects these KPI cards.
   */
  async getDashboardKPIs(fy = 'all') {
    const carpenters = await this.repository.getCarpenters();
    const filtered = this.filterByFinancialYear(carpenters, fy);

    const totalCarpenters = filtered.length;
    const activeCarpenters = filtered.filter((carpenter) => this.isTrainingCompleted(carpenter)).length;
    const inactiveCarpenters = totalCarpenters - activeCarpenters;

    const completedTraining = filtered.filter((carpenter) => this.isTrainingCompleted(carpenter)).length;
    const pendingTraining = filtered.filter((carpenter) => !this.isTrainingCompleted(carpenter)).length;
    const trainingPercentage = totalCarpenters ? Math.round((completedTraining / totalCarpenters) * 100) : 0;

    const insured = filtered.filter((carpenter) => this.isInsured(carpenter)).length;
    const notInsured = filtered.filter((carpenter) => !this.isInsured(carpenter)).length;
    const insurancePercentage = totalCarpenters ? Math.round((insured / totalCarpenters) * 100) : 0;
    const certificateDispatched = filtered.filter((carpenter) => this.isCertificateCompleted(carpenter)).length;

    return {
      general: {
        totalCarpenters,
        totalActiveCarpenters: activeCarpenters,
        totalInactiveCarpenters: inactiveCarpenters,
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
    };
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
    console.log()

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
        training: this.buildTrainingAnalytics(scopedForPeriod)
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
  

  isCertificateCompleted(carpenter){
    return carpenter.has_certificate === true
  }

  isTrainingCompleted(carpenter) {
    const hasTrained = carpenter.has_trained === true || String(carpenter.has_certificate).toUpperCase() === "TRUE";

    const batchCompleted = Array.isArray(carpenter.batch_data) ? carpenter.batch_data.some(
          (batch) =>
            String(batch?.status).trim().toUpperCase() === "COMPLETED"
        )
      : String(carpenter.batch_data?.status).trim().toUpperCase() === "COMPLETED";

    return hasTrained || batchCompleted;
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
    const financialYearMonths = [
      { name: 'Apr', month: 4 },
      { name: 'May', month: 5 },
      { name: 'Jun', month: 6 },
      { name: 'Jul', month: 7 },
      { name: 'Aug', month: 8 },
      { name: 'Sep', month: 9 },
      { name: 'Oct', month: 10 },
      { name: 'Nov', month: 11 },
      { name: 'Dec', month: 12 },
      { name: 'Jan', month: 1 },
      { name: 'Feb', month: 2 },
      { name: 'Mar', month: 3 }
    ];

    const getFinancialYearStart = (date) =>
      date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;

    const formatFinancialYear = (startYear) =>
      `${startYear}-${String(startYear + 1).slice(-2)}`;

    const validItems = Array.isArray(items)
      ? items
        .map((item) => ({ item, date: item.created_at ? new Date(item.created_at) : null }))
        .filter(({ date }) => date && !Number.isNaN(date.getTime()))
      : [];

    if (validItems.length === 0) {
      return { years: [], yearly: {} };
    }

    const financialYears = [
      ...new Set(validItems.map(({ date }) => getFinancialYearStart(date)))
    ].sort((a, b) => a - b);

    const yearly = {};

    financialYears.forEach((startYear) => {
      const monthly = {
        registrations: [],
        insurance: [],
        certificates: [],
        training: []
      };

      const totals = {
        registrations: 0,
        insurance: 0,
        certificates: 0,
        training: 0
      };

      financialYearMonths.forEach(({ name, month }) => {
        const monthItems = validItems.filter(({ date }) => {
          return (
            getFinancialYearStart(date) === startYear &&
            date.getMonth() + 1 === month
          );
        });

        const values = {
          registrations: monthItems.length,
          insurance: monthItems.filter(({ item }) => this.isInsured(item)).length,
          certificates: monthItems.filter(({ item }) => this.isCertificateCompleted(item)).length,
          training: monthItems.filter(({ item }) => this.isTrainingCompleted(item)).length
        };

        Object.entries(values).forEach(([metric, value]) => {
          monthly[metric].push({ name, value });
          totals[metric] += value;
        });
      });

      yearly[formatFinancialYear(startYear)] = { monthly, totals };
    });

    return {
      years: financialYears.map(formatFinancialYear),
      yearly
    };
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

  buildTrainingAnalytics(items) {
    return items.reduce((acc, carpenter) => {
      const state = carpenter.state || "UNKNOWN";
      const district = carpenter.district || "UNKNOWN";

      const isCompleted = carpenter.has_certificate === true || carpenter.batch_data?.status === "COMPLETED";

      if (!acc[state]) {
        acc[state] = {
          total: 0,
          completed: 0,
          pending: 0,
          districts: {},
        };
      }

      acc[state].total += 1;

      if (isCompleted) {
        acc[state].completed += 1;
      } else {
        acc[state].pending += 1;
      }

      if (!acc[state].districts[district]) {
        acc[state].districts[district] = {
          total: 0,
          completed: 0,
          pending: 0,
        };
      }

      acc[state].districts[district].total += 1;

      if (isCompleted) {
        acc[state].districts[district].completed += 1;
      } else {
        acc[state].districts[district].pending += 1;
      }

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

  /**
   * Gets all completed batches with their participant data for report generation.
   * Filters by financial year if provided.
   */
  async getCompletedBatchesForReport(fy = 'all') {
    console.log("Hello")
    const { data: batches, error } = await supabase
      .from('batches')
      .select(`
        id,
        batch_id,
        workshop_date,
        state,
        district,
        city_town,
        full_address,
        trainer_name,
        trainer_phoneno,
        status,
        batch_img,
        batch_video,
        created_at,
        mobiliser:platform_users!fk_batches_mobiliser(id, name, email, phone_no),
        participants:participants!participants_batch_id_fkey(
          id,
          full_name,
          mobile_no,
          email_id,
          gender,
          has_trained,
          has_insurance,
          has_certificate,
          created_at
        )
      `)
      .eq('status', 'COMPLETED')
      .order('workshop_date', { ascending: false });

    if (error) {
      logger.error('Failed to fetch completed batches:', error);
      return [];
    }

    if (!batches) return [];

    // Filter by financial year if specified
    if (fy && fy !== 'all') {
      return batches.filter((batch) => {
        if (!batch.workshop_date) return false;
        return this.getFinancialYear(new Date(batch.workshop_date)) === fy;
      });
    }

    return batches;
  }

  /**
   * Prepares batch data for Excel export with proper formatting.
   * Maps database fields to Excel columns.
   */
  async getExcelReportData(fy = 'all') {
    const batches = await this.getCompletedBatchesForReport(fy);

    const batchRows = batches.map((batch) => {
      const participants = batch.participants || [];
      const trainedCount = participants.filter((p) => p.has_trained === true).length;

      return {
        'Batch No': batch.batch_id || 'N/A',
        'State': batch.state || 'N/A',
        'District': batch.district || 'N/A',
        'Training Location': batch.full_address || 'N/A',
        'Type of Centre': batch.city_town || 'N/A',
        'Training Date': batch.workshop_date
          ? new Date(batch.workshop_date).toLocaleDateString('en-IN')
          : 'N/A',
        'Month': batch.workshop_date
          ? new Date(batch.workshop_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
          : 'N/A',
        'Number of Trainees': participants.length,
        'Number Trained': trainedCount,
        'Insurance': batch.participants?.filter((p) => p.has_insurance).length || 0,
        'Certificate': trainedCount,
        'Training Details/Remarks': `Trainer: ${batch.trainer_name || 'N/A'}, Phone: ${batch.trainer_phoneno || 'N/A'}`,
      };
    });

    const participantRows = batches.flatMap((batch) =>
      (batch.participants || []).map((p, idx) => ({
        'Sr. No': idx + 1,
        'System ID': p.id || 'N/A',
        'Batch No': batch.batch_id || 'N/A',
        'Participant Name': p.full_name || 'N/A',
        'Phone': p.mobile_no || 'N/A',
        'Email': p.email || 'N/A',
        'Gender': p.gender || 'N/A',
        'Trained': p.has_trained ? 'Yes' : 'No',
        'Insurance': p.has_insurance ? 'Yes' : 'No',
        'Certificate': p.has_certificate ? 'Yes' : 'No',
        'State': batch.state || 'N/A',
        'District': batch.district || 'N/A',
        'Training Date': batch.workshop_date
          ? new Date(batch.workshop_date).toLocaleDateString('en-IN')
          : 'N/A',
      }))
    );
    console.log( participantRows[0]);
    return { batchRows, participantRows };
  }

  /**
   * Prepares batch data for Word/PDF report with detailed information.
   * Includes batch details, participant list, and photo references.
   */
  async getDetailedBatchReportData(fy = 'all') {
    const batches = await this.getCompletedBatchesForReport(fy);

    return batches.map((batch) => {
      const participants = batch.participants || [];
      const trainedCount = participants.filter((p) => p.has_trained === true).length;
      const insuredCount = participants.filter((p) => p.has_insurance === true).length;

      return {
        batchId: batch.batch_id || 'N/A',
        batchNo: batch.id,
        state: batch.state || 'N/A',
        district: batch.district || 'N/A',
        trainingLocation: batch.full_address || 'N/A',
        typeCentre: batch.city_town || 'N/A',
        trainingDate: batch.workshop_date
          ? new Date(batch.workshop_date).toLocaleDateString('en-IN')
          : 'N/A',
        trainerName: batch.trainer_name || 'N/A',
        trainerPhone: batch.trainer_phoneno || 'N/A',
        totalTrainees: participants.length,
        numberTrained: trainedCount,
        insuranceCount: insuredCount,
        certificateCount: trainedCount,
        mobiliser: batch.mobiliser?.name || 'N/A',
        mobiliserPhone: batch.mobiliser?.phone_no || 'N/A',
        photos: Array.isArray(batch.batch_img) ? batch.batch_img : (batch.batch_img ? [batch.batch_img] : []),
        participantList: participants.map((p, idx) => ({
          srNo: idx + 1,
          name: p.full_name || 'N/A',
          trained: p.has_certificate === true ? 'Yes' : 'No',
        })),
        createdAt: batch.created_at
          ? new Date(batch.created_at).toLocaleDateString('en-IN')
          : 'N/A',
      };
    });
  }
}

export default DashboardService;
