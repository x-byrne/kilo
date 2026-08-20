import { ChartManager } from './chartManager.js';
import { compose, rebase, growth as growthTransform, ratio as ratioTransform, deflate, perCapita, perHousehold } from '../transforms/index.js';
import { periodToNum, periodLabel, interpolateSeries } from '../loader/parser.js';

const WARM = ['#e76f51', '#f4a261', '#e9c46a', '#d62828', '#f77f00'];
const COOL = ['#2a9d8f', '#264653', '#8ab17d', '#457b9d', '#1d3557'];

export class ComparisonManager {
  constructor(catalog, loader) {
    this.catalog = catalog;
    this.loader = loader;
    this.chartManager = new ChartManager();
    this.series = new Map();
    this.benchmarkId = null;
  }
  addSeries(id, transformPipeline = []) {
    const ds = this.catalog.get(id);
    if (!ds) throw new Error(`Unknown dataset: ${id}`);
    this.series.set(id, { id, transformPipeline, meta: ds });
  }
  removeSeries(id) {
    this.series.delete(id);
    if (this.benchmarkId === id) this.benchmarkId = null;
  }
  clear() { this.series.clear(); this.benchmarkId = null; }
  setBenchmark(id) { this.benchmarkId = id; }
  async render(canvasId, mode = 'index', from, to) {
    const ids = Array.from(this.series.keys());
    if (!ids.length) return null;
    const promises = ids.map(id => this.loader.load(id));
    const allRows = await Promise.all(promises);
    const targetNums = this._buildCommonTimeline(allRows);
    const datasets = [];
    const benchmark = this.benchmarkId ? allRows[ids.indexOf(this.benchmarkId)] : allRows[0];
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const meta = this.series.get(id).meta;
      let rows = interpolateSeries(allRows[i], targetNums, 'value');
      const pipeline = this.series.get(id).transformPipeline;
      for (const fn of pipeline) {
        if (fn === 'deflate') rows = deflate(rows, benchmark, targetNums);
        else if (fn === 'perCapita') rows = perCapita(rows, benchmark, targetNums);
        else if (fn === 'perHousehold') rows = perHousehold(rows, benchmark, targetNums);
        else if (typeof fn === 'function') rows = fn(rows);
      }
      if (mode === 'index') rows = rebase(rows, 0);
      else if (mode === 'growth') rows = growthTransform(rows, 4);
      else if (mode === 'ratio' && this.benchmarkId && id !== this.benchmarkId) rows = ratioTransform(rows, benchmark);
      if (from !== undefined && to !== undefined) {
        rows = rows.filter(r => {
          const n = typeof r.period === 'number' ? r.period : periodToNum(r.period);
          return n !== null && n >= from && n <= to;
        });
      }
      const labels = rows.map(r => typeof r.period === 'number' ? periodLabel(r.period) : r.period);
      const values = rows.map(r => r.value);
      const color = this._assignColor(i, id);
      datasets.push({
        label: meta.name,
        data: values,
        labels,
        borderColor: color,
        backgroundColor: color + '33',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2
      });
    }
    const labels = targetNums.map(n => periodLabel(n)).filter(l => {
      if (!from && !to) return true;
      const num = periodToNum(l);
      return num !== null && num >= from && num <= to;
    });
    return this.chartManager.create(canvasId, {
      type: 'line',
      data: { labels, datasets },
      options: {
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: datasets.length > 1 } }
      }
    });
  }
  _buildCommonTimeline(rowsArrays) {
    const nums = new Set();
    for (const rows of rowsArrays) {
      for (const r of rows) {
        const n = periodToNum(r.TIME_PERIOD || r.period);
        if (n !== null) nums.add(n);
      }
    }
    return Array.from(nums).sort((a, b) => a - b);
  }
  _assignColor(i, id) {
    if (id === this.benchmarkId) return '#1a1a1a';
    const useWarm = i % 2 === 0;
    const palette = useWarm ? WARM : COOL;
    return palette[i % palette.length];
  }
}
