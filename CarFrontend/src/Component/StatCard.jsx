import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Pure, reusable KPI card. Mirrors the exact markup/classes of the original
 * inline stat cards in Dashboard.jsx so the visual design is unchanged -
 * this component just adds loading/empty/error handling around it.
 *
 * No fetching, no business logic - value/loading/error all come from props.
 */
export default function StatCard({ label, value, icon: Icon, desc, loading = false, error = null }) {
  const isEmpty = !loading && !error && (value === null || value === undefined || value === '');

  return (
    <div className="vault-card group hover:scale-[1.03] hover:shadow-lg duration-300 transition-all border border-[#DDE3EA] hover:border-[var(--accent-primary)]/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>

          {loading ? (
            <span className="mt-2 h-8 w-20 rounded-md bg-[#ECEFF4] animate-pulse" aria-label="Loading" />
          ) : error ? (
            <span className="text-sm font-semibold text-rose-650 mt-2">Unavailable</span>
          ) : isEmpty ? (
            <span className="text-2xl font-serif font-bold text-slate-400 mt-2">—</span>
          ) : (
            <span className="text-3xl font-serif font-bold text-slate-850 mt-2 transition-colors group-hover:text-[var(--accent-primary)]">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          )}
        </div>

        <div
          className={
            error
              ? 'p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-650 shadow-sm'
              : 'p-3 rounded-xl bg-[#E8ECF2] border border-[#DDE3EA] text-[var(--accent-primary)] shadow-sm group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-all duration-300'
          }
        >
          {error ? <AlertTriangle size={18} /> : <Icon size={18} />}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 border-t border-[#DDE3EA] pt-3">
        {error ? error : desc}
      </p>
    </div>
  );
}
