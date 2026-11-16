import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMatchCollector, LOOKUP_URL, MAX_ROWS, wantedAccessions } from '../src/lakehouse-matches.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'data/lakehouse/project-matches.json');
const wanted = wantedAccessions();
const collector = createMatchCollector(wanted);
const pageSize = 50;
const ranges = [
  { offset: 57200, rows: 2000 },
  { offset: 64800, rows: 2000 }
];
let pages = 0;
let rowsBudget = 0;

for (const range of ranges) {
  let offset = range.offset;
  const end = range.offset + range.rows;
  let previousFirst = '';
  while (offset < end && rowsBudget < MAX_ROWS) {
  const url = new URL(LOOKUP_URL);
  url.searchParams.set('limit', String(pageSize));
  url.searchParams.set('offset', String(offset));
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    redirect: 'error',
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) {
    console.error('Lakehouse returned HTTP ' + response.status + ' at offset ' + offset + '. Saved rows stop there.');
    break;
  }
  if (!/application\/(?:[\w.+-]*\+)?json/i.test(response.headers.get('content-type') || '')) {
    console.error('Lakehouse did not return JSON. The body was not saved.');
    process.exitCode = 1;
    break;
  }
  const page = await response.json();
  const rows = Array.isArray(page.data) ? page.data : [];
  const first = rows[0]?.['Accession Number'] || '';
  if (!rows.length || first === previousFirst) break;
  previousFirst = first;
  pages += 1;
  rowsBudget += rows.length;
  const stopped = collector.push(JSON.stringify({ data: rows }));
  offset += rows.length;
  if (stopped) break;
  }
}

const packet = collector.result();
packet.pages = pages;
packet.ranges = ranges;
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(packet, null, 2));
console.log('Saved ' + output);
console.log(packet.matches.length + ' project accessions from ' + packet.rowsSeen + ' rows across ' + pages + ' pages (' + packet.stopped + ', ' + packet.bytesSeen + ' bytes).');
