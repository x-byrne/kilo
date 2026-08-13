export function rebase(data, atIndex) {
  if (!data || !data.length) return [];
  const base = data[Math.max(0, Math.min(atIndex, data.length - 1))].value;
  if (base === 0 || base === null || isNaN(base)) return data.map(d => ({ ...d }));
  return data.map(d => ({ ...d, value: (d.value / base) * 100 }));
}
