import { DataCatalog } from './src/loader/catalog.js';
import { DataLoader } from './src/loader/loader.js';
import { ComparisonManager } from './src/charts/comparisonManager.js';
import { parseCSV, periodToNum, periodLabel } from './src/loader/parser.js';
import { rebase, growth, ratio } from './src/transforms/index.js';

// Mock Chart.js
class MockChart {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.destroyed = false;
    console.log('Chart created on canvas:', canvas?.id || 'unknown');
    console.log('Chart type:', config.type);
    console.log('Datasets count:', config.data?.datasets?.length || 0);
    if (config.data?.datasets?.[0]?.data) {
      console.log('First dataset points:', config.data.datasets[0].data.length);
      console.log('First point:', JSON.stringify(config.data.datasets[0].data[0]));
      console.log('Last point:', JSON.stringify(config.data.datasets[0].data[config.data.datasets[0].data.length - 1]));
    }
    console.log('Options keys:', Object.keys(config.options || {}));
    console.log('Plugins keys:', Object.keys(config.options?.plugins || {}));
  }
  update() {}
  destroy() { this.destroyed = true; }
}

global.Chart = MockChart;
global.document = {
  getElementById: (id) => {
    console.log('getElementById:', id);
    return { id, getContext: () => ({}) };
  }
};

async function test() {
  console.log('=== Testing Graph Rendering ===\n');
  
  // Test 1: Data loading
  console.log('--- Test 1: Data Loading ---');
  const loader = new DataLoader();
  try {
    const [cpiRows, aweRows] = await Promise.all([
      loader.load('cpi'),
      loader.load('awe')
    ]);
    console.log('CPI rows loaded:', cpiRows.length);
    console.log('AWE rows loaded:', aweRows.length);
    console.log('CPI sample:', JSON.stringify(cpiRows[0]));
    console.log('AWE sample:', JSON.stringify(aweRows[0]));
  } catch (e) {
    console.error('Data loading failed:', e.message);
    return;
  }
  
  // Test 2: ComparisonManager rendering
  console.log('\n--- Test 2: ComparisonManager Render ---');
  const catalog = await DataCatalog.fromJSON('./datasets.json');
  const comparison = new ComparisonManager(catalog, loader);
  comparison.addSeries('cpi', []);
  comparison.addSeries('awe', []);
  
  try {
    const chart = await comparison.render('test-chart', 'index');
    console.log('Chart returned:', !!chart);
  } catch (e) {
    console.error('Render failed:', e.message);
    console.error(e.stack);
  }
}

test().catch(console.error);
