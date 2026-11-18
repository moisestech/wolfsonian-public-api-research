import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sceneForConfirmedEdge } from '../src/curated-edge-scenes.mjs';
import { conversationFor } from '../src/archive-society.mjs';
import { WORLDS_FAIRS_RESEARCH } from '../src/worlds-fairs-research.mjs';
import {
  CURATORIAL_PATHS,
  DOCUMENTED_HISTORICAL_RELATIONSHIPS,
  RELATIONSHIP_TYPES,
  juxtapositionConversation,
} from '../src/curatorial-relationships.mjs';
import { FORBIDDEN_OUTPUT, PUBLIC_FILES } from '../scripts/assemble-public-site.mjs';

const CHECKLIST = 'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf';
const SIX = ['83.2.19', 'XC2024.03.1.1', '83.6.2', '84.6.14', 'TD1989.19.9', 'XB1991.830'];

test('six checklist records keep separate provenance and stay distinct from the 1940 booklet', async () => {
  const file = JSON.parse(await readFile(new URL('../data/research/worlds-fairs-critical-records-20261117.json', import.meta.url), 'utf8'));
  assert.deepEqual(file, WORLDS_FAIRS_RESEARCH);
  assert.equal(file.status, 'research_only_not_runtime');
  assert.equal(file.source.url, CHECKLIST);
  assert.deepEqual(file.candidates.map(item => item.accession), SIX);
  const futurama = file.candidates.find(item => item.accession === '83.2.19');
  assert.notEqual(futurama.accession, 'XB1992.1640');
  assert.equal(futurama.distinctFrom.accession, 'XB1992.1640');
  const pamphlet = file.candidates.find(item => item.accession === 'XB1991.830');
  assert.equal(pamphlet.alternateAccession.accession, 'XC2017.01.2.311');
  assert.equal(pamphlet.alternateAccession.status, 'unresolved');
  for (const item of file.candidates) {
    assert.equal(item.published_checklist, true);
    assert.equal(item.lakehouse_matched, false);
    assert.equal(item.curator_reviewed, false);
    assert.equal(item.rights_approved, false);
    assert.equal(item.research_only, true);
    assert.equal(item.publicSource, CHECKLIST);
  }
  assert.deepEqual(file.candidates.filter(item => item.graph === 'registry_only').map(item => item.accession), ['TD1989.19.9', 'XB1991.830']);
});

test('curatorial juxtapositions cannot pass the metadata gate and establish no historical relationship', () => {
  assert.equal(DOCUMENTED_HISTORICAL_RELATIONSHIPS.length, 0);
  assert.equal(RELATIONSHIP_TYPES.documented_historical_relationship.id, 'documented_historical_relationship');
  assert.equal(CURATORIAL_PATHS.length, 11);
  const registryOnly = new Set(['TD1989.19.9', 'XB1991.830']);
  for (const path of CURATORIAL_PATHS) {
    assert.equal(path.relationshipType, 'curatorial_juxtaposition');
    assert.notEqual(path.relationshipType, 'metadata_overlap');
    assert.equal(path.historicalRelationshipEstablished, false);
    assert.equal(path.edge.reasons.length, 0);
    assert.equal(path.edge.historicalRelationshipEstablished, false);
    assert.equal(sceneForConfirmedEdge(path.source.accession, path.target.accession, [{ family: 'theme', value: 'Technology' }]), null);
    assert.equal(sceneForConfirmedEdge(path.source.accession, path.target.accession, []), null);
    assert.equal(registryOnly.has(path.source.accession), false);
    assert.equal(registryOnly.has(path.target.accession), false);
    const spoken = juxtapositionConversation(path);
    assert.equal(spoken.mode, 'CURATORIAL_JUXTAPOSITION');
    assert.notEqual(spoken.mode, 'CURATED_EDGE_SCENE');
    assert.equal(spoken.relationshipType, 'curatorial_juxtaposition');
    assert.equal(spoken.historicalRelationshipEstablished, false);
    assert.equal(spoken.turns.length, 3);
    if(path.aiAssisted){
      assert.ok(path.source.researchOnly||path.source.source==='presentation');
      assert.equal(path.sourceUrl,path.source.researchOnly?CHECKLIST:null);
      assert.equal(path.target.source,'presentation');
      assert.equal(spoken.aiAssisted,true);
      assert.deepEqual(spoken.turns.map(t=>t.role),['objectA','objectB','objectA']);
      assert.ok(spoken.turns.every(t=>t.kind==='AI_ASSISTED_INTERPRETATION'));
      continue;
    }
    assert.equal(spoken.turns[2].role, 'archivist');
    assert.equal(spoken.turns[2].text, path.turns[2].text);
    assert.match(spoken.turns[2].text, /published checklist/i);
    assert.match(spoken.turns[2].text, /does not/);
    assert.match(spoken.proposal, /not a catalog match or a documented meeting/);
    assert.equal(spoken.evidence.length, 0);
  }
  const lines = CURATORIAL_PATHS.map(path => path.turns[2].text);
  assert.equal(new Set(lines).size, 11);
  assert.throws(() => conversationFor({ accession: '83.2.19', title: 'Futurama' }, { accession: 'XC2024.03.1.1', title: 'Harlem' }, { reasons: [] }, 'family'));
});

test('the public allowlist still rejects the staff matrix and the saved Lakehouse capture', () => {
  assert.equal(PUBLIC_FILES.includes('src/matrix-objects.mjs'), false);
  assert.equal(PUBLIC_FILES.includes('data/lakehouse/project-matches.json'), false);
  assert.ok(FORBIDDEN_OUTPUT.includes('src/matrix-objects.mjs'));
  assert.ok(FORBIDDEN_OUTPUT.includes('data/lakehouse/project-matches.json'));
  assert.ok(PUBLIC_FILES.includes('src/worlds-fairs-research.mjs'));
  assert.ok(PUBLIC_FILES.includes('src/curatorial-relationships.mjs'));
  assert.equal(PUBLIC_FILES.includes('data/research/worlds-fairs-critical-records-20261117.json'), false);
});
