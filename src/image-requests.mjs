/** Accession list for a local image folder. No photographs are fetched or stored. */

import { MATRIX_OBJECTS } from './matrix-objects.mjs';
import { PUBLIC_ANCHORS } from './atlas-graph.mjs';
import { accessionHits, accessionKey, conversationRecords } from './lakehouse-matches.mjs';

const COLUMNS = ['field_identifier', 'priority', 'accession', 'filename', 'title', 'creator', 'date', 'object_type', 'lakehouse_accession', 'lakehouse_node_id', 'lakehouse_text'];
const ORDER = { conversation: 0, spatial: 1, 'object-lens': 2 };

function cell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}

function fieldIdentifier(object, lake) {
  const catalog = lake?.['Accession Number'];
  if (catalog && accessionKey(catalog) === accessionKey(object.accession)) return String(catalog).replace(/\s+/g, ' ').trim();
  return object.accession;
}

function rowFor(object, priority, lake) {
  return {
    field_identifier: fieldIdentifier(object, lake),
    priority,
    accession: object.accession,
    filename: object.accession + '.png',
    title: object.title || '',
    creator: object.creator || '',
    date: object.date || '',
    object_type: object.objectType || '',
    lakehouse_accession: lake?.['Accession Number'] || '',
    lakehouse_node_id: lake?.['ID (Node ID)'] ?? '',
    lakehouse_text: lake ? 'matched' : 'not in saved capture',
  };
}

export function imageRequestRows(packet) {
  const graph = conversationRecords(packet || { matches: [] });
  const conversation = new Set(graph.records.map(record => accessionKey(record.accession)));
  const wanted = new Set([
    ...MATRIX_OBJECTS.map(object => accessionKey(object.accession)),
    ...PUBLIC_ANCHORS.map(object => accessionKey(object.accession)),
  ]);
  const lakehouse = new Map();
  for (const row of packet?.matches || []) {
    for (const hit of accessionHits(row['Accession Number'], wanted)) {
      const key = accessionKey(hit);
      if (!lakehouse.has(key)) lakehouse.set(key, row);
    }
  }
  const rows = [];
  const seen = new Set();
  for (const object of MATRIX_OBJECTS) {
    const key = accessionKey(object.accession);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(rowFor(object, conversation.has(key) ? 'conversation' : 'spatial', lakehouse.get(key)));
  }
  for (const object of PUBLIC_ANCHORS) {
    const key = accessionKey(object.accession);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(rowFor(object, 'object-lens', lakehouse.get(key)));
  }
  rows.sort((a, b) => ORDER[a.priority] - ORDER[b.priority] || a.accession.localeCompare(b.accession));
  return rows;
}

export function imageRequestCsv(packet) {
  const rows = imageRequestRows(packet);
  return [COLUMNS.join(','), ...rows.map(row => COLUMNS.map(column => cell(row[column])).join(','))].join('\n') + '\n';
}

/** One column, the exact header the Lakehouse bulk filter looks up. */
export function fieldIdentifierCsv(packet) {
  const rows = imageRequestRows(packet);
  return ['field_identifier', ...rows.map(row => cell(row.field_identifier))].join('\n') + '\n';
}
