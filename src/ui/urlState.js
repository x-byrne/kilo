export class URLState {
  constructor() {
    this.state = {};
  }
  read() {
    const hash = window.location.hash.slice(1);
    if (!hash) return {};
    const params = new URLSearchParams(hash);
    const state = {};
    for (const [k, v] of params) {
      if (k === 'series' || k === 's') state.series = v.split(',');
      else if (k === 'mode' || k === 'm') state.mode = v;
      else if (k === 'deflator' || k === 'd') state.deflator = v;
      else if (k === 'from' || k === 'f') state.from = v;
      else if (k === 'to' || k === 't') state.to = v;
      else if (k === 'preset' || k === 'p') state.preset = v;
    }
    this.state = state;
    return state;
  }
  write(state) {
    const params = new URLSearchParams();
    if (state.series && state.series.length) params.set('series', state.series.join(','));
    if (state.mode) params.set('mode', state.mode);
    if (state.deflator && state.deflator !== 'none') params.set('deflator', state.deflator);
    if (state.from) params.set('from', state.from);
    if (state.to) params.set('to', state.to);
    if (state.preset) params.set('preset', state.preset);
    window.location.hash = params.toString();
  }
}
