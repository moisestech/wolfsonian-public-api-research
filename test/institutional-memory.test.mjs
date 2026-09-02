import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_AGENTS = ['archivist', 'worker', 'futurist', 'mourner', 'propagandist', 'counterfeit'];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

test('research seeds are dual-layer separated from interpretations', async () => {
  const seedFiles = (await readdir(join(root, 'data', 'research-seeds'))).filter((n) => n.endsWith('.json'));
  assert.ok(seedFiles.length >= 8);
  assert.ok(seedFiles.length <= 30);

  for (const file of seedFiles) {
    const seed = await readJson(join(root, 'data', 'research-seeds', file));
    assert.ok(seed.id.startsWith('WOLF-'));
    assert.ok(seed.accessionNumber);
    assert.ok(Array.isArray(seed.source_urls));
    assert.ok(seed.source_urls[0].startsWith('https://'));
    assert.equal(seed.research_status, 'public-record-only');
    assert.equal('agents' in seed, false, 'source seeds must not embed interpretive agents');
    assert.equal('possible_pressures' in seed, false, 'pressures belong in interpretation layer');

    const interp = await readJson(join(root, 'data', 'interpretations', `${seed.id}.json`));
    assert.equal(interp.packet_id, seed.id);
    assert.ok(Array.isArray(interp.entities));
    assert.ok(Array.isArray(interp.possible_pressures));
    assert.equal('accessionNumber' in interp, false, 'interpretation must not duplicate accession identity fields');
    assert.equal('source_urls' in interp, false);
  }
});

test('institutional graph covers all seeds and separates layers', async () => {
  const graph = await readJson(join(root, 'demo', 'data', 'graph.json'));
  const seedFiles = (await readdir(join(root, 'data', 'research-seeds'))).filter((n) => n.endsWith('.json'));
  assert.equal(graph.counts.records, seedFiles.length);
  assert.ok(graph.counts.edges > 0);
  assert.ok(graph.counts.sourceEdges > 0);
  assert.ok(graph.counts.interpretedEdges > 0);
  for (const edge of graph.edges) {
    assert.ok(edge.layer === 'source' || edge.layer === 'interpreted');
  }
});

test('simulation rounds ground claims to seed ids', async () => {
  const manifest = await readJson(join(root, 'data', 'simulations', 'sim-001', 'manifest.json'));
  const seedIds = new Set(manifest.seedIds);
  assert.equal(manifest.rounds.length, 3);
  assert.ok(manifest.counts.unresolvedContradictions > 0);

  for (const roundId of manifest.rounds) {
    const round = await readJson(join(root, 'data', 'simulations', 'sim-001', 'rounds', `${roundId}.json`));
    assert.ok(round.claims.length > 0);
    for (const claim of round.claims) {
      assert.ok(['supported', 'inference', 'fabrication'].includes(claim.kind));
      assert.ok(claim.grounding.length > 0);
      for (const g of claim.grounding) {
        assert.ok(seedIds.has(g.seedId), `unknown seed ${g.seedId}`);
      }
    }
  }
});

test('compiled demo packets keep agent overlays for drill-down', async () => {
  const trial = await readJson(join(root, 'demo', 'data', 'trial-001.json'));
  assert.equal(trial.objects.length, 8);
  for (const objectId of trial.objects) {
    const packet = await readJson(join(root, 'demo', 'data', 'objects', `${objectId}.json`));
    assert.ok(packet.seedId);
    assert.ok(packet.source.accessionNumber);
    assert.ok(packet.archivalActor);
    for (const agentId of REQUIRED_AGENTS) {
      assert.ok(packet.agents[agentId], `${objectId} missing ${agentId}`);
      assert.ok(packet.agents[agentId].onsiteQuestion);
    }
  }
});

test('demo app still avoids live digital host fetches', async () => {
  const app = await readFile(join(root, 'demo', 'app.js'), 'utf8');
  assert.equal(app.includes('digital.wolfsonian.org'), false);
  assert.equal(/fetch\s*\(\s*['"]https?:/.test(app), false);
});
