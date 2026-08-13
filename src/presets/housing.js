export const housing = {
  title: 'Housing Affordability',
  series: ['cpihousing', 'awe'],
  transformPipeline: { cpihousing: [], awe: [] },
  stats: [],
  async renderChart(canvasId, comparison) {
    comparison.clear();
    comparison.addSeries('cpihousing', []);
    comparison.addSeries('awe', []);
    await comparison.render(canvasId, 'index');
  }
};
