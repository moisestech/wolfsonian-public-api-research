import test from 'node:test';
import assert from 'node:assert/strict';
import { MATRIX_OBJECTS, LAYERS, ZOOM_STOPS, layoutRoom, linksFor, conversationFor, objectConversation, zoomScale, detailFor, districtsOverlap, valuesOf, matrixToRecords } from '../src/matrix-room.mjs';
import { societyView } from '../src/archive-society.mjs';
import { OPENING_ACCESSION } from '../src/presentation-pairs.mjs';

test('matrix room keeps staff tags and drops photographs', () => {
  assert.equal(MATRIX_OBJECTS.length, 300);
  assert.equal(MATRIX_OBJECTS[0].accession, '2009.5.1');
  assert.deepEqual(valuesOf(MATRIX_OBJECTS[0], 'theme'), ['Advertising', 'Domestic life', 'Trade / Commerce']);
  assert.equal(JSON.stringify(MATRIX_OBJECTS).includes('.tif'), false);
});

test('one active column produces colored districts without overlap', () => {
  for (const layer of LAYERS) {
    const room = layoutRoom(MATRIX_OBJECTS, layer.id);
    assert.equal(room.nodes.length, 300);
    assert.equal(districtsOverlap(room.districts), null);
    assert.ok(room.districts.every(d => d.color.startsWith('hsl(')));
  }
  const themes = layoutRoom(MATRIX_OBJECTS, 'theme');
  assert.ok(themes.districts.some(d => d.label === 'Advertising' && d.count > 10));
  const sample = themes.nodes.find(n => n.accession === '2009.5.1');
  const links = linksFor(sample, themes);
  assert.deepEqual(links.map(link => link.concept), ['Advertising', 'Domestic life', 'Trade / Commerce']);
  assert.equal(new Set(links.map(link => link.color)).size, 3);
});

test('a revealed conversation is a colored thread, not an essay', () => {
  const room = layoutRoom(MATRIX_OBJECTS, 'motif');
  const node = room.nodes.find(n => n.accession === '2009.5.1');
  const threads = conversationFor({ accession: node.accession, concepts: node.values }, 'motif');
  assert.ok(threads.length >= 1 && threads.length <= 3);
  for (const thread of threads) {
    assert.equal(thread.turns.length, 3);
    assert.equal(new Set(thread.turns.map(turn => turn.color)).size, 3);
    assert.match(thread.turns.at(-1).text, /Not a documented meeting/);
    assert.ok(thread.turns.every(turn => turn.text.length < 140));
  }
});

test('zoom stops sit between the world view and a single object', () => {
  const fit = 0.12;
  const scales = ZOOM_STOPS.map(stop => zoomScale(stop.t, fit));
  assert.deepEqual(scales.map((scale, i) => detailFor(scale, fit)), ['world', 'region', 'street', 'object']);
  assert.ok(scales[1] > scales[0] && scales[2] > scales[1] && scales[3] > scales[2]);
});

test('a clicked matrix object speaks with its strongest shared-tag neighbor', () => {
  const talk = objectConversation(MATRIX_OBJECTS, '2009.5.1');
  assert.deepEqual(talk.turns.map(turn=>turn.role), ['objectA','objectB','objectA','archivist','objectB']);
  assert.equal(talk.historicalRelationshipEstablished, false);
  assert.match(talk.turns[3].text, /cannot establish|does not establish|not a documented|not evidence/);
  assert.notEqual(talk.target, '2009.5.1');
  assert.match(talk.limits, /not a historical|cannot|alone|not proof|not evidence|not a complete|cannot establish|does not|never asserts|not a statement/i);
});

test('conversation mode still opens on On Munitions inside the photographed matrix', () => {
  const records = matrixToRecords(MATRIX_OBJECTS);
  const view = societyView(records, OPENING_ACCESSION, 'family');
  assert.equal(view.nodes[0].record.accession, OPENING_ACCESSION);
  assert.match(view.nodes[0].record.title, /On Munitions/);
  assert.ok(view.nodes.length <= 7);
  assert.ok(view.edges.length > 0);
  assert.ok(view.edges.every(edge => edge.historicalRelationshipEstablished === false));
  for (const layer of LAYERS) assert.ok(layoutRoom(MATRIX_OBJECTS, layer.id).districts.length > 1);
});
