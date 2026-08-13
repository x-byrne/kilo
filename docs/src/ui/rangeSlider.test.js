import { describe, it } from 'node:test';
import assert from 'node:assert';

const mockElement = () => {
  const el = {
    innerHTML: '',
    _children: [],
    _eventListeners: {},
    _selected: false,
    tagName: 'DIV',
    className: '',
    style: {},
    value: '',
    appendChild(child) {
      this._children.push(child);
      return child;
    },
    append(...children) {
      for (const child of children) {
        this._children.push(child);
      }
    },
    addEventListener(event, fn) {
      if (!this._eventListeners[event]) this._eventListeners[event] = [];
      this._eventListeners[event].push(fn);
    }
  };
  return el;
};

globalThis.document = {
  createElement(tag) {
    const el = mockElement();
    el.tagName = tag.toUpperCase();
    return el;
  }
};

import { RangeSlider } from './rangeSlider.js';

describe('RangeSlider', () => {
  it('initialises with default range', () => {
    const container = globalThis.document.createElement('div');
    const slider = new RangeSlider(container);
    assert.strictEqual(slider.from, 2014);
    assert.strictEqual(slider.to, 2024);
  });

  it('calls onChange when slider moves', () => {
    const container = globalThis.document.createElement('div');
    const slider = new RangeSlider(container);
    let changed = false;
    slider.onChange = () => { changed = true; };
    const trackEl = container._children[0];
    const fromInput = trackEl._children[2];
    fromInput.value = 2015;
    fromInput._eventListeners.input[0]();
    assert.strictEqual(slider.from, 2015);
    assert.strictEqual(changed, true);
  });

  it('constrains from to not exceed to', () => {
    const container = globalThis.document.createElement('div');
    const slider = new RangeSlider(container);
    slider.from = 2020;
    slider.to = 2019;
    const trackEl = container._children[0];
    const fromInput = trackEl._children[2];
    fromInput.value = 2021;
    fromInput._eventListeners.input[0]();
    assert.strictEqual(slider.from, slider.to);
  });
});
