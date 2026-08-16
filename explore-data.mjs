import { readFileSync } from 'fs';
import { parseCSV } from './src/loader/parser.js'; // broken, but for header use raw

const datasets = ['cpi','cpigroups','cpihousing','awe','lci','lcigroups','wpi','population','gdp','households','building_activity','lending_housing','labour_account','household_spending','labour_force'];

for (const id of datasets) {
  const text = readFileSync(`data/${id}/${id}.csv`, 'utf8');
  const lines = text.split('\n');
  // raw header (strip \r)
  const hdr = lines[0].replace(/\r/g,'').split(',');
  console.log(`\n=== ${id} (rows excl header: ${lines.length-1}) ===`);
  console.log('header[' + hdr.length + ']:', hdr.join(' | '));
  // Show a few distinct series keyed by non-TIME_PERIOD/OBS columns
  const dimIdx = hdr.map((h,i)=>({h,i})).filter(x => !['TIME_PERIOD','OBS_VALUE','UNIT_MEASURE','OBS_STATUS','DECIMALS','OBS_COMMENT','BASE_PERIOD','DATAFLOW'].includes(x.h));
  const seriesCount = new Map();
  for (let li = 1; li < lines.length; li++) {
    const ln = lines[li].replace(/\r/g,'');
    if (!ln) continue;
    const f = ln.split(',');
    const key = dimIdx.map(d => `${d.h}=${f[d.i]}`).join(',');
    seriesCount.set(key, (seriesCount.get(key)||0)+1);
  }
  const sorted = [...seriesCount.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6);
  for (const [k,c] of sorted) console.log(`  ${c}  ${k}`);
}
