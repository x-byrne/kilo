import { interpolateSeries } from '../loader/parser.js';

export function perCapita(data, populationSeries, targetNums) {
  if (!data || !data.length || !populationSeries || !populationSeries.length) return data;
  const aligned = interpolateSeries(populationSeries, targetNums, 'value');
  const map = new Map(aligned.map(p => [p.period, p.value]));
  return data.map(d => {
    const pop = map.get(d.period);
    if (pop === undefined || pop === 0 || isNaN(pop)) return { ...d };
    return { ...d, value: d.value / pop };
  });
}
