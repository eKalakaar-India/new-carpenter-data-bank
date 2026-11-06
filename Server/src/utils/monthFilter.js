const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Parse a comma-separated "YYYY-MM,YYYY-MM" query value into a de-duplicated
 * array of valid months. Invalid entries are dropped (they are interpolated
 * into a PostgREST filter string, so only strict YYYY-MM values are allowed).
 */
export const parseMonths = (value) => {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(list.map((m) => String(m).trim()).filter((m) => MONTH_RE.test(m)))];
};

/**
 * Build a PostgREST `or` filter that matches rows whose `column` falls in ANY
 * of the given months: and(col.gte.YYYY-MM-01,col.lt.<first of next month>),...
 * Returns null when there are no months.
 */
export const buildMonthsOrFilter = (column, months = []) => {
  const valid = months.filter((m) => MONTH_RE.test(m));
  if (valid.length === 0) return null;

  return valid
    .map((ym) => {
      const [year, month] = ym.split('-').map(Number);
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const nextYear = month === 12 ? year + 1 : year;
      const nextMonth = month === 12 ? 1 : month + 1;
      const end = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      return `and(${column}.gte.${start},${column}.lt.${end})`;
    })
    .join(',');
};
