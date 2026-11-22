import test from 'node:test';
import assert from 'node:assert/strict';
import { objectVoiceProfile, PERSPECTIVE_VOICES, perspectiveVoice, sceneVoiceBrief } from '../src/conversation-voices.mjs';
import { authoredPairs, auditConversationCoverage, candidateMetadataPairs, planConversationCoverage } from '../src/conversation-editorial.mjs';
import { CURATED_EDGE_SCENES } from '../src/curated-edge-scenes.mjs';
import { CURATORIAL_PATHS, juxtapositionConversation } from '../src/curatorial-relationships.mjs';
import { MATRIX_OBJECTS } from '../src/public-matrix-objects.mjs';
import { matrixToRecords } from '../src/matrix-room.mjs';
import { CARDS } from '../src/discovery-personas.mjs';
import { PUBLIC_FILES } from '../scripts/assemble-public-site.mjs';
const record = (accession, value = 'Machines') => ({ accession, title: 'Object ' + accession, tags: [{ family: 'motif', value, id: 'motif:' + value.toLowerCase() }] });

test('reverse order, repeated scripts and perspective variants cannot inflate pair counts', () => {
  const r = [record('A'), record('B'), record('C')];
  const audit = auditConversationCoverage(r, [{ a: 'A', b: 'B', id: 'one' }, { a: ' B ', b: 'A', id: 'reverse' }, { a: 'A', b: 'A', id: 'self' }]);
  assert.equal(audit.distinctAuthoredPairs, 1);
  assert.equal(audit.targetMet, false);
  assert.equal(audit.approvedPairs, 0);
  assert.deepEqual(audit.uncovered, ['C']);
});

test('the object count target and universal coverage are independent', () => {
  const r = ['A','B','C','D'].map(id => record(id));
  const audit = auditConversationCoverage(r, [{a:'A',b:'B'},{a:'B',b:'C'},{a:'C',b:'A'}]);
  assert.equal(audit.objectsWithScenes, 3);
  assert.equal(audit.distinctAuthoredPairs, 3);
  assert.equal(audit.targetMet, false);
  const plan = planConversationCoverage(r, [{a:'A',b:'B'},{a:'B',b:'C'},{a:'C',b:'A'}]);
  assert.ok(plan.proposedPairs.some(pair => pair.a === 'D' || pair.b === 'D'));
  assert.equal(plan.projected.objectsWithTwoNeighbors, 4);
  assert.equal(plan.initial.distinctAuthoredPairs, 3, 'planning cannot promote candidates');
});

test('an unmet source gate stays out of playable-script counts', () => {
  const audit = auditConversationCoverage([record('A'),record('B')], [{id:'wrong',a:'A',b:'B',requires:{family:'theme',value:'Labor'}}]);
  assert.equal(audit.registeredPairs, 1);
  assert.equal(audit.distinctAuthoredPairs, 0);
  assert.deepEqual(audit.unmetSourceGates, ['wrong']);
});

test('unlabeled metadata and an isolated object cannot become fabricated conversation coverage', () => {
  const r = [record('A','Unlabeled'),record('B','Unlabeled'),record('C','Trees')];
  assert.equal(candidateMetadataPairs(r).length, 0);
  const plan = planConversationCoverage(r);
  assert.equal(plan.proposedPairs.length, 0);
  assert.equal(plan.projected.targetMet, false);
  assert.equal(plan.projected.uncovered.length, 3);
  assert.throws(() => planConversationCoverage(r, [], {batchSize:0}));
});

test('all eleven perspectives have distinct purposes, rhythms and boundaries; open stays a search mode', () => {
  assert.equal(PERSPECTIVE_VOICES.length,11);
  assert.equal(perspectiveVoice('open'),null);
  assert.equal(new Set(PERSPECTIVE_VOICES.map(p=>p.example)).size,11);
  for(const card of CARDS) {
    assert.equal(card.voiceDirection.id,card.id);
    assert.match(card.prompt,/SPEAKING PURPOSE:/);
    assert.match(card.prompt,/VOICE LIMIT:/);
  }
  const radio=record('XX1990.1484');
  assert.deepEqual(sceneVoiceBrief(radio,record('B'),'worker').objects,sceneVoiceBrief(radio,record('B'),'tourist').objects);
  assert.notDeepEqual(sceneVoiceBrief(radio,record('B'),'worker').perspective,sceneVoiceBrief(radio,record('B'),'tourist').perspective);
});

test('new objects receive provisional briefs without an invented date, accent or period phrase', () => {
  const profile=objectVoiceProfile({accession:'NEW',title:'1939 A.D',objectType:'Poster'});
  assert.equal(profile.status,'RECORD_BRIEF_AWAITING_AUTHORSHIP');
  assert.equal(profile.sourceContext.date,'');
  assert.deepEqual(profile.periodPhrases,[]);
  assert.equal(profile.example,'');
  assert.equal(profile.historicalSpeechEstablished,false);
  assert.equal(objectVoiceProfile({accession:' XX1990.1484 '}).status,'AUTHORED_DIRECTION_DRAFT');
});

test('public preview has 36 eligible pairs across 30 objects, with no invented approval', () => {
  const objects=new Map(matrixToRecords(MATRIX_OBJECTS).map(r=>[r.accession,r]));
  for(const path of CURATORIAL_PATHS) for(const r of [path.source,path.target]) if(!objects.has(r.accession))objects.set(r.accession,r);
  const coverage=auditConversationCoverage([...objects.values()],authoredPairs(CURATED_EDGE_SCENES,CURATORIAL_PATHS));
  assert.equal(coverage.objects,30);
  assert.equal(coverage.registeredPairs,39);
  assert.equal(coverage.distinctAuthoredPairs,36);
  assert.equal(coverage.objectsWithScenes,30);
  assert.equal(coverage.approvedPairs,0);
  assert.equal(coverage.unmetSourceGates.length,3);
});

test('eight revisions preserve distinct identities and expose a voice brief without publishing the working roster', () => {
  assert.ok(CURATED_EDGE_SCENES.filter(s=>s.languageRevision).length>=4);
  const paths=CURATORIAL_PATHS.filter(p=>p.languageRevision);
  assert.ok(paths.length>=4);
  for(const path of paths){
    const c=juxtapositionConversation(path);
    assert.equal(c.voiceBrief.objects[0].accession,path.source.accession);
    assert.equal(c.voiceBrief.objects[1].accession,path.target.accession);
    assert.equal(c.historicalRelationshipEstablished,false);
    assert.ok(c.turns.length>=3 && c.turns.length<=9);
    assert.ok(c.turns.every(t=>t.text.length>10));
  }
  for(const module of ['src/conversation-voices.mjs','src/object-voice-directions.mjs'])assert.ok(PUBLIC_FILES.includes(module));
  assert.ok(!PUBLIC_FILES.includes('src/conversation-editorial.mjs'));
  assert.ok(!PUBLIC_FILES.includes('src/matrix-objects.mjs'));
});
