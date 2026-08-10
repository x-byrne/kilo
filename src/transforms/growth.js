export function growth(data, lag = 1) {
  if (!data || !data.length) return [];
  const out = [];
  for (let i = 0; i < data.length; i++) {
    if (i < lag) { out.push({ ...data[i], value: null }); continue; }
    const prev = data[i - lag].value;
    const curr = data[i].value;
    if (prev === null || prev === 0 || isNaN(prev) || curr === null || isNaN(curr)) {
      out.push({ ...data[i], value: null });
    } else {
      out.push({ ...data[i], value: ((curr - prev) / prev) * 100 });
    }
  }
  return out;
}
