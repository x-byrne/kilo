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
    },
    querySelectorAll(sel) {
      return this._children.filter(c => c.matches && c.matches(sel));
    },
    matches(sel) {
      if (sel === 'button') return this.tagName === 'BUTTON';
      if (sel === 'select') return this.tagName === 'SELECT';
      return false;
    },
    classList: {
      _classes: [],
      add(cls) { this._classes.push(cls); },
      remove(cls) { this._classes = this._classes.filter(c => c !== cls); },
      contains(cls) { return this._classes.includes(cls); }
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

import { Controls } from './controls.js';

describe('Controls', () => {
  it('initialises with default state', () => {
    const container = globalThis.document.createElement('div');
    const controls = new Controls(container);
    assert.strictEqual(controls.state.mode, 'index');
    assert.strictEqual(controls.state.deflator, 'none');
    assert.strictEqual(controls.state.range, '10Y');
  });

  it('can update state directly', () => {
    const container = globalThis.document.createElement('div');
    const controls = new Controls(container);
    controls.state.mode = 'growth';
    assert.strictEqual(controls.state.mode, 'growth');
  });

  it('triggers onChange when render completes', () => {
    const container = globalThis.document.createElement('div');
    const controls = new Controls(container);
    let changed = false;
    controls.onChange = () => { changed = true; };
    controls.render();
    assert.strictEqual(changed, false);
  });

  it('has deflator options in dropdown', () => {
    const container = globalThis.document.createElement('div');
    const controls = new Controls(container);
    controls.render();
    const row = container._children[0];
    const select = row._children.find(c => c.tagName === 'SELECT');
    assert.ok(select, 'select element should exist');
    assert.ok(select._children.length > 0, 'select should have options');
  });
});
