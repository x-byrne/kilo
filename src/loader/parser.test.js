import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseCSV, periodToNum, periodLabel, interpolateSeries } from './parser.js';

describe('parseCSV', () => {
  it('parses a simple CSV', () => {
    const result = parseCSV('a,b\n1,2\n3,4');
    assert.deepStrictEqual(result, [
      { a: 1, b: 2 },
      { a: 3, b: 4 }
    ]);
  });

  it('handles empty values as null', () => {
    const result = parseCSV('a,b\n1,\n,4');
    assert.deepStrictEqual(result, [
      { a: 1, b: null },
      { a: null, b: 4 }
    ]);
  });

  it('handles quoted fields', () => {
    const result = parseCSV('a,b\n"hello, world",42');
    assert.deepStrictEqual(result, [
      { a: 'hello, world', b: 42 }
    ]);
  });

  it('returns empty array for empty input', () => {
    assert.deepStrictEqual(parseCSV(''), []);
  });
});

describe('periodToNum', () => {
  it('converts plain year', () => {
    assert.strictEqual(periodToNum('2020'), 2020);
  });

  it('converts quarter', () => {
    assert.strictEqual(periodToNum('2020-Q1'), 2020);
    assert.strictEqual(periodToNum('2020-Q2'), 2020.25);
    assert.strictEqual(periodToNum('2020-Q3'), 2020.5);
    assert.strictEqual(periodToNum('2020-Q4'), 2020.75);
  });

  it('converts month', () => {
    assert.strictEqual(periodToNum('2020-Jan'), 2020);
    assert.strictEqual(periodToNum('2020-Jun'), 2020.4167);
    assert.strictEqual(periodToNum('2020-Dec'), 2020.9167);
  });

  it('parses numeric string', () => {
    assert.strictEqual(periodToNum('2020.5'), 2020.5);
  });

  it('returns null for null input', () => {
    assert.strictEqual(periodToNum(null), null);
  });
});

describe('periodLabel', () => {
  it('formats plain year', () => {
    assert.strictEqual(periodLabel(2020), '2020');
  });

  it('formats quarter', () => {
    assert.strictEqual(periodLabel(2020), '2020');
    assert.strictEqual(periodLabel(2020.25), '2020-Q1');
    assert.strictEqual(periodLabel(2020.5), '2020-Q2');
    assert.strictEqual(periodLabel(2020.75), '2020-Q3');
    assert.strictEqual(periodLabel(2021), '2021');
  });
});

describe('interpolateSeries', () => {
  it('interpolates missing points', () => {
    const rows = [
      { period: '2020', value: 100 },
      { period: '2022', value: 200 }
    ];
    const result = interpolateSeries(rows, [2020, 2021, 2022]);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[0].value, 100);
    assert.strictEqual(result[2].value, 200);
    assert.strictEqual(result[1].value, 150);
  });

  it('returns empty for empty input', () => {
    assert.deepStrictEqual(interpolateSeries([], [2020]), []);
  });
});
