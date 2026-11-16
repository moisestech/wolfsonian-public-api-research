import test from 'node:test';
import assert from 'node:assert/strict';
import { makeForceAtlasGraph, ARTIST_QUESTIONS } from '../src/force-atlas-data.mjs';
import { PUBLIC_ANCHORS } from '../src/atlas-graph.mjs';

test('six permitted public-packet anchors and labeled authored questions, never fictional museum claims', () => {
  const view = makeForceAtlasGraph();
  assert.equal(view.stats.objects, 6);
  assert.equal(view.stats.identities, 6);
  assert.equal(view.stats.questions, 4);
  assert.equal(view.stats.boxes, 0);
  assert.equal(view.links.length, 10);
  assert.ok(view.links.every(e => e.historicalRelationshipEstablished === false));
  assert.ok(view.links.filter(e => e.layer === 'interpretation').every(e => e.question && e.validationState === 'INTERPRETATION'));
  assert.ok(view.nodes.some(n => n.accession === 'XX1990.1484' && n.kind === 'object'));
  assert.ok(view.nodes.some(n => n.accession === '85.7.383a,b'));
});
test('box toggle displays honest missing mapping and never creates a fake storage association', () => {
  const view = makeForceAtlasGraph({showBox:true,showAccession:false});
  assert.equal(view.stats.boxes,0);
  assert.equal(view.stats.identities,0);
  assert.match(view.boxNotice,/no authorized mapping/i);
  assert.ok(!view.nodes.some(n => n.kind === 'box'));
});
test('question and accession layers are independently switchable', () => {
  const questionOnly = makeForceAtlasGraph({showAccession:false,showQuestions:true});
  const accessionOnly = makeForceAtlasGraph({showAccession:true,showQuestions:false});
  assert.equal(questionOnly.stats.identities,0);
  assert.equal(questionOnly.stats.questions,4);
  assert.equal(accessionOnly.stats.identities,6);
  assert.equal(accessionOnly.stats.questions,0);
  assert.ok(!accessionOnly.nodes.some(n => n.kind === 'tag'));
});
test('source input remains unchanged after converting to renderer data', () => {
  const before = JSON.stringify(PUBLIC_ANCHORS), questions = JSON.stringify(ARTIST_QUESTIONS);
  const a = makeForceAtlasGraph();
  a.nodes[0].x = 999; a.links[0].source = {id:'mutated-by-force-engine'};
  assert.equal(JSON.stringify(PUBLIC_ANCHORS),before);
  assert.equal(JSON.stringify(ARTIST_QUESTIONS),questions);
});
test('small view budget, malformed records, and duplicate IDs are handled without inventing relationships', () => {
  const capped=makeForceAtlasGraph({maxObjects:2});
  assert.equal(capped.stats.objects,2);
  assert.ok(capped.links.every(e => e.layer === 'accession' || e.layer === 'interpretation'));
  assert.throws(()=>makeForceAtlasGraph({objects:[PUBLIC_ANCHORS[0],PUBLIC_ANCHORS[0]]}),/Duplicate/);
  assert.throws(()=>makeForceAtlasGraph({objects:null}),TypeError);
});
