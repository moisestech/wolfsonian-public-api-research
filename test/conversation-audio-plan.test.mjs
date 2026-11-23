import test from 'node:test';
import assert from 'node:assert/strict';
import { describeScene, planConversationAudio } from '../scripts/plan-conversation-audio.mjs';
import { CURATORIAL_PATHS, pathById, juxtapositionConversation } from '../src/curatorial-relationships.mjs';
import { conversationFor } from '../src/archive-society.mjs';
import { conversationEpisode } from '../src/conversation-orientation.mjs';
import { CURATED_EDGE_SCENES } from '../src/curated-edge-scenes.mjs';

const rows = await planConversationAudio();
const get = id => rows.find(row => row.sceneId === id);

function displayedPlan(conversation, source, target) {
  const accession = { objectA: source.accession, objectB: target.accession, archivist: 'archivist' };
  const episode = conversationEpisode({ source, target, conversation });
  return describeScene({
    id: conversation.sceneId || conversation.id,
    hosts: [source.accession, target.accession],
    turns: episode.turns.map(turn => ({ speakerAccession: accession[turn.role], text: turn.text })),
  }, new Map());
}

test('every planned performance identifies the script displayed by its live room builder', () => {
  const displayed = CURATORIAL_PATHS.map(path =>
    displayedPlan(juxtapositionConversation(path), path.source, path.target));
  for (const scene of CURATED_EDGE_SCENES) {
    const [source, target] = scene.pair.map(accession => ({ accession, title: accession }));
    const edge = { id: scene.id, reasons: [scene.requires] };
    displayed.push(displayedPlan(conversationFor(source, target, edge), source, target));
  }
  assert.equal(displayed.length, rows.length);
  for (const room of displayed) assert.equal(room.scriptRevision, get(room.sceneId).scriptRevision, room.sceneId);
});

test('a path uses its authored ID and exact displayed turns while its lab study has a separate ID', () => {
  const path = pathById('program-and-booklet');
  const planned = get(path.id);
  const displayed = displayedPlan(juxtapositionConversation(path), path.source, path.target);
  assert.equal(planned.labExperiment, '02-promise-souvenir');
  assert.equal(planned.sceneId, 'program-and-booklet');
  assert.equal(planned.scriptRevision, displayed.scriptRevision);
  assert.deepEqual(planned.turns, displayed.turns);
  assert.deepEqual(planned.hosts.map(h => h.accession), ['86.19.57', 'XB1992.1640']);
  assert.equal(planned.editions.notebooklm.sourceStatus, 'source-locators-present');
});

test('lens and edge direction alter room roles without recasting an object or changing the recording key', () => {
  const scene = CURATED_EDGE_SCENES.find(s => s.id === 'machines-engine-safety');
  const [a, b] = scene.pair.map(accession => ({ accession, title: accession }));
  const edge = { id: 'room-edge', reasons: [scene.requires] };
  const forward = displayedPlan(conversationFor(a, b, edge, 'family'), a, b);
  const reverse = displayedPlan(conversationFor(b, a, edge, 'worker'), b, a);
  assert.equal(forward.scriptRevision, get(scene.id).scriptRevision);
  assert.equal(reverse.scriptRevision, forward.scriptRevision);
  assert.deepEqual(reverse.turns, forward.turns);
  assert.equal(get(scene.id).editions.notebooklm.sourceStatus, 'source-hold');
});

test('a change of words, speaker or turn order invalidates the performed take even for the same pair', () => {
  const path = pathById('program-and-booklet');
  const scene = { id: path.id, hosts: [path.source.accession, path.target.accession], turns: path.turns };
  const revision = turns => describeScene({ ...scene, turns }, new Map()).scriptRevision;
  const [first, ...rest] = scene.turns;
  const baseline = revision(scene.turns);
  assert.notEqual(revision([{ ...first, text: first.text + '?' }, ...rest]), baseline);
  assert.notEqual(revision([{ ...first, speakerAccession: scene.hosts[1] }, ...rest]), baseline);
  assert.notEqual(revision([...rest, first]), baseline);
});

test('the compound accession stays whole and an open research prompt cannot enter the recording plan', () => {
  const globe = get('globe-and-theme-center');
  assert.ok(globe.turns.some(turn => turn.speaker === 'object:85.7.383a,b'));
  const source = { accession: 'A', title: 'Object A' };
  const target = { accession: 'B', title: 'Object B' };
  const prompt = conversationFor(source, target, { id: 'open-prompt', reasons: [{ family: 'theme', value: 'Work' }] });
  assert.throws(() => displayedPlan(prompt, source, target), /authored transcript/);
  const unexpected = { id: 'wrong-speaker', hosts: ['A', 'B'], turns: [{ speakerAccession: 'C', text: 'Hello' }] };
  assert.throws(() => describeScene(unexpected, new Map()), /Unknown scripted speaker/);
});
