import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  buildEvidenceViewModel,
  canEnterConversation,
  clampSimDt,
  eventTrace,
  MAX_SIM_DT,
  requestStage,
  SILENT_HOLD_SECONDS
} from '../world/src/world-logic.mjs';
import { advanceWorld } from '../world/src/sim-loop.mjs';
import {
  createWorldFromPacket,
  EMBODIED_AGENTS,
  resetWorldState
} from '../world/src/world-state.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadFixtureWorld(reducedMotion = false) {
  const packet = JSON.parse(
    await readFile(path.join(root, 'demo/data/objects/02-sparton-radio.json'), 'utf8')
  );
  const candidates = JSON.parse(
    await readFile(path.join(root, 'demo/data/object-request-candidates/sim-001.json'), 'utf8')
  );
  const residency = (candidates.candidates || []).find((item) => item.seedId === 'WOLF-002');
  return createWorldFromPacket(packet, residency, reducedMotion);
}

test('embodied cast is Worker and Futurist only; Archivist is not a roaming agent', async () => {
  const world = await loadFixtureWorld();
  assert.deepEqual(
    world.agents.map((a) => a.id).sort(),
    [...EMBODIED_AGENTS].sort()
  );
  assert.equal(world.agents.some((a) => a.id === 'archivist'), false);
  assert.equal(world.agents.some((a) => a.id === 'propagandist'), false);
  assert.equal(world.archivistConstraint.kind, 'provenance_gate');
});

test('clampSimDt never exceeds 1/30 and rejects invalid input', () => {
  assert.equal(clampSimDt(1), MAX_SIM_DT);
  assert.equal(clampSimDt(0.01), 0.01);
  assert.equal(clampSimDt(-3), 0);
  assert.equal(clampSimDt(Number.NaN), 0);
});

test('fixed-dt sequence forms contradiction after silent hold without auto-conversation', async () => {
  const world = await loadFixtureWorld(false);
  const dt = MAX_SIM_DT;
  let steps = 0;
  const maxSteps = Math.ceil(40 / dt);
  while (!world.contradiction.selectable && steps < maxSteps) {
    advanceWorld(world, dt);
    steps += 1;
  }
  assert.equal(world.contradiction.active, true);
  assert.equal(world.contradiction.selectable, true);
  assert.equal(canEnterConversation(world), true);
  assert.notEqual(world.stage, 'conversation');
  // Continue ticking — conversation must still not auto-enter.
  for (let i = 0; i < Math.ceil(10 / dt); i += 1) {
    advanceWorld(world, dt);
  }
  assert.notEqual(world.stage, 'conversation');
  assert.ok(world._oppositionSince == null || world.simulationTime - world._oppositionSince >= SILENT_HOLD_SECONDS - 0.05 || world.contradiction.active);
});

test('buildEvidenceViewModel classifies ESTABLISHED / INFERENCE / NOT ESTABLISHED', async () => {
  const world = await loadFixtureWorld();
  const futurist = world.agents.find((a) => a.id === 'futurist');
  const model = buildEvidenceViewModel(world.record, futurist);
  assert.ok(model.accessionLine.includes('XX1990.1484'));
  assert.ok(model.materials.includes('Bakelite'));
  assert.equal(model.citedAt, '2026-09-02');
  assert.ok(model.established.includes('accession'));
  assert.equal(model.claimType, 'INFERENCE');
  assert.equal(model.inference.length, 1);
  assert.ok(model.inference[0].includes('Streamline') || model.inference[0].length > 20);
  assert.ok(model.notEstablished.some((item) => /labor|ownership|household|listener/i.test(item)));
  assert.ok(model.supportingEvidence.length >= 1);
  assert.match(model.note, /public packet/i);

  const missing = buildEvidenceViewModel(null, null);
  assert.equal(missing.established.length, 0);
  assert.match(missing.note, /Missing record/);
});

test('resetWorldState restores guided-path baseline', async () => {
  const world = await loadFixtureWorld();
  for (let i = 0; i < 400; i += 1) advanceWorld(world, MAX_SIM_DT);
  world.stage = 'claim';
  world.activeClaimId = 'futurist';
  world.spokenIndex = 1;
  resetWorldState(world);
  assert.equal(world.stage, 'world');
  assert.equal(world.simulationTime, 0);
  assert.equal(world.contradiction.active, false);
  assert.equal(world.contradiction.selectable, false);
  assert.equal(world.activeClaimId, null);
  assert.equal(world.spokenIndex, -1);
  assert.equal(world.agents.length, 2);
});

test('requestStage rejects conversation before contradiction', async () => {
  const world = await loadFixtureWorld();
  const blocked = requestStage(world, 'conversation');
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'contradiction_required');
  world.contradiction.selectable = true;
  const allowed = requestStage(world, 'conversation');
  assert.equal(allowed.ok, true);
});

test('two identical fixed-dt runs produce the same event trace', async () => {
  async function run() {
    const world = await loadFixtureWorld(false);
    const traces = [];
    for (let i = 0; i < 500; i += 1) {
      advanceWorld(world, MAX_SIM_DT);
      if (i % 50 === 0 || world.contradiction.selectable) {
        traces.push(eventTrace(world));
      }
      if (world.contradiction.selectable && i > 300) break;
    }
    return traces;
  }
  const a = await run();
  const b = await run();
  assert.deepEqual(a, b);
});
