import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';
import { RADIO_TV_ROOM_ID, runRadioTvResearch } from '../src/radio-tv-research-tools.mjs';

const room = CURATORIAL_PATHS.find(path => path.id === RADIO_TV_ROOM_ID);
const loadPublicPacket = async id => JSON.parse(
  await readFile(new URL('../data/public/objects/' + id + '.json', import.meta.url), 'utf8')
);
const execute = (overrides = {}) => runRadioTvResearch({
  intent: 'compare', room, loadPublicPacket, ...overrides,
});

test('actual public records produce a reproducible, accession-accurate investigation', async () => {
  const observed = [];
  const result = await execute({ onEvent: event => observed.push(event) });
  assert.equal(result.status, 'completed');
  assert.equal(result.roomId, RADIO_TV_ROOM_ID);
  assert.deepEqual(result.records.map(record => record.packetId), ['WOLF-008', 'WOLF-002']);
  assert.deepEqual(result.records.map(record => record.accession), ['2012.6.1', 'XX1990.1484']);
  assert.equal(result.records[0].date, '1939');
  assert.equal(result.records[1].date, '1937');
  assert.equal(result.comparison.relation, 'curatorial_juxtaposition');
  assert.equal(result.comparison.historicalRelationshipEstablished, false);
  assert.match(result.answer, /Artist-authored juxtaposition/);
  assert.match(result.answer, /NOT ESTABLISHED/);
  assert.equal(result.citationCheck, 'reference_ids_resolved_semantic_support_not_assessed');
  assert.equal(result.evidence.length, 10);
  for (const source of result.records) {
    assert.match(source.packetSha256, /^[a-f0-9]{64}$/);
    assert.equal(source.retrievedAt, '2026-09-02');
    assert.ok(source.sourceUrl.startsWith('https://wolfsonian.org/'));
    assert.equal(Object.hasOwn(source, 'representation'), false);
  }
  for (const ref of result.evidence) {
    assert.equal(ref.classification, 'public');
    assert.equal(ref.packetSha256, result.records.find(r => r.packetId === ref.packetId).packetSha256);
    assert.ok(['title', 'accessionNumber', 'date', 'creator', 'materials'].includes(ref.field));
    assert.ok(ref.evidenceId.startsWith(ref.packetId + ':'));
  }
  assert.deepEqual(observed, result.events);
  assert.deepEqual(result.events.map((event, i) => event.sequence), [...Array(result.events.length)].map((_, i) => i + 1));
  assert.deepEqual(result.events.map(event => event.kind), [
    'run.started',
    'tool.started', 'tool.completed',
    'tool.started', 'tool.completed',
    'tool.started', 'tool.completed',
    'tool.started', 'tool.completed',
    'run.completed',
  ]);
  const measured = result.events.filter(event => event.kind === 'tool.completed');
  assert.equal(measured.length, 4);
  assert.ok(measured.every(event => typeof event.durationMs === 'number' && event.durationMs >= 0));
  assert.ok(result.events.every(event => event.mode === 'deterministic_public_only'));
});

test('a valid source identifier resolves but does not claim semantic entailment', async () => {
  const result = await execute({ claimedCitationIds: ['WOLF-008:title', 'WOLF-002:date'] });
  assert.equal(result.status, 'completed');
  assert.equal(result.citationCheck, 'reference_ids_resolved_semantic_support_not_assessed');
});

test('a fabricated citation fails closed, without returning partial records', async () => {
  const result = await execute({ claimedCitationIds: ['WOLF-008:title', 'WOLF-999:title'] });
  assert.equal(result.status, 'blocked');
  assert.equal(result.errorCode, 'UNKNOWN_EVIDENCE_REF');
  assert.equal(result.events.at(-2).kind, 'tool.failed');
  assert.equal(result.events.at(-1).kind, 'run.blocked');
  assert.equal(Object.hasOwn(result, 'records'), false);
  assert.equal(Object.hasOwn(result, 'answer'), false);
});

test('unsupported intent is blocked before any record loading', async () => {
  let calls = 0;
  const result = await execute({
    intent: 'find-secret-storage-records',
    loadPublicPacket: async () => { calls += 1; return {}; },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.errorCode, 'UNSUPPORTED_INTENT');
  assert.equal(calls, 0);
  assert.deepEqual(result.events.map(event => event.kind), ['run.started', 'run.blocked']);
});

test('room identities and historically false relationships cannot be substituted', async () => {
  const result = await execute({
    room: { ...room, historicalRelationshipEstablished: true },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.errorCode, 'ROOM_NOT_APPROVED');
  assert.deepEqual(result.events.map(event => event.kind), ['run.started', 'run.blocked']);
});

test('a forged or malformed public packet fails closed', async () => {
  const bad = await execute({
    loadPublicPacket: async id => {
      const original = await loadPublicPacket(id);
      return id === 'WOLF-008' ? { ...original, accessionNumber: 'FICTION-0001' } : original;
    },
  });
  assert.equal(bad.status, 'blocked');
  assert.equal(bad.errorCode, 'PUBLIC_PACKET_INVALID');
  assert.equal(bad.events.at(-2).kind, 'tool.failed');
  assert.equal(bad.events.at(-1).kind, 'run.blocked');
  assert.equal(Object.hasOwn(bad, 'evidence'), false);
});

test('source redirects to an untrusted domain are rejected even with valid identity', async () => {
  const result = await execute({
    loadPublicPacket: async id => {
      const original = await loadPublicPacket(id);
      return id === 'WOLF-008'
        ? { ...original, source_urls: ['https://attacker.example/collection'] } : original;
    },
  });
  assert.equal(result.status, 'blocked');
  assert.equal(result.errorCode, 'SOURCE_URL_NOT_APPROVED');
});

test('a loader outage emits real tool failure and run failure', async () => {
  const result = await execute({
    loadPublicPacket: async () => { throw new Error('upstream timeout'); },
  });
  assert.equal(result.status, 'failed');
  assert.equal(result.errorCode, 'TOOL_EXECUTION_FAILED');
  assert.deepEqual(result.events.map(e => e.kind), [
    'run.started', 'tool.started', 'tool.failed', 'run.failed',
  ]);
  assert.equal(result.events.some(e => JSON.stringify(e).includes('upstream timeout')), false);
});

test('unknowns are explicitly packet-scoped, not evidence of absent historical facts', async () => {
  const result = await execute({ intent: 'limits' });
  assert.equal(result.status, 'completed');
  assert.match(result.answer, /NOT ESTABLISHED by these packets/);
  assert.match(result.answer, /household use history/);
  assert.match(result.answer, /listener experience/);
  assert.equal(result.comparison.historicalRelationshipEstablished, false);
});
