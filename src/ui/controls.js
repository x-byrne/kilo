export class Controls {
  constructor(container) {
    this.container = container;
    this.state = { mode: 'index', deflator: 'none', range: '10Y' };
    this.onChange = () => {};
  }
  render() {
    this.container.innerHTML = '';
    const modes = ['Indexed', 'Relative to Income', 'YoY Growth', 'Raw'];
    const deflators = ['None', 'CPI', 'WPI', 'LCI', 'GDP'];
    const ranges = ['1Y', '5Y', '10Y', 'All'];
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.gap = '1rem';
    row.style.alignItems = 'center';
    const modeGroup = this._segmentedControl('mode', modes, this.state.mode);
    const deflatorGroup = this._dropdown('deflator', deflators, this.state.deflator);
    const rangeGroup = this._segmentedControl('range', ranges, this.state.range);
    row.appendChild(modeGroup);
    row.appendChild(deflatorGroup);
    row.appendChild(rangeGroup);
    this.container.appendChild(row);
  }
  _segmentedControl(name, options, active) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '0.25rem';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.textContent = opt;
      if (opt.toLowerCase() === active || opt === active) btn.classList.add('primary');
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach(b => b.classList.remove('primary'));
        btn.classList.add('primary');
        this.state[name] = opt.toLowerCase();
        this.onChange(this.state);
      });
      wrap.appendChild(btn);
    }
    return wrap;
  }
  _dropdown(name, options, active) {
    const sel = document.createElement('select');
    for (const opt of options) {
      const o = document.createElement('option');
      o.value = opt.toLowerCase();
      o.textContent = opt;
      if (o.value === active) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => { this.state[name] = sel.value; this.onChange(this.state); });
    return sel;
  }
}
