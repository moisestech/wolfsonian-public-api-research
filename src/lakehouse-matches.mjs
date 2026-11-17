/** Join a bounded aa_good_lookup capture to the project object list. No photographs or box values. */

import { MATRIX_OBJECTS } from './matrix-objects.mjs';
import { PUBLIC_ANCHORS } from './atlas-graph.mjs';
import { reconcileLookup } from './archive-evidence.mjs';

export const LOOKUP_URL = 'https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup';
export const MAX_BYTES = 8 * 1024 * 1024;
export const MAX_ROWS = 4000;

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function accessionKey(value) {
  return clean(value).replace(/[–—]/g, '-').replace(/\s+/g, '').toUpperCase();
}

export function wantedAccessions() {
  const keys = new Set();
  for (const object of MATRIX_OBJECTS) keys.add(accessionKey(object.accession));
  for (const object of PUBLIC_ANCHORS) keys.add(accessionKey(object.accession));
  return keys;
}

export function accessionHits(value, wanted) {
  const full = clean(value);
  const parts = [full, ...full.split(';').map(clean)].filter(Boolean);
  const hits = [];
  const seen = new Set();
  for (const part of parts) {
    const key = accessionKey(part);
    if (!key || seen.has(key) || !wanted.has(key)) continue;
    seen.add(key);
    hits.push(part);
  }
  return hits;
}

function textFields(row) {
  const out = {};
  for (const [key, value] of Object.entries(row || {})) {
    if (/image|thumbnail|photo|binary|filename|media|file/i.test(key)) continue;
    if (typeof value === 'string' && /^https?:/i.test(value.trim())) continue;
    out[key] = value;
  }
  return out;
}

export function createMatchCollector(wanted = wantedAccessions()) {
  let bytes = 0;
  let rows = 0;
  let depth = 0;
  let inString = false;
  let escape = false;
  let capturing = null;
  let stopped = null;
  const matches = [];
  const found = new Set();

  function finishObject() {
    const raw = capturing;
    capturing = null;
    rows += 1;
    let row = null;
    try { row = JSON.parse(raw); } catch { row = null; }
    const hits = row ? accessionHits(row['Accession Number'], wanted) : [];
    if (hits.length && hits.some(hit => !found.has(accessionKey(hit)))) {
      for (const hit of hits) found.add(accessionKey(hit));
      matches.push(textFields(row));
    }
    if (!stopped && (rows >= MAX_ROWS || found.size >= wanted.size)) stopped = found.size >= wanted.size ? 'complete' : 'row-cap';
  }

  return {
    push(chunk) {
      if (stopped) return stopped;
      bytes += Buffer.byteLength(chunk);
      for (const char of chunk) {
        if (stopped) break;
        if (inString) {
          if (capturing !== null) capturing += char;
          if (escape) escape = false;
          else if (char === '\\') escape = true;
          else if (char === '"') inString = false;
          continue;
        }
        if (char === '"') {
          inString = true;
          if (capturing !== null) capturing += char;
          continue;
        }
        if (char === '{') {
          depth += 1;
          if (depth === 2) capturing = '{';
          else if (capturing !== null) capturing += char;
          continue;
        }
        if (char === '}') {
          if (capturing !== null) capturing += char;
          if (depth === 2 && capturing !== null) finishObject();
          depth = Math.max(0, depth - 1);
          continue;
        }
        if (capturing !== null) capturing += char;
      }
      if (!stopped && bytes >= MAX_BYTES) stopped = 'byte-cap';
      return stopped;
    },
    result() {
      return {
        retrievedAt: new Date().toISOString(),
        sourceUrl: LOOKUP_URL,
        stopped: stopped || 'end',
        rowsSeen: rows,
        bytesSeen: bytes,
        matches
      };
    }
  };
}

export function conversationRecords(packet) {
  const rows = Array.isArray(packet?.matches) ? packet.matches : [];
  const byKey = new Map(MATRIX_OBJECTS.map(object => [accessionKey(object.accession), object]));
  const built = [];
  for (const row of rows) {
    const hits = accessionHits(row['Accession Number'], new Set(byKey.keys()));
    for (const accession of hits) {
    const matrix = byKey.get(accessionKey(accession));
    const title = clean(row.Title) || matrix?.title || '';
    if (!accession || !title || !matrix) continue;
    const themes = (matrix.themes || []).map(clean).filter(Boolean);
    const motifs = (matrix.motifs || []).map(clean).filter(Boolean);
    built.push({
      accession,
      title,
      source: 'lakehouse',
      creator: clean(row.Creator) || matrix.creator || '',
      date: clean(row.Date) || matrix.date || '',
      objectType: matrix.objectType || clean(row.Genre) || '',
      catalogSubject: clean(row.Subject),
      catalogDescription: clean(row.Description),
      geography: clean(row['Geographic Origin']),
      imageFilename: '',
      interpretiveText: 'Lakehouse lookup. A shared tag is not a historical relationship.',
      tags: [
        ...themes.map((value, index) => ({ id: 'theme:' + value.toLowerCase(), family: 'theme', value, sourceColumns: ['Thematic Category ' + (index + 1)] })),
        ...motifs.map((value, index) => ({ id: 'motif:' + value.toLowerCase(), family: 'motif', value, sourceColumns: ['Symbols/Motifs ' + (index + 1)] }))
      ]
    });
    }
  }
  const counts = new Map();
  for (const record of built) {
    for (const tag of record.tags) {
      const key = tag.family + '\n' + tag.value;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const records = built.filter(record => record.tags.some(tag => counts.get(tag.family + '\n' + tag.value) > 1));
  return { records, matched: rows.length, strong: records.length };
}

export function lookupSnapshots(packet, records) {
  const rows = Array.isArray(packet?.matches) ? packet.matches : [];
  const snapshots = [];
  for (const record of records) {
    const wanted = new Set([accessionKey(record.accession)]);
    const row = rows.find(item => accessionHits(item['Accession Number'], wanted).some(hit => accessionKey(hit) === accessionKey(record.accession)));
    if (!row) continue;
    const snapshot = reconcileLookup({ data: [{ ...row, 'Accession Number': record.accession }] }, record.accession, packet.retrievedAt || new Date().toISOString());
    snapshot.sourceUrl = LOOKUP_URL;
    snapshots.push([record.accession, snapshot]);
  }
  return snapshots;
}

export function applyLakehouseFields(objects, packet) {
  const rows = Array.isArray(packet?.matches) ? packet.matches : [];
  const byKey = new Map();
  for (const row of rows) {
    for (const hit of accessionHits(row['Accession Number'], wantedAccessions())) byKey.set(accessionKey(hit), row);
  }
  return objects.map(object => {
    const row = byKey.get(accessionKey(object.accession));
    if (!row) return object;
    const date = clean(row.Date);
    const creator = clean(row.Creator);
    const catalogSubject = clean(row.Subject);
    const catalogDescription = clean(row.Description);
    const geography = clean(row['Geographic Origin']);
    return { ...object, ...(date ? { date } : {}), ...(creator ? { creator } : {}), ...(catalogSubject ? { catalogSubject } : {}), ...(catalogDescription ? { catalogDescription } : {}), ...(geography ? { geography } : {}), confirmed: true };
  });
}
