import { abundance } from './abundance.js';
import { century } from './century.js';
import { housing } from './housing.js';

export { abundance, century, housing };

export function loadPreset(name) {
  const map = { abundance, century, housing };
  return map[name] || null;
}
