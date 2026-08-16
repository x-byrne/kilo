import { readFileSync } from 'fs';

const STD = new Set(['DATAFLOW','TIME_PERIOD','OBS_VALUE','UNIT_MEASURE','OBS_STATUS','DECIMALS','OBS_COMMENT','BASE_PERIOD','UNIT_MULT']);

const datasets = ['cpi','cpigroups','cpihousing','awe','lci','lcigroups','wpi','population','gdp','households','building_activity','lending_housing','labour_account','household_spending','labour_force'];

for (const id of datasets) {
  const text = readFileSync(`data/${id}/${id}.csv`, 'utf8');
  const lines = text.split('\n');
  const hdr = lines[0].replace(/\r/g,'').split(',');
  const dimIdx = hdr.map((h,i)=>i).filter(i => !STD.has(hdr[i]));
  // group by dimension key -> {count, lastVal, vals}
  const groups = {};
  for (let li=1; li<lines.length; li++){
    const ln = lines[li].replace(/\r/g,'');
    if(!ln) continue;
    const f = ln.split(',');
    const key = dimIdx.map(i=>f[i]).join('|');
    const tp = f[hdr.indexOf('TIME_PERIOD')];
    const ov = f[hdr.indexOf('OBS_VALUE')];
    if(!groups[key]) groups[key]={count:0, obs:[]};
    groups[key].count++;
    groups[key].obs.push({tp, ov});
  }
  // sort by count desc
  const sorted = Object.entries(groups).sort((a,b)=>b[1].count-a[1].count);
  console.log(`\n=== ${id} | dim order: [${dimIdx.map(i=>hdr[i]).join(',')}] | top series ===`);
  for (const [k,v] of sorted.slice(0,4)){
    const dimVals = k.split('|');
    const last = v.obs[v.obs.length-1];
    const first = v.obs[0];
    console.log(`  count=${v.count} lastVal=${last.ov}(${last.tp}) firstVal=${first.ov}(${first.tp})`);
    console.log(`    dims: ${dimIdx.map((i,j)=>hdr[i]+'='+dimVals[j]).join(', ')}`);
  }
}
