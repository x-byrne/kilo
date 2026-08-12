export * from './abundance.js';
export * from './century.js';
export * from './housing.js';

export function loadPreset(name) {
  const map = { abundance: abundance, century: century, housing: housing };
  return map[name] || null;
}
