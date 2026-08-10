import { useCallback, useMemo, useState } from 'react';

/**
 * Owns drilldown state for the dashboard's interactive analytics chart.
 *
 * This version uses the dashboard payload already provided by the backend,
 * so it does not trigger extra requests when drilling into states or
 * districts. It supports the new registrations / insurance / certificates
 * hierarchy directly.
 */
export default function useDrilldownAnalytics(rootData = {}) {
  const [selection, setSelection] = useState({ state: null, district: null });

  const level = selection.state ? 'district' : 'state';
  const isLeaf = level === 'district';

  const data = useMemo(() => {
    if (!rootData || typeof rootData !== 'object' || Array.isArray(rootData)) return [];

    if (level === 'state') {
      return Object.entries(rootData)
        .map(([name, value]) => {
          const metric = typeof value === 'number' ? value : value?.total ?? value?.insured ?? value?.completed ?? 0;
          return { name, count: metric };
        })
        .sort((a, b) => b.count - a.count);
    }

    const stateData = rootData[selection.state] || null;
    const districtData = stateData?.districts || {};

    return Object.entries(districtData)
      .map(([name, value]) => {
        const metric = typeof value === 'number'
          ? value
          : value?.insured ?? value?.completed ?? value?.total ?? 0;
        return { name, count: metric };
      })
      .sort((a, b) => b.count - a.count);
  }, [level, rootData, selection.state]);

  const breadcrumbPath = useMemo(() => {
    const path = ['India'];
    if (selection.state) path.push(selection.state);
    if (selection.district) path.push(selection.district);
    return path;
  }, [selection.state, selection.district]);

  const drillInto = useCallback((name) => {
    setSelection((prev) => {
      if (!prev.state) return { state: name, district: null };
      return { ...prev, district: name };
    });
  }, []);

  const navigateTo = useCallback((index) => {
    if (index === 0) {
      setSelection({ state: null, district: null });
    } else if (index === 1) {
      setSelection((prev) => ({ state: prev.state, district: null }));
    }
  }, []);

  return {
    level,
    isLeaf,
    data,
    breadcrumbPath,
    drillInto,
    navigateTo,
    selectedState: selection.state,
    selectedDistrict: selection.district,
  };
}