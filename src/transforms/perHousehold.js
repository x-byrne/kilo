import { interpolateSeries } from '../loader/parser.js';

export function perHousehold(data, householdSeries) {
  if (!data || !data.length || !householdSeries || !householdSeries.length) return data;
  const targetNums = data.map(d => d.period).filter(p => p !== null && p !== undefined);
  const aligned = interpolateSeries(householdSeries, targetNums, 'value');
  const map = new Map(aligned.map(p => [p.period, p.value]));
  return data.map(d => {
    const hh = map.get(d.period);
    if (hh === undefined || hh === 0 || isNaN(hh)) return { ...d };
    return { ...d, value: d.value / hh };
  });
}
