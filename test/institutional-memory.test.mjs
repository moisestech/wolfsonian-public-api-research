import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_AGENTS = ['archivist', 'worker', 'futurist', 'mourner', 'propagandist', 'counterfeit'];
const CLAIM_TYPES = new Set(['SOURCE_SUPPORTED', 'INFERENCE', 'UNCERTAIN', 'FABRICATION_TEST']);

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

test('public objects are dual-layer separated from interpretations', async () => {
  const seedFiles = (await readdir(join(root, 'data', 'public', 'objects'))).filter((n) => n.endsWith('.json'));
  assert.ok(seedFiles.length >= 6);
  assert.ok(seedFiles.length <= 30);

  for (const file of seedFiles) {
    const seed = await readJson(join(root, 'data', 'public', 'objects', file));
    assert.ok(seed.id.startsWith('WOLF-'));
    assert.ok(seed.accessionNumber);
    assert.ok(Array.isArray(seed.source_urls));
    assert.ok(seed.source_urls[0].startsWith('https://'));
    assert.equal(seed.research_status, 'public-record-only');
    assert.equal('agents' in seed, false);
    assert.equal('possible_pressures' in seed, false);

    const interp = await readJson(join(root, 'data', 'research', 'interpretations', `${seed.id}.json`));
    assert.equal(interp.packet_id, seed.id);
    assert.ok(Array.isArray(interp.entities));
    assert.equal('accessionNumber' in interp, false);
    assert.equal('source_urls' in interp, false);
  }
});

test('featured graph covers manifest seedIds and separates layers', async () => {
  const manifest = await readJson(join(root, 'data', 'research', 'simulations', 'sim-001', 'manifest.json'));
  const graph = await readJson(join(root, 'demo', 'data', 'graph.json'));
  assert.equal(graph.counts.records, manifest.seedIds.length);
  assert.ok(graph.counts.sourceEdges > 0);
  assert.ok(graph.counts.interpretedEdges > 0);
  for (const edge of graph.edges) {
    assert.ok(edge.layer === 'source' || edge.layer === 'interpreted');
  }
});

test('simulation rounds use claimType enum and ground to featured seeds', async () => {
  const manifest = await readJson(join(root, 'data', 'research', 'simulations', 'sim-001', 'manifest.json'));
  const seedIds = new Set(manifest.seedIds);
  assert.equal(manifest.rounds.length, 5);

  let sawAgreement = false;
  let sawContradiction = false;
  let sawUncertain = false;
  let sawFabrication = false;
  let sawChallenge = false;
  let onsiteCount = 0;

  for (const roundId of manifest.rounds) {
    const round = await readJson(join(root, 'data', 'research', 'simulations', 'sim-001', 'rounds', `${roundId}.json`));
    for (const claim of round.claims) {
      assert.ok(CLAIM_TYPES.has(claim.claimType), `bad claimType ${claim.claimType}`);
      assert.equal('kind' in claim, false);
      assert.ok(claim.grounding.length > 0);
      for (const g of claim.grounding) {
        assert.ok(seedIds.has(g.seedId), `claim ${claim.id} references non-featured ${g.seedId}`);
      }
      if (claim.agreesWith?.length) sawAgreement = true;
      if (claim.contradicts?.length) sawContradiction = true;
      if (claim.claimType === 'UNCERTAIN') sawUncertain = true;
      if (claim.claimType === 'FABRICATION_TEST') sawFabrication = true;
      if (claim.interactions?.some((i) => i.type === 'CHALLENGES')) sawChallenge = true;
      if (claim.residencyQuestion) onsiteCount += 1;
    }
  }

  assert.equal(sawAgreement, true);
  assert.equal(sawContradiction, true);
  assert.equal(sawUncertain, true);
  assert.equal(sawFabrication, true);
  assert.equal(sawChallenge, true);
  assert.ok(onsiteCount >= 3);
});

test('compiled demo packets keep agent overlays for drill-down', async () => {
  const trial = await readJson(join(root, 'demo', 'data', 'trial-001.json'));
  assert.equal(trial.id, 'research-demo-001');
  assert.equal(trial.objects.length, 6);
  for (const objectId of trial.objects) {
    const packet = await readJson(join(root, 'demo', 'data', 'objects', `${objectId}.json`));
    assert.ok(packet.seedId);
    assert.ok(packet.archivalActor);
    for (const agentId of REQUIRED_AGENTS) {
      assert.ok(packet.agents[agentId]);
      assert.ok(packet.agents[agentId].onsiteQuestion);
    }
  }
});

test('object-request candidates reference featured accessions', async () => {
  const candidates = await readJson(join(root, 'data', 'research', 'object-request-candidates', 'sim-001.json'));
  assert.ok(candidates.candidates.length >= 3);
  for (const item of candidates.candidates) {
    assert.ok(item.accessionNumber);
    assert.ok(item.title);
    assert.ok(String(item.sourceUrl).startsWith('https://'));
    assert.ok(item.whyRequest);
    assert.ok(item.generatingContradiction);
    assert.ok(item.onsiteQuestions?.length);
  }
});

test('demo app still avoids live digital host fetches', async () => {
  const app = await readFile(join(root, 'demo', 'app.js'), 'utf8');
  assert.equal(app.includes('digital.wolfsonian.org'), false);
  assert.equal(/fetch\s*\(\s*['"]https?:/.test(app), false);
});
