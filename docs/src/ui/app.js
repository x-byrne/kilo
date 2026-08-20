import { DataCatalog } from '../loader/catalog.js';
import { DataLoader } from '../loader/loader.js';
import { ComparisonManager } from '../charts/comparisonManager.js';
import { DatasetPicker } from './datasetPicker.js';
import { ComparisonBuilder } from './comparisonBuilder.js';
import { Controls } from './controls.js';
import { RangeSlider } from './rangeSlider.js';
import { URLState } from './urlState.js';
import { loadPreset } from '../presets/index.js';

export class App {
  constructor() {
    this.catalog = null;
    this.loader = null;
    this.comparison = null;
    this.urlState = new URLState();
    this.picker = null;
    this.builder = null;
    this.controls = null;
    this.rangeSlider = null;
    this.preset = null;
  }
  async mount(el) {
    this.el = el;
    await this._initData();
    this._initUI();
    await this._loadState();
  }
  async _initData() {
    this.catalog = await DataCatalog.fromJSON('./datasets.json');
    this.loader = new DataLoader();
    this.comparison = new ComparisonManager(this.catalog, this.loader);
  }
  _initUI() {
    this.el.innerHTML = `
      <header class="app-header">
        <h1><span>ABS</span>Vis</h1>
        <nav class="preset-nav">
          <button data-preset="abundance">Abundance</button>
          <button data-preset="century">Chart of the Century</button>
          <button data-preset="housing">Housing</button>
          <button data-preset="custom">Custom</button>
        </nav>
      </header>
      <main class="app-main">
        <div id="preset-view" class="hidden"></div>
        <div id="custom-view">
          <div class="grid grid-2">
            <div class="card">
              <h2>Datasets</h2>
              <div id="dataset-picker"></div>
            </div>
            <div class="card">
              <h2>Comparison</h2>
              <div id="comparison-builder"></div>
            </div>
          </div>
          <div class="card">
            <h2>Controls</h2>
            <div id="controls"></div>
          </div>
          <div class="card">
            <h2>Period</h2>
            <div id="range-slider"></div>
          </div>
          <div class="card">
            <h2>Chart</h2>
            <div class="chart-container"><canvas id="main-chart"></canvas></div>
          </div>
        </div>
      </main>
    `;
    this.picker = new DatasetPicker(this.catalog, document.getElementById('dataset-picker'));
    this.picker.render();
    this.builder = new ComparisonBuilder(document.getElementById('comparison-builder'));
    this.controls = new Controls(document.getElementById('controls'));
    this.controls.render();
    this.rangeSlider = new RangeSlider(document.getElementById('range-slider'));
    this._wireEvents();
  }
  _wireEvents() {
    this.picker.onChange = (ids) => {
      this.builder.clear();
      for (const id of ids) {
        const meta = this.catalog.get(id);
        if (meta) this.builder.add(id, meta);
      }
      this.builder.render();
      this._renderChart();
    };
    this.controls.onChange = () => this._renderChart();
    this.rangeSlider.onChange = () => this._renderChart();
    this.el.querySelectorAll('.preset-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        if (preset === 'custom') {
          document.getElementById('preset-view').classList.add('hidden');
          document.getElementById('custom-view').classList.remove('hidden');
          this.preset = null;
          this.urlState.write({});
        } else {
          this._activatePreset(preset);
        }
      });
    });
  }
  async _activatePreset(name) {
    const preset = loadPreset(name);
    if (!preset) return;
    this.preset = preset;
    document.getElementById('custom-view').classList.add('hidden');
    const view = document.getElementById('preset-view');
    view.classList.remove('hidden');
    view.innerHTML = `
      <div class="card">
        <h2>${preset.title}</h2>
        <div class="grid grid-4" id="stat-cards"></div>
      </div>
      <div class="card"><div class="chart-container"><canvas id="preset-chart"></canvas></div></div>
    `;
    const cards = document.getElementById('stat-cards');
    if (preset.stats) {
      for (const s of preset.stats) {
        const div = document.createElement('div');
        div.className = 'stat-card';
        if (s.id) div.id = s.id;
        const valId = s.valueId || (s.id ? `val-${s.id}` : null);
        const label = s.label || '';
        const value = s.value || '—';
        if (valId) {
          div.innerHTML = `<div class="value" id="${valId}">${value}</div><div class="label">${label}</div>`;
        } else {
          div.innerHTML = `<div class="value">${value}</div><div class="label">${label}</div>`;
        }
        cards.appendChild(div);
      }
    }
    if (preset.renderChart) {
      await preset.renderChart('preset-chart', this.comparison);
    }
    this.urlState.write({ preset: name });
  }
  async _renderChart() {
    if (!this.picker.selected.size) return;
    this.comparison.clear();
    const pipeline = this.controls.state.deflator !== 'none' ? ['deflate'] : [];
    for (const id of this.picker.selected) {
      this.comparison.addSeries(id, pipeline);
    }
    await this.comparison.render('main-chart', this.controls.state.mode, this.rangeSlider.from, this.rangeSlider.to);
    this.urlState.write({ series: Array.from(this.picker.selected), mode: this.controls.state.mode, deflator: this.controls.state.deflator, from: this.rangeSlider.from, to: this.rangeSlider.to });
  }
  async _loadState() {
    const state = this.urlState.read();
    if (state.preset) {
      await this._activatePreset(state.preset);
    }
  }
}
