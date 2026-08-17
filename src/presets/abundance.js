export const abundance = {
  title: 'Abundance Index',
  series: ['cpi', 'awe'],
  transformPipeline: { cpi: [], awe: [] },
  stats: [
    { id: 'abundance', label: 'Abundance', value: '—' },
    { id: 'timeprice', label: 'Time Price', value: '—' },
    { id: 'awe', label: 'AWE', value: '—' },
    { id: 'cpi', label: 'CPI', value: '—' }
  ],
  async renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpi', []);
    comparison.addSeries('awe', []);
    await comparison.render(canvasId, 'index');
  }
};
