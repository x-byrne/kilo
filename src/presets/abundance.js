export const abundance = {
  title: 'Abundance Index',
  series: ['cpi', 'awe'],
  transformPipeline: { cpi: [], awe: [] },
  stats: [
    { label: 'Abundance', value: '—' },
    { label: 'Time Price', value: '—' },
    { label: 'AWE', value: '—' },
    { label: 'CPI', value: '—' }
  ],
  renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpi', []);
    comparison.addSeries('awe', []);
    comparison.render(canvasId, 'index');
  }
};
