import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  buildHandoffFromWorld,
  buildResearchConsoleUrl,
  validateHandoff,
} from '../world/src/research-handoff.mjs';
import { createWorldFromPacket } from '../world/src/world-state.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadFixtureWorld() {
  const packet = JSON.parse(
    await readFile(path.join(root, 'demo/data/objects/02-sparton-radio.json'), 'utf8')
  );
  return createWorldFromPacket(packet, null, false);
}

test('buildHandoffFromWorld emits approved Sparton Futurist context', async () => {
  const world = await loadFixtureWorld();
  world.activeClaimId = 'futurist';
  world.stage = 'claim';
  const handoff = buildHandoffFromWorld(world);
  assert.ok(handoff);
  assert.equal(handoff.objectId, 'WOLF-002');
  assert.equal(handoff.claimId, 'futurist');
  assert.equal(handoff.readerId, 'futurist');
  assert.equal(handoff.sourceRevision, '2026-09-02');
  assert.equal(handoff.sceneCheckpoint, 'claim');
});

test('validateHandoff accepts Worker claim and rejects unsafe params', () => {
  const ok = validateHandoff({
    objectId: 'WOLF-002',
    claimId: 'worker',
    readerId: 'worker',
    sourceRevision: '2026-09-02',
  });
  assert.equal(ok.ok, true);

  const badObject = validateHandoff({
    objectId: '../etc/passwd',
    claimId: 'futurist',
    readerId: 'futurist',
    sourceRevision: '2026-09-02',
  });
  assert.equal(badObject.ok, false);

  const badUrl = validateHandoff({
    objectId: 'WOLF-002',
    claimId: 'futurist',
    readerId: 'futurist',
    sourceRevision: 'https://evil.example',
  });
  assert.equal(badUrl.ok, false);

  const unknownClaim = validateHandoff({
    objectId: 'WOLF-002',
    claimId: 'propagandist',
    readerId: 'propagandist',
    sourceRevision: '2026-09-02',
  });
  assert.equal(unknownClaim.ok, false);
});

test('buildResearchConsoleUrl encodes only validated IDs', () => {
  const url = buildResearchConsoleUrl({
    objectId: 'WOLF-002',
    claimId: 'futurist',
    readerId: 'futurist',
    sourceRevision: '2026-09-02',
    sceneCheckpoint: 'evidence',
  });
  assert.match(url, /^\/research-console\/\?/);
  const params = new URL(url, 'https://example.test').searchParams;
  assert.equal(params.get('objectId'), 'WOLF-002');
  assert.equal(params.get('claimId'), 'futurist');
  assert.equal(params.get('sceneCheckpoint'), 'evidence');
});

test('URLSearchParams validation works for console route entry', () => {
  const params = new URLSearchParams(
    'objectId=WOLF-002&claimId=worker&readerId=worker&sourceRevision=2026-09-02'
  );
  const result = validateHandoff(params);
  assert.equal(result.ok, true);
  assert.equal(result.handoff.claimId, 'worker');
});
