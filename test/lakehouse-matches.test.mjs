import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MATRIX_OBJECTS } from '../src/matrix-objects.mjs';
import { conversationRecords, applyLakehouseFields, createMatchCollector, accessionKey, lookupSnapshots } from '../src/lakehouse-matches.mjs';

test('shared matrix tags enter the conversation graph and isolates stay out', () => {
  const domestic = MATRIX_OBJECTS.filter(object => object.themes.includes('Domestic life'));
  const [a, b] = domestic;
  const packet = { retrievedAt: 'TEST_TIME', matches: [
    { 'Accession Number': a.accession, Title: 'From lookup', Creator: 'Lookup maker', Date: '1901', Subject: 'Not a theme', Image: 'http://example.test/a.jpg' },
    { 'Accession Number': 'OTHER; ' + b.accession, Title: b.title, Date: '1902', Subject: 'Also not' },
    { 'Accession Number': 'NOT-IN-MATRIX', Title: 'Skip', Subject: 'Domestic life' }
  ]};
  const graph = conversationRecords(packet);
  assert.equal(graph.strong, 2);
  assert.equal(graph.records[0].source, 'lakehouse');
  assert.equal(graph.records[0].catalogSubject, 'Not a theme');
  assert.ok(graph.records.every(record => record.tags.every(tag => tag.value !== 'Not a theme' && tag.value !== 'Also not')));
  assert.ok(graph.records.every(record => record.tags.some(tag => tag.sourceColumns[0].startsWith('Thematic Category'))));
  const room = applyLakehouseFields(MATRIX_OBJECTS, packet);
  const hit = room.find(object => object.accession === a.accession);
  const other = room.find(object => object.accession === b.accession);
  const miss = room.find(object => object.accession !== a.accession && object.accession !== b.accession);
  assert.equal(hit.confirmed, true);
  assert.equal(hit.date, '1901');
  assert.equal(hit.creator, 'Lookup maker');
  assert.equal(hit.title, a.title);
  assert.equal(other.confirmed, true);
  assert.equal(other.title, b.title);
  assert.notEqual(miss.confirmed, true);
  const snapshots = lookupSnapshots(packet, graph.records);
  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[0][1].status, 'EXACT_PRIMARY_ACCESSION');
});

test('the collector keeps only wanted accessions and drops media fields', () => {
  const wanted = new Set([accessionKey('2009.5.1')]);
  const collector = createMatchCollector(wanted);
  collector.push(JSON.stringify({ data: [
    { 'Accession Number': '2009.5.1', Title: 'Keep', Thumbnail: 'photo.tif', Note: 'https://example.test/file.jpg' },
    { 'Accession Number': 'NOPE', Title: 'Drop' }
  ]}));
  const packet = collector.result();
  assert.equal(packet.matches.length, 1);
  assert.equal(packet.matches[0].Title, 'Keep');
  assert.equal(packet.matches[0].Thumbnail, undefined);
  assert.equal(packet.matches[0].Note, undefined);
  assert.equal(packet.sourceUrl, 'https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup');
});

test('the saved capture can form a conversation neighborhood', async () => {
  const packet = JSON.parse(await readFile(new URL('../data/lakehouse/project-matches.json', import.meta.url), 'utf8'));
  const graph = conversationRecords(packet);
  assert.ok(graph.strong >= 2);
  assert.equal(JSON.stringify(packet.matches).includes('http'), false);
  assert.equal(JSON.stringify(packet.matches).includes('.tif'), false);
});
