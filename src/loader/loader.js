export class DataLoader {
  constructor(baseUrl = 'https://cdn.jsdelivr.net/gh') {
    this.baseUrl = baseUrl;
  }
  async load(id) {
    const url = `${this.baseUrl}/user/repo@main/data/${id}/${id}.csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${id}: ${res.status}`);
    const text = await res.text();
    return this.parse(text);
  }
  parse(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, i) => {
        const v = vals[i];
        row[h] = isNaN(v) ? v : parseFloat(v);
      });
      return row;
    });
  }
}
