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

import { ComparisonManager } from '../src/charts/comparisonManager.js';

function createMockCatalog() {
  return {
    get: vi.fn((id) => ({ id, name: id.toUpperCase() }))
  };
}

function createMockLoader() {
  return {
    load: vi.fn()
  };
}

describe('ComparisonManager', () => {
  let manager;
  let catalog;
  let loader;

  beforeEach(() => {
    catalog = createMockCatalog();
    loader = createMockLoader();
    manager = new ComparisonManager(catalog, loader);
  });

  describe('_commonTimeline', () => {
    it('returns sorted union of numeric periods', () => {
      const rows = [
        [{ period: 2020, value: 1 }, { period: 2022, value: 2 }],
        [{ period: 2021, value: 3 }]
      ];
      expect(manager._commonTimeline(rows)).toEqual([2020, 2021, 2022]);
    });

    it('ignores non-numeric periods', () => {
      const rows = [
        [{ period: 'text', value: 1 }, { period: 2020, value: 2 }]
      ];
      expect(manager._commonTimeline(rows)).toEqual([2020]);
    });

    it('returns empty array for empty input', () => {
      expect(manager._commonTimeline([[]])).toEqual([]);
    });
  });

  describe('_assignColor', () => {
    it('returns dark color for benchmark', () => {
      manager.setBenchmark('a');
      expect(manager._assignColor(0, 'a')).toBe('#1a1a1a');
    });

    it('consumes WARM and COOL palettes sequentially without skipping', () => {
      manager.setBenchmark(null);
      const colors = [0, 1, 2, 3, 4].map(i => manager._assignColor(i, `series${i}`));
      expect(colors[0]).toBe('#e76f51');
      expect(colors[1]).toBe('#2a9d8f');
      expect(colors[2]).toBe('#f4a261');
      expect(colors[3]).toBe('#264653');
      expect(colors[4]).toBe('#e9c46a');
    });
  });

  describe('render', () => {
    it('interpolates series to common timeline', async () => {
      loader.load.mockImplementation((id) => {
        if (id === 'a') return Promise.resolve([{ period: 2020, value: 100 }, { period: 2022, value: 200 }]);
        if (id === 'b') return Promise.resolve([{ period: 2021, value: 150 }]);
        return Promise.resolve([]);
      });

      manager.addSeries('a');
      manager.addSeries('b');
      const result = await manager.render('c1', 'index');
      expect(result).not.toBeNull();
    });

    it('returns null when no series are added', async () => {
      expect(await manager.render('c1')).toBeNull();
    });
  });
});
