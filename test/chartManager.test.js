import { describe, it, expect, vi, beforeEach } from 'vitest';

const { JSDOM } = await import('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="c1"></canvas></body></html>');
global.document = dom.window.document;
global.window = dom.window;

function MockChart() {
  return {
    destroy: vi.fn(),
    update: vi.fn(),
    data: {},
    options: {}
  };
}

beforeEach(() => {
  global.Chart = vi.fn(MockChart);
});

import { ChartManager } from '../src/charts/chartManager.js';

describe('ChartManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ChartManager();
  });

  it('deep merges options without destroying nested defaults', () => {
    manager.create('c1', {
      options: {
        scales: {
          x: { ticks: { color: 'red' } }
        }
      }
    });
    const call = global.Chart.mock.calls[0][1];
    expect(call.options.scales.x.ticks.color).toBe('red');
    expect(call.options.scales.x.grid.color).toBe('rgba(0,0,0,0.04)');
    expect(call.options.scales.y.grid.color).toBe('rgba(0,0,0,0.04)');
  });

  it('deep merges plugins without destroying nested defaults', () => {
    manager.create('c1', {
      options: {
        plugins: {
          legend: {
            labels: { font: { family: 'Arial' } }
          }
        }
      }
    });
    const call = global.Chart.mock.calls[0][1];
    expect(call.options.plugins.legend.labels.font.family).toBe('Arial');
    expect(call.options.plugins.legend.labels.usePointStyle).toBe(true);
    expect(call.options.plugins.legend.labels.pointStyle).toBe('circle');
  });

  it('preserves legend defaults when only display is overridden', () => {
    manager.create('c1', {
      options: {
        plugins: { legend: { display: true } }
      }
    });
    const call = global.Chart.mock.calls[0][1];
    expect(call.options.plugins.legend.display).toBe(true);
    expect(call.options.plugins.legend.labels.usePointStyle).toBe(true);
    expect(call.options.plugins.legend.labels.pointStyle).toBe('circle');
  });

  it('merges top-level config with defaults', () => {
    manager.create('c1', { responsive: false });
    const call = global.Chart.mock.calls[0][1];
    expect(call.responsive).toBe(false);
    expect(call.options.maintainAspectRatio).toBe(false);
  });

  it('destroys previous instance before creating new one', () => {
    const chart1 = manager.create('c1');
    manager.create('c1');
    expect(chart1.destroy).toHaveBeenCalled();
  });

  it('returns null when canvas is missing', () => {
    expect(manager.create('missing')).toBeNull();
  });

  it('updates existing chart data and options', () => {
    const chart = manager.create('c1');
    manager.update('c1', { data: { datasets: [] }, options: { responsive: false } });
    expect(chart.update).toHaveBeenCalled();
  });

  it('creates chart when updating non-existent canvas', () => {
    manager.update('c1');
    expect(global.Chart).toHaveBeenCalled();
  });

  it('destroys chart by canvas id', () => {
    const chart = manager.create('c1');
    manager.destroy('c1');
    expect(chart.destroy).toHaveBeenCalled();
  });
});
