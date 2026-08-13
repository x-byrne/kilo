export const century = {
  title: 'Chart of the Century',
  series: ['cpigroups', 'awe'],
  transformPipeline: { cpigroups: [], awe: [] },
  stats: [],
  async renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpigroups', []);
    comparison.addSeries('awe', []);
    await comparison.render(canvasId, 'index');
  }
};
