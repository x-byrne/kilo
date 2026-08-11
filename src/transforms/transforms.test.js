import { describe, it } from 'node:test';
import assert from 'node:assert';
import { rebase } from './rebase.js';
import { growth } from './growth.js';
import { ratio } from './ratio.js';
import { deflate } from './deflate.js';
import { perCapita } from './perCapita.js';
import { perHousehold } from './perHousehold.js';

describe('rebase', () => {
  it('rebases data to base index 100', () => {
    const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
    const result = rebase(data, 0);
    assert.strictEqual(result[0].value, 100);
    assert.strictEqual(result[1].value, 200);
    assert.strictEqual(result[2].value, 300);
  });

  it('returns copy when base is zero', () => {
    const data = [{ value: 0 }, { value: 10 }];
    const result = rebase(data, 0);
    assert.strictEqual(result[0].value, 0);
    assert.strictEqual(result[1].value, 10);
  });

  it('returns empty for empty input', () => {
    assert.deepStrictEqual(rebase([], 0), []);
  });
});

describe('growth', () => {
  it('calculates YoY growth', () => {
    const data = [{ value: 100 }, { value: 110 }, { value: 121 }];
    const result = growth(data, 1);
    assert.strictEqual(result[0].value, null);
    assert.strictEqual(result[1].value, 10);
    assert.strictEqual(result[2].value, 10);
  });

  it('returns empty for empty input', () => {
    assert.deepStrictEqual(growth([]), []);
  });
});

describe('ratio', () => {
  it('divides numerator by denominator by period', () => {
    const num = [{ period: 2020, value: 100 }, { period: 2021, value: 200 }];
    const denom = [{ period: 2020, value: 50 }, { period: 2021, value: 100 }];
    const result = ratio(num, denom);
    assert.strictEqual(result[0].value, 2);
    assert.strictEqual(result[1].value, 2);
  });

  it('returns null when denominator is zero', () => {
    const num = [{ period: 2020, value: 100 }];
    const denom = [{ period: 2020, value: 0 }];
    const result = ratio(num, denom);
    assert.strictEqual(result[0].value, null);
  });

  it('returns empty for empty input', () => {
    assert.deepStrictEqual(ratio([], []), []);
  });
});

describe('deflate', () => {
  it('divides values by deflator series', () => {
    const data = [{ period: '2020', value: 200 }, { period: '2021', value: 220 }];
    const deflator = [{ period: '2020', value: 100 }, { period: '2021', value: 110 }];
    const result = deflate(data, deflator, [2020, 2021]);
    assert.strictEqual(result[0].value, 2);
    assert.strictEqual(result[1].value, 2);
  });

  it('returns original data when deflator is missing', () => {
    const data = [{ period: '2020', value: 100 }];
    const result = deflate(data, [], [2020]);
    assert.deepStrictEqual(result, data);
  });
});

describe('perCapita', () => {
  it('divides values by population', () => {
    const data = [{ period: '2020', value: 1000 }, { period: '2021', value: 1100 }];
    const pop = [{ period: '2020', value: 10 }, { period: '2021', value: 11 }];
    const result = perCapita(data, pop, [2020, 2021]);
    assert.strictEqual(result[0].value, 100);
    assert.strictEqual(result[1].value, 100);
  });
});

describe('perHousehold', () => {
  it('divides values by households', () => {
    const data = [{ period: '2020', value: 500 }, { period: '2021', value: 550 }];
    const hh = [{ period: '2020', value: 5 }, { period: '2021', value: 5.5 }];
    const result = perHousehold(data, hh, [2020, 2021]);
    assert.strictEqual(result[0].value, 100);
    assert.strictEqual(result[1].value, 100);
  });
});
