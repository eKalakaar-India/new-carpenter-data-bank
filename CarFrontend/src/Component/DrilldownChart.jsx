import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, MapPin, AlertTriangle } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import { CHART_COLORS } from '../constants/chartTheme';

const LEVEL_LABELS = {
  state: 'State-wise Carpenter Distribution',
  district: 'District-wise Carpenter Distribution',
  city: 'City / Town-wise Carpenter Distribution',
};

function DrilldownTooltip({ active, payload, isLeaf }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-xl border border-[#DDE3EA] bg-white px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-slate-800">{point.payload.name}</p>
      <p className="text-xs text-[var(--accent-primary)] font-bold mt-0.5">
        {typeof point.value === 'number' ? point.value.toLocaleString() : point.value} records
      </p>
      {!isLeaf && (
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          Click to drill down
        </p>
      )}
    </div>
  );
}

/**
 * Pure presentation component. Receives data via props, emits click events
 * upward (onBarClick, onBreadcrumbClick) and never fetches data itself -
 * all fetching/state lives in useDrilldownAnalytics, owned by DashboardPage.
 */
export default function DrilldownChart({
  level = 'state',
  data = [],
  loading = false,
  error = null,
  breadcrumbPath = ['India'],
  onBarClick,
  onBreadcrumbClick,
  isLeaf = false,
}) {
  const title = LEVEL_LABELS[level] || LEVEL_LABELS.state;

  // Remounting the chart on path change (via key) replays the bar entrance
  // animation, giving a smooth transition between drilldown levels.
  const chartKey = useMemo(() => breadcrumbPath.join('/'), [breadcrumbPath]);
  const useAngledLabels = data.length > 6;
  // console.log(data);
  return (
    <div className="vault-card flex flex-col h-[440px] hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--accent-primary)]" />
          <span>{title}</span>
        </h3>
        <Breadcrumb path={breadcrumbPath} onNavigate={onBreadcrumbClick} />
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-500">Loading {level} metrics...</span>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-650 border border-rose-100">
                <AlertTriangle size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-700">Unable to load metrics</span>
              <span className="text-[11px] text-slate-500">{error}</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <div className="p-2 rounded-lg bg-[#E8ECF2] text-slate-400 border border-[#DDE3EA]">
                <MapPin size={16} />
              </div>
              <span className="text-xs text-slate-400">No records found for this level.</span>
            </div>
          </div>
        ) : (
          <ResponsiveContainer key={chartKey} width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF4" />
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                interval={0}
                angle={useAngledLabels ? -20 : 0}
                textAnchor={useAngledLabels ? 'end' : 'middle'}
                height={useAngledLabels ? 50 : 30}
              />
              <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
              <Tooltip
                content={<DrilldownTooltip isLeaf={isLeaf} />}
                cursor={{ fill: 'rgba(133, 28, 44, 0.05)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={500}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    style={{ cursor: isLeaf ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (!isLeaf) onBarClick?.(entry.name);
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
