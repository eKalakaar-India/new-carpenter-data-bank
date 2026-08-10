import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Pure presentation component. Renders a path like:
 *   India > Maharashtra > Thane
 * and emits the clicked segment's index via onNavigate. The last segment
 * is always the current level and is rendered as non-interactive.
 */
export default function Breadcrumb({ path = ['India'], onNavigate }) {
  return (
    <nav aria-label="Drilldown breadcrumb" className="flex items-center gap-1.5 flex-wrap text-xs">
      {path.map((item, idx) => {
        const isLast = idx === path.length - 1;
        return (
          <span key={`${item}-${idx}`} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => !isLast && onNavigate?.(idx)}
              disabled={isLast}
              className={
                isLast
                  ? 'font-semibold text-[var(--accent-primary)] cursor-default'
                  : 'font-medium text-slate-500 hover:text-[var(--accent-primary)] hover:underline transition-colors duration-150'
              }
            >
              {item}
            </button>
            {!isLast && <ChevronRight size={12} className="text-slate-400 shrink-0" />}
          </span>
        );
      })}
    </nav>
  );
}
