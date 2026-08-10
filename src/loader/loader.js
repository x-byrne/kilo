import { parseCSV, periodToNum } from './parser.js';

export class DataLoader {
  constructor(baseUrl = 'https://cdn.jsdelivr.net/gh') {
    this.baseUrl = baseUrl;
  }

  async load(id) {
    const url = `${this.baseUrl}/convoy/absvis-data@main/data/${id}/${id}.csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${id}: ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);
    return rows.map(row => {
      const out = { ...row };
      if (out.TIME_PERIOD !== undefined && out.period === undefined) {
        out.period = periodToNum(out.TIME_PERIOD);
      }
      return out;
    });
  }
}
