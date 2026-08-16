import { parseCSV } from './src/loader/parser.js';

const sample = 'DATAFLOW,MEASURE,INDEX,TSEST,REGION,FREQ,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE\r\nABS:CPI(2.0.0),1,10001,10,50,Q,2024-Q2,101.97,\r\n';
const rows = parseCSV(sample);
console.log('num rows:', rows.length);
console.log('row0 (header):', JSON.stringify(rows[0]));
console.log('row1 (data):', JSON.stringify(rows[1]));
console.log('row1.TIME_PERIOD:', rows[1].TIME_PERIOD);
console.log('row1.OBS_VALUE:', rows[1].OBS_VALUE);
console.log('row1.FREQ:', rows[1].FREQ);
console.log('row1.REGION:', rows[1].REGION);
