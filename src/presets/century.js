export const century = {
  title: 'Chart of the Century',
  series: ['cpigroups', 'awe'],
  transformPipeline: { cpigroups: [], awe: [] },
  stats: [],
  renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpigroups', []);
    comparison.addSeries('awe', []);
    comparison.render(canvasId, 'index');
  }
};
