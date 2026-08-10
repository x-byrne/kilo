export function normalizeSeries(rows, valueKey = 'OBS_VALUE', key = 'series', label = 'Series') {
  if (!rows || !rows.length) return [];
  return rows
    .filter(r => r.period !== undefined && r[valueKey] !== null && !isNaN(r[valueKey]))
    .map(r => ({
      key,
      label,
      value: r[valueKey],
      period: r.period
    }));
}
