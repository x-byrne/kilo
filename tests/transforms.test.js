import { describe, it } from 'node:test';
import assert from 'node:assert';
import { rebase } from '../src/transforms/rebase.js';
import { deflate } from '../src/transforms/deflate.js';
import { perCapita } from '../src/transforms/perCapita.js';
import { perHousehold } from '../src/transforms/perHousehold.js';
import { growth } from '../src/transforms/growth.js';
import { ratio } from '../src/transforms/ratio.js';
import { compose, normalizeSeries } from '../src/transforms/index.js';

function series(rows) {
  return rows.map(r => ({ key: r[0], label: r[1], value: r[2], period: r[3] }));
}

describe('normalizeSeries', () => {
  it('converts raw loader rows to normalized format', () => {
    const raw = [
      { TIME_PERIOD: '2020-Q1', OBS_VALUE: 100, period: 2020.25 },
      { TIME_PERIOD: '2020-Q2', OBS_VALUE: 105, period: 2020.5 }
    ];
    const result = normalizeSeries(raw, 'OBS_VALUE', 'cpi', 'CPI');
    assert.deepStrictEqual(result, [
      { key: 'cpi', label: 'CPI', value: 100, period: 2020.25 },
      { key: 'cpi', label: 'CPI', value: 105, period: 2020.5 }
    ]);
  });

  it('filters out rows with null or NaN values', () => {
    const raw = [
      { TIME_PERIOD: '2020-Q1', OBS_VALUE: 100, period: 2020.25 },
      { TIME_PERIOD: '2020-Q2', OBS_VALUE: null, period: 2020.5 },
      { TIME_PERIOD: '2020-Q3', OBS_VALUE: NaN, period: 2020.75 }
    ];
    const result = normalizeSeries(raw, 'OBS_VALUE', 'cpi', 'CPI');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].period, 2020.25);
  });

  it('returns empty array for empty input', () => {
    assert.deepStrictEqual(normalizeSeries([]), []);
    assert.deepStrictEqual(normalizeSeries(null), []);
  });
});

describe('rebase', () => {
  it('rebases to first period (index 0)', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.5],
      ['a', 'A', 300, 2020.75]
    ]);
    const result = rebase(data, 0);
    assert.deepStrictEqual(result[0].value, 100);
    assert.deepStrictEqual(result[1].value, 200);
    assert.deepStrictEqual(result[2].value, 300);
  });

  it('rebases to specified index', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.5],
      ['a', 'A', 300, 2020.75]
    ]);
    const result = rebase(data, 1);
    assert.deepStrictEqual(result[0].value, 50);
    assert.deepStrictEqual(result[1].value, 100);
    assert.deepStrictEqual(result[2].value, 150);
  });

  it('handles zero base value', () => {
    const data = series([
      ['a', 'A', 0, 2020.25],
      ['a', 'A', 200, 2020.5]
    ]);
    const result = rebase(data, 0);
    assert.deepStrictEqual(result[0].value, 0);
    assert.deepStrictEqual(result[1].value, 200);
  });

  it('preserves all properties', () => {
    const data = series([['a', 'A', 100, 2020.25]]);
    const result = rebase(data, 0);
    assert.strictEqual(result[0].key, 'a');
    assert.strictEqual(result[0].label, 'A');
    assert.strictEqual(result[0].period, 2020.25);
  });
});

describe('growth', () => {
  it('computes YoY growth with lag=4', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 110, 2020.5],
      ['a', 'A', 120, 2020.75],
      ['a', 'A', 130, 2021.25],
      ['a', 'A', 143, 2021.5]
    ]);
    const result = growth(data, 4);
    assert.strictEqual(result[0].value, null);
    assert.strictEqual(result[1].value, null);
    assert.strictEqual(result[2].value, null);
    assert.strictEqual(result[3].value, null);
    assert.strictEqual(result[4].value, 43);
  });

  it('returns null for missing lagged value', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', null, 2020.5]
    ]);
    const result = growth(data, 1);
    assert.strictEqual(result[0].value, null);
    assert.strictEqual(result[1].value, null);
  });

  it('defaults to lag=1', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 110, 2020.5]
    ]);
    const result = growth(data);
    assert.strictEqual(result[0].value, null);
    assert.strictEqual(result[1].value, 10);
  });
});

