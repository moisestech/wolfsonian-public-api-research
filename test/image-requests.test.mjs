import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fieldIdentifierCsv, imageRequestCsv, imageRequestRows } from '../src/image-requests.mjs';

const packet = JSON.parse(readFileSync(new URL('../data/lakehouse/project-matches.json', import.meta.url), 'utf8'));

test('image requests cover the room, the conversation, and the public anchors', () => {
  const rows = imageRequestRows(packet);
  assert.equal(rows.length, 306);
  assert.equal(rows.filter(row => row.priority === 'conversation').length, 76);
  assert.equal(rows.filter(row => row.priority === 'spatial').length, 224);
  assert.equal(rows.filter(row => row.priority === 'object-lens').length, 6);
  assert.deepEqual(rows.slice(0, 76).map(row => row.priority), Array(76).fill('conversation'));
  const vase = rows.find(row => row.accession === '85.7.383a,b');
  assert.equal(vase.filename, '85.7.383a,b.png');
  assert.equal(vase.priority, 'object-lens');
  assert.equal(rows.some(row => row.accession === '85.7.383a' || row.accession === 'b'), false);
  const spaced = rows.find(row => row.accession === 'XX1990. 3722');
  assert.equal(spaced.filename, 'XX1990. 3722.png');
  assert.ok(rows.every(row => row.filename === row.accession + '.png'));
  assert.equal(rows.filter(row => row.lakehouse_text === 'matched').length, 76);
  assert.ok(rows.every(row => row.field_identifier === (row.lakehouse_accession || row.accession)));
  const csv = imageRequestCsv(packet);
  assert.match(csv.split('\n')[0], /^field_identifier,priority,accession,filename,/);
  assert.match(csv, /"85\.7\.383a,b","85\.7\.383a,b\.png"/);
  assert.equal(csv.includes('http'), false);
  const filter = fieldIdentifierCsv(packet);
  assert.equal(filter.split('\n')[0], 'field_identifier');
  assert.equal(filter.trim().split('\n').length, 307);
  assert.match(filter, /"85\.7\.383a,b"/);
});
