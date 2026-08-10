export function ratio(numeratorData, denominatorData) {
  if (!numeratorData || !numeratorData.length || !denominatorData || !denominatorData.length) return numeratorData || [];
  const map = new Map(denominatorData.map(d => [d.period, d.value]));
  return numeratorData.map(d => {
    const denom = map.get(d.period);
    if (denom === undefined || denom === 0 || isNaN(denom)) return { ...d, value: null };
    return { ...d, value: d.value / denom };
  });
}
