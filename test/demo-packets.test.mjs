import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const demoData = join(root, 'demo', 'data');
const REQUIRED_AGENTS = ['archivist', 'worker', 'futurist', 'mourner', 'propagandist', 'counterfeit'];
const AGENT_FIELDS = [
  'observation',
  'claim',
  'evidence',
  'agreesWith',
  'contradicts',
  'uncertainty',
  'confidence',
  'onsiteQuestion',
  'fabrication'
];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function assertAgent(agentId, agent, packetId) {
  for (const field of AGENT_FIELDS) {
    assert.ok(field in agent, `${packetId}.${agentId} missing ${field}`);
  }
  assert.equal(typeof agent.observation, 'string');
  assert.ok(agent.observation.trim().length > 0, `${packetId}.${agentId}.observation empty`);
  assert.ok(agent.claim.trim().length > 0, `${packetId}.${agentId}.claim empty`);
  assert.ok(agent.uncertainty.trim().length > 0, `${packetId}.${agentId}.uncertainty empty`);
  assert.ok(agent.onsiteQuestion.trim().length > 0, `${packetId}.${agentId}.onsiteQuestion empty`);
  assert.ok(Array.isArray(agent.evidence), `${packetId}.${agentId}.evidence must be array`);
  assert.ok(agent.evidence.length > 0, `${packetId}.${agentId}.evidence empty`);
  for (const item of agent.evidence) {
    assert.ok(item.text?.trim(), `${packetId}.${agentId} evidence needs text`);
    assert.ok(item.sourceRef?.trim(), `${packetId}.${agentId} evidence needs sourceRef`);
  }
  assert.ok(Array.isArray(agent.agreesWith));
  assert.ok(Array.isArray(agent.contradicts));
  assert.equal(typeof agent.confidence, 'number');
  assert.ok(agent.confidence >= 0 && agent.confidence <= 1);
  assert.equal(typeof agent.fabrication, 'boolean');
  if (agentId === 'counterfeit') {
    assert.equal(agent.fabrication, true, 'Counterfeit must be marked fabrication');
  }
}

test('trial manifest lists three objects and six agents', async () => {
  const trial = await readJson(join(demoData, 'trial-001.json'));
  assert.equal(trial.id, 'trial-001');
  assert.equal(trial.objects.length, 3);
  assert.equal(trial.agents.length, 6);
  assert.deepEqual(
    trial.agents.map((agent) => agent.id),
    REQUIRED_AGENTS
  );
});

test('each demo object packet matches provenance and agent schema', async () => {
  const trial = await readJson(join(demoData, 'trial-001.json'));

  for (const objectId of trial.objects) {
    const packet = await readJson(join(demoData, 'objects', `${objectId}.json`));
    assert.equal(packet.id, objectId);
    assert.ok(packet.trialLabel?.startsWith('Object'));
    assert.equal(packet.representation?.type, 'original-svg');
    assert.ok(packet.representation?.src?.endsWith('.svg'));

    const { source } = packet;
    assert.ok(source.institution);
    assert.ok(source.title?.trim());
    assert.ok(source.accessionNumber?.trim());
    assert.ok(String(source.publicRecordUrl).startsWith('https://'));
    assert.ok(source.preparation?.includes('manually prepared'));
    assert.ok(source.citedAt);
    assert.ok(Array.isArray(source.missingFields));

    assert.deepEqual(Object.keys(packet.agents).sort(), [...REQUIRED_AGENTS].sort());
    for (const agentId of REQUIRED_AGENTS) {
      assertAgent(agentId, packet.agents[agentId], objectId);
      for (const other of packet.agents[agentId].agreesWith) {
        assert.ok(REQUIRED_AGENTS.includes(other), `${objectId}.${agentId} agreesWith unknown ${other}`);
      }
      for (const other of packet.agents[agentId].contradicts) {
        assert.ok(REQUIRED_AGENTS.includes(other), `${objectId}.${agentId} contradicts unknown ${other}`);
      }
    }
  }
});

test('demo assets referenced by packets exist as original SVGs', async () => {
  const trial = await readJson(join(demoData, 'trial-001.json'));
  for (const objectId of trial.objects) {
    const packet = await readJson(join(demoData, 'objects', `${objectId}.json`));
    const relative = packet.representation.src.replace(/^\.\.\//, '');
    const assetPath = join(root, 'demo', relative);
    const svg = await readFile(assetPath, 'utf8');
    assert.ok(svg.includes('<svg'), `${assetPath} should be SVG`);
    assert.ok(!svg.toLowerCase().includes('xlink:href="http'), `${assetPath} should not embed remote images`);
  }
});

test('demo app does not fetch the live digital host', async () => {
  const app = await readFile(join(root, 'demo', 'app.js'), 'utf8');
  assert.equal(app.includes('digital.wolfsonian.org'), false);
  assert.equal(/fetch\s*\(\s*['"]https?:/.test(app), false);
});
