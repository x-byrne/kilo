export function parseCSV(text) {
  const rows = [];
  let cur = '';
  let inQ = false;
  const cells = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += ch;
    } else {
      if (ch === '"') { inQ = true; }
      else if (ch === ',') { cells.push(cur.trim()); cur = ''; }
      else if (ch === '\r' || ch === '\n') {
        cells.push(cur.trim()); cur = '';
        if (cells.some(c => c !== '')) rows.push(cells.splice(0));
      } else cur += ch;
    }
  }
  if (cur || cells.length) cells.push(cur.trim());
  if (cells.some(c => c !== '')) rows.push(cells);
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map(r => {
    const row = {};
    headers.forEach((h, i) => {
      const v = r[i];
      row[h] = v === '' || v === undefined ? null : isNaN(v) ? v : parseFloat(v);
    });
    return row;
  });
}

export function periodToNum(tp) {
  if (!tp) return null;
  const m = String(tp).match(/^(\d{4})(?:[-–](Q[1-4]|S[1-2]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))?$/);
  if (!m) return parseFloat(tp);
  const year = parseInt(m[1], 10);
  const q = m[2];
  if (!q) return year;
  if (q.startsWith('Q')) return year + (parseInt(q[1], 10) - 1) * 0.25;
  if (q.startsWith('S')) return year + (parseInt(q[1], 10) - 1) * 0.5;
  const monthMap = { Jan: 0, Feb: 0.0833, Mar: 0.1667, Apr: 0.25, May: 0.3333, Jun: 0.4167, Jul: 0.5, Aug: 0.5833, Sep: 0.6667, Oct: 0.75, Nov: 0.8333, Dec: 0.9167 };
  return year + (monthMap[q] || 0);
}

export function periodLabel(num) {
  if (num === null || num === undefined) return '';
  const year = Math.floor(num);
  const frac = num - year;
  if (Math.abs(frac) < 0.01) return String(year);
  if (Math.abs(frac - 0.25) < 0.01) return `${year}-Q1`;
  if (Math.abs(frac - 0.5) < 0.01) return `${year}-Q2`;
  if (Math.abs(frac - 0.75) < 0.01) return `${year}-Q3`;
  if (Math.abs(frac - 0.5) < 0.01 && frac >= 0.45) return `${year}-S1`;
  if (Math.abs(frac - 0.95) < 0.01) return `${year}-S2`;
  const q = Math.round(frac * 4);
  return `${year}-Q${Math.min(q, 4)}`;
}

export function interpolateSeries(rows, targetNums, valueKey = 'value') {
  if (!rows || rows.length === 0) return [];
  const points = rows
    .map(r => ({ num: periodToNum(r.period), val: r[valueKey] }))
    .filter(p => p.num !== null && p.val !== null && !isNaN(p.val))
    .sort((a, b) => a.num - b.num);
  if (points.length === 0) return [];
  const result = [];
  for (const tn of targetNums) {
    if (tn < points[0].num || tn > points[points.length - 1].num) continue;
    let i = 0;
    while (i < points.length - 1 && points[i + 1].num < tn) i++;
    if (points[i].num === tn) {
      result.push({ period: periodLabel(tn), value: points[i].val });
    } else if (i < points.length - 1) {
      const t = (tn - points[i].num) / (points[i + 1].num - points[i].num);
      const v = points[i].val + t * (points[i + 1].val - points[i].val);
      result.push({ period: periodLabel(tn), value: Math.round(v * 100) / 100 });
    }
  }
  return result;
}