describe('ratio', () => {
  it('computes ratio of numerator to denominator', () => {
    const num = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.5]
    ]);
    const denom = series([
      ['b', 'B', 50, 2020.25],
      ['b', 'B', 100, 2020.5]
    ]);
    const result = ratio(num, denom);
    assert.strictEqual(result[0].value, 2);
    assert.strictEqual(result[1].value, 2);
  });

  it('returns null for missing denominator', () => {
    const num = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.75]
    ]);
    const denom = series([
      ['b', 'B', 50, 2020.25]
    ]);
    const result = ratio(num, denom);
    assert.strictEqual(result[0].value, 2);
    assert.strictEqual(result[1].value, null);
  });

  it('returns empty array for empty numerator', () => {
    const result = ratio([], series([['b', 'B', 50, 2020.25]]));
    assert.deepStrictEqual(result, []);
  });
});

describe('deflate', () => {
  it('deflates values by matching periods', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 110, 2020.5]
    ]);
    const deflator = series([
      ['cpi', 'CPI', 100, 2020.25],
      ['cpi', 'CPI', 105, 2020.5]
    ]);
    const result = deflate(data, deflator);
    assert.strictEqual(result[0].value, 1);
    assert.strictEqual(result[1].value, 110 / 105);
  });

  it('interpolates quarterly deflator for semi-annual data', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 110, 2020.5],
      ['a', 'A', 120, 2020.75],
      ['a', 'A', 130, 2021.25]
    ]);
    const deflator = series([
      ['cpi', 'CPI', 100, 2020.25],
      ['cpi', 'CPI', 105, 2020.75],
      ['cpi', 'CPI', 110, 2021.25]
    ]);
    const result = deflate(data, deflator);
    assert.ok(result[0].value !== null);
    assert.ok(result[1].value !== null);
    assert.ok(result[2].value !== null);
    assert.ok(result[3].value !== null);
    assert.strictEqual(result[0].value, 100 / 100);
    assert.strictEqual(result[3].value, 130 / 110);
  });

  it('returns original data when deflator is missing', () => {
    const data = series([['a', 'A', 100, 2020.25]]);
    const result = deflate(data, []);
    assert.deepStrictEqual(result, data);
  });
});

describe('perCapita', () => {
  it('divides by population at same period', () => {
    const data = series([
      ['a', 'A', 100000, 2020.25],
      ['a', 'A', 110000, 2020.5]
    ]);
    const pop = series([
      ['pop', 'Population', 10000, 2020.25],
      ['pop', 'Population', 11000, 2020.5]
    ]);
    const result = perCapita(data, pop);
    assert.strictEqual(result[0].value, 10);
    assert.strictEqual(result[1].value, 10);
  });

  it('interpolates population for missing periods', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.75]
    ]);
    const pop = series([
      ['pop', 'Population', 10, 2020.25],
      ['pop', 'Population', 15, 2020.75]
    ]);
    const result = perCapita(data, pop);
    assert.strictEqual(result[0].value, 100 / 10);
    assert.strictEqual(result[1].value, 200 / 15);
  });
});

describe('perHousehold', () => {
  it('divides by household estimates at same period', () => {
    const data = series([
      ['a', 'A', 100000, 2020.25],
      ['a', 'A', 110000, 2020.5]
    ]);
    const hh = series([
      ['hh', 'Households', 5000, 2020.25],
      ['hh', 'Households', 5500, 2020.5]
    ]);
    const result = perHousehold(data, hh);
    assert.strictEqual(result[0].value, 20);
    assert.strictEqual(result[1].value, 20);
  });
});

describe('compose', () => {
  it('pipes transforms left-to-right', () => {
    const data = series([
      ['a', 'A', 100, 2020.25],
      ['a', 'A', 200, 2020.5]
    ]);
    const pipeline = [
      (d) => d.map(r => ({ ...r, value: r.value * 2 })),
      (d) => d.map(r => ({ ...r, value: r.value + 1 }))
    ];
    const result = compose(pipeline, data);
    assert.strictEqual(result[0].value, 201);
    assert.strictEqual(result[1].value, 401);
  });

  it('returns data unchanged for non-array transforms', () => {
    const data = series([['a', 'A', 100, 2020.25]]);
    assert.deepStrictEqual(compose('not-an-array', data), data);
  });
});
