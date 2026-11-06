import React, { useMemo, useState } from 'react';

/**
 * Multi-select month dropdown. Values are "YYYY-MM" strings.
 * Lists the last `monthsBack` months, newest first.
 */
export default function MonthMultiSelect({ label = 'Months', selected = [], onChange, monthsBack = 24 }) {
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    const now = new Date();
    return Array.from({ length: monthsBack }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const text = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      return { value, text };
    });
  }, [monthsBack]);

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter((m) => m !== value)
        : [...selected, value]
    );
  };

  const buttonLabel = () => {
    if (selected.length === 0) return '-- All Months --';
    if (selected.length <= 2) {
      return selected.map((v) => options.find((o) => o.value === v)?.text || v).join(', ');
    }
    return `${selected.length} months selected`;
  };

  const itemClass = (active) =>
    `w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
      active
        ? 'bg-[var(--accent-glow)] text-[var(--accent-primary)] font-bold'
        : 'text-slate-700 hover:bg-[#F5F7FA] transition-colors'
    }`;

  return (
    <div className="flex flex-col relative">
      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-[#F5F7FA] border border-[#DDE3EA] hover:border-[var(--accent-primary)]/40 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--accent-primary)] font-semibold flex justify-between items-center w-full shadow-sm text-left transition-all"
      >
        <span className="truncate">{buttonLabel()}</span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>

      {open && (
        <>
          {/* Invisible Click Overlay */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDE3EA] rounded-xl shadow-xl z-40 max-h-60 overflow-y-auto p-2.5 space-y-1 animate-fadeIn"
            style={{ minWidth: '200px' }}
          >
            <button type="button" onClick={() => onChange([])} className={itemClass(selected.length === 0)}>
              -- All Months --
            </button>
            {options.map(({ value, text }) => {
              const checked = selected.includes(value);
              return (
                <label key={value} className={`${itemClass(checked)} flex items-center gap-2 cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(value)}
                    className="rounded border-[#DDE3EA] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20 h-3.5 w-3.5"
                  />
                  {text}
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
