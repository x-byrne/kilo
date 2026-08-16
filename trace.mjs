import { parseCSV, periodToNum } from './src/loader/parser.js';
import { readFileSync } from 'fs';

function trace(id) {
  const text = readFileSync(`data/${id}/${id}.csv`, 'utf8');
  const rows = parseCSV(text);
  console.log(`\n=== ${id} ===`);
  console.log('total rows:', rows.length);
  const r0 = rows[0] || {};
  console.log('sample row keys:', Object.keys(r0));
  console.log('TIME_PERIOD in row0:', JSON.stringify(r0.TIME_PERIOD));
  console.log('OBS_VALUE in row0:', JSON.stringify(r0.OBS_VALUE));
  console.log('value in row0:', JSON.stringify(r0.value));
  const freqs = new Set(rows.map(r => r.FREQ));
  console.log('FREQ values:', [...freqs]);
  console.log('periodToNum(TIME_PERIOD) row0:', periodToNum(r0.TIME_PERIOD));
}
trace('cpi');
trace('awe');
trace('cpigroups');
trace('cpihousing');
