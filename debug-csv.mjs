import { readFileSync } from 'fs';
const text = readFileSync('data/cpi/cpi.csv', 'utf8');
const lines = text.split('\n');
console.log('header fields:', JSON.stringify(lines[0].split(',')));
console.log('first data fields:', JSON.stringify(lines[1].split(',')));
console.log('header comma count:', (lines[0].match(/,/g) || []).length);
console.log('data comma count:', (lines[1].match(/,/g) || []).length);
console.log('full header line:', JSON.stringify(lines[0]));
console.log('full first data line:', JSON.stringify(lines[1]));
