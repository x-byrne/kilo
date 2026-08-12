export const housing = {
  title: 'Housing Affordability',
  series: ['cpihousing', 'awe'],
  transformPipeline: { cpihousing: [], awe: [] },
  stats: [],
  renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpihousing', []);
    comparison.addSeries('awe', []);
    comparison.render(canvasId, 'index');
  }
};
