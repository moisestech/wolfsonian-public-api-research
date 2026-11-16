import { readFileSync, writeFileSync } from 'node:fs';
import { fieldIdentifierCsv, imageRequestCsv, imageRequestRows } from '../src/image-requests.mjs';

const packet = JSON.parse(readFileSync(new URL('../data/lakehouse/project-matches.json', import.meta.url), 'utf8'));
const csv = imageRequestCsv(packet);
const destination = new URL('../data/lakehouse/image-requests.csv', import.meta.url);
writeFileSync(destination, csv);
writeFileSync(new URL('../data/lakehouse/field-identifier.csv', import.meta.url), fieldIdentifierCsv(packet));
const counts = {};
for (const row of imageRequestRows(packet)) counts[row.priority] = (counts[row.priority] || 0) + 1;
console.log('Wrote data/lakehouse/image-requests.csv');
console.log(Object.entries(counts).map(([key, count]) => key + ' ' + count).join(' · '));
