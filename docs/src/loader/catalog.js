export class DataCatalog {
  constructor(datasets = {}) {
    this.datasets = datasets;
  }

  get(id) {
    return this.datasets[id] || null;
  }

  listByCategory() {
    const map = new Map();
    for (const [id, ds] of Object.entries(this.datasets)) {
      const cat = ds.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push({ ...ds, id });
    }
    return map;
  }

  search(query) {
    const q = query.toLowerCase();
    return Object.values(this.datasets).filter(ds =>
      ds.name.toLowerCase().includes(q) ||
      (ds.description || '').toLowerCase().includes(q) ||
      (ds.category || '').toLowerCase().includes(q)
    );
  }

  list() {
    return Object.values(this.datasets);
  }

  static async fromJSON(url = './datasets.json') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load datasets config: ${res.status}`);
    const data = await res.json();
    return new DataCatalog(data);
  }
}
