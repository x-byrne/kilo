import { interpolateSeries } from '../loader/parser.js';

export function deflate(data, deflatorSeries, targetNums) {
  if (!data || !data.length || !deflatorSeries || !deflatorSeries.length) return data;
  const aligned = interpolateSeries(deflatorSeries, targetNums, 'value');
  const map = new Map(aligned.map(p => [p.period, p.value]));
  return data.map(d => {
    const deflator = map.get(d.period);
    if (deflator === undefined || deflator === 0 || isNaN(deflator)) return { ...d };
    return { ...d, value: d.value / deflator };
  });
}
