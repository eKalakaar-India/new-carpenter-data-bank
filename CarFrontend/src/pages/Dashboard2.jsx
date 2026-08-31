import React, { useEffect, useMemo, useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import {
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building,
  FileSpreadsheet,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  History,
  Heart,
  Globe,
  Compass,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import StatCard from '../Component/StatCard';
import DrilldownChart from '../Component/DrilldownChart';
import useDrilldownAnalytics from '../hooks/useDrilldownAnalytics';
import dashboardService from '../services/dashboardService';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from '../constants/chartTheme';
import { useNavigate } from 'react-router-dom';

// KPI card configuration - decoupled from the vault store and fetched
// independently via dashboardService.getDashboardStats(), per the required
// backend contract. Icons/descriptions mirror the original stat cards.
const STAT_CARD_CONFIG = [
  { key: 'totalCarpenters', label: 'Registration', icon: Users, desc: 'Historical Carpenter Count' },
  { key: 'completedTraining', label: 'Trained', icon: Building, desc: 'Functional Registration' },
  { key: 'totalInsurance', label: 'Insurance', icon: FileSpreadsheet, desc: 'Processed Insurance' },
  { key: 'totalCertificates', label: 'Certificates', icon: FileCheck2, desc: 'Issued Certificates on File' },
];

const COLORS = [
    '#851C2C', // Ekalakaar Deep Cherry Red (Primary)
    '#0284C7', // Sky Blue
    '#0D9488', // Deep Teal
    '#EAB308', // Warm Amber/Gold
    '#8B5CF6', // Purple/Violet
    '#10B981', // Emerald Green
    '#F43F5E'  // Premium Rose
  ];

export default function Dashboard() {
  const {
    analyticsData,
    analyticsLoading,
    fetchAnalytics,
    isAuthenticated
  } = useVaultStore();

  const [analyticsType, setAnalyticsType] = useState('registrations');
  const [timeline, setTimeline] = useState('monthly');
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchAnalytics(timeline);
  }, [fetchAnalytics, timeline]);

  useEffect(() => {
    setViewMode(timeline === 'monthly' ? 'monthly' : 'statewise');
  }, [timeline]);

  const availableYears =  analyticsData?.timelineAnalytics?.years || [];
  const selectedYearData =  analyticsData?.timelineAnalytics?.yearly?.[selectedYear];
  const yearlyTotals = selectedYearData?.totals || {};

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  // --- Section 1: Statistics Cards -----------------------------------
  // dashboard.service.js's single /api/dashboard endpoint already returns
  // everything these cards need, and fetchAnalytics() above already pulls
  // it - so this just re-shapes analyticsData, no second network call.
  const dashboardStats = useMemo(() => dashboardService.getDashboardStats(analyticsData), [analyticsData]);
  // The store's fetchAnalytics() doesn't currently surface a distinct error
  // message (it only console.errors on failure), so this infers an error
  // state from "done loading, still no data." Add an `analyticsError` field
  // to fetchAnalytics (mirroring authError/uploadError) if you want the
  // real backend message shown here instead.
  const statsError = !analyticsLoading && !analyticsData ? 'Failed to load dashboard statistics' : null;

  // --- Section 2: Interactive Drilldown Analytics ---------------------
  // Root (state) level also comes straight from analyticsData - no fetch
  // needed until the user actually drills into a state.
  const stateDrilldownRoot = useMemo(() => {
    const statewiseCount = analyticsData?.demographics?.statewiseCount;
    if (!statewiseCount) return [];
    return Object.entries(statewiseCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [analyticsData]);

  const drilldownRoot = useMemo(() => analyticsData?.dashboardAnalytics?.[analyticsType] || {}, [analyticsData, analyticsType]);
  const drilldown = useDrilldownAnalytics(drilldownRoot);

  useEffect(() => {
    drilldown.navigateTo(0);
  }, [analyticsType, viewMode, drilldown.navigateTo]);

  if (analyticsLoading || !analyticsData) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Consulting relationship archives...</span>
        </div>
      </div>
    );
  }

  const { general, demographics, training, recentActivities } = analyticsData;

  const labelMap = {
    totalCarpenters: "Total",
    totalActiveCarpenters: "Active",
    totalInactiveCarpenters: "Inactive",
    todaysRegistrations: "Today",
    monthlyRegistrations: "Month",
    yearlyRegistrations: "Year",
  };

  const radarChartData = Object.entries(general).map(([key, value]) => ({
    subject: labelMap[key] || key,
    value: Number(value),
  }));

  const stateChartData = Object.entries(demographics.statewiseCount)
  .sort(([, countA], [, countB]) => countB - countA)
  .slice(0, 5)
  .map(([name, count]) => ({
    name,
    count,
  }));

  const reliabilityChartData = Object.entries(training).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  // Smart insights calculation
  const mostActiveState = stateChartData[0]?.name || 'N/A';
  const topCategoryData = Object.entries(demographics.tradewiseCount ?? {}).reduce(
    (max, [name, count]) =>
      count > max.count ? { name, count } : max,
    { name: "None", count: 0 }
  );
  const topCategory = topCategoryData.name;

  // Ledger completeness calculation
  const healthScore = general.totalCarpenters > 0 ? 98 : 100;

  return (
    <div className="space-y-8 pb-10">

      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-wide text-slate-900">
            Carpenter <span className="font-normal italic text-[var(--accent-primary)]">Dashboard</span>
          </h2>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARD_CONFIG.map((cfg) => (
          <StatCard
            key={cfg.key}
            label={cfg.label}
            desc={cfg.desc}
            icon={cfg.icon}
            value={dashboardStats ? dashboardStats[cfg.key] : undefined}
            loading={analyticsLoading}
            error={statsError}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <label className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Analytics</span>
          <select
            value={analyticsType}
            onChange={(event) => setAnalyticsType(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 outline-none"
          >
            <option value="registrations">Registrations</option>
            <option value="insurance">Insurance</option>
            <option value="certificates">Certificates</option>
            <option value="training">Trained</option>
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Timeline</span>
          <select
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            className="bg-transparent text-sm font-medium text-slate-800 outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="statewise">State wise</option>
          </select>
        </label>
      </div>

      {viewMode === 'monthly' ? (
        <div className="vault-card flex flex-col h-[440px] hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-3 mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--accent-primary)]" />
              {/* <span>{analyticsType.charAt(0).toUpperCase() + analyticsType.slice(1)}</span> */}
              <div className="ml-2 flex items-center gap-1 w-full justify-between">
                <p className="text-sm text-[var(--accent-primary)] font-semibold">
                  Total Yearly {analyticsType}: {yearlyTotals[analyticsType]}
                </p>
              </div>
            </h3>

          </div>
          <div className="flex-1 min-h-0">
            {/* <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.timelineAnalytics?.yearly[year][analyticsType] || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE3EA', color: '#1E293B', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--accent-primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#851C2C" fill="#851C2C" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer> */}

            <div className="w-full h-full flex flex-col">

              {/* Year navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);

                    if (currentIndex > 0) {
                      setSelectedYear(availableYears[currentIndex - 1]);
                    }
                  }}
                  disabled={
                    availableYears.length === 0 ||
                    availableYears.indexOf(selectedYear) === 0
                  }
                  className="px-3 py-1 rounded-md border border-slate-200 text-sm disabled:opacity-40"
                >
                  ←
                </button>

                <div className="flex items-center gap-2">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        selectedYear === year
                          ? "bg-[#851C2C] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = availableYears.indexOf(selectedYear);

                    if (
                      currentIndex !== -1 &&
                      currentIndex < availableYears.length - 1
                    ) {
                      setSelectedYear(availableYears[currentIndex + 1]);
                    }
                  }}
                  disabled={
                    availableYears.length === 0 ||
                    availableYears.indexOf(selectedYear) ===
                      availableYears.length - 1
                  }
                  className="px-3 py-1 rounded-md border border-slate-200 text-sm disabled:opacity-40"
                >
                  →
                </button>
              </div>

              {/* Chart */}
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      analyticsData?.timelineAnalytics?.yearly?.[selectedYear]?.monthly?.[analyticsType] || []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />

                    <XAxis
                      dataKey="name"
                      stroke="#64748B"
                      fontSize={10}
                    />

                    <YAxis
                      stroke="#64748B"
                      fontSize={10}
                      allowDecimals={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#DDE3EA',
                        color: '#1E293B',
                        borderRadius: '12px'
                      }}
                      itemStyle={{
                        color: 'var(--accent-primary)'
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#851C2C"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <DrilldownChart
          level={drilldown.level}
          data={drilldown.data}
          loading={analyticsLoading}
          error={null}
          breadcrumbPath={drilldown.breadcrumbPath}
          onBarClick={drilldown.drillInto}
          onBreadcrumbClick={drilldown.navigateTo}
          isLeaf={drilldown.isLeaf}
        />
      )}

      <div className='flex gap-4'>
        <div className="w-1/2 vault-card lg:col-span-1 flex flex-col h-[380px] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={14} className="text-[var(--accent-primary)]" />
            <span>General Registration Distribution</span>
          </h3>
          
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11 }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, "auto"]}
                />

                <Radar
                  name="Statistics"
                  dataKey="value"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.4}
                />

                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State-wise Records Bar Chart */}
        <div className="w-1/2 vault-card lg:col-span-1 flex flex-col h-[380px] hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--accent-primary)]" />
            <span>State Demographics (Top 5)</span>
          </h3>
          <div className="flex-1 min-h-0">
            {stateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DDE3EA', color: '#1E293B', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--accent-primary)' }}
                  />
                  <Bar dataKey="count">
                    {stateChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">No demographic data.</div>
            )}
          </div>
        </div>

      </div>

        

    </div>
  );
}