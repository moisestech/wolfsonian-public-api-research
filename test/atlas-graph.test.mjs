import test from 'node:test';
import assert from 'node:assert/strict';
import { applyLayers, buildAtlasGraph, findByAccession, syntheticFixture, BOX_EMPTY_MESSAGE, PUBLIC_ANCHORS } from '../src/atlas-graph.mjs';

test('accession and box toggles change edge counts independently', () => {
  const graph = buildAtlasGraph(syntheticFixture(), { useSyntheticBoxes: true });
  const all = applyLayers(graph, { accession: true, box: true, theme: true, interpretation: true });
  const accessionOnly = applyLayers(graph, { accession: true, box: false, theme: false, interpretation: false });
  const boxOnly = applyLayers(graph, { accession: false, box: true, theme: false, interpretation: false });
  const themeOnly = applyLayers(graph, { accession: false, box: false, theme: true, interpretation: false });
  assert.equal(accessionOnly.relationships.filter(edge => edge.layer === 'accession').length, 5);
  assert.equal(boxOnly.relationships.filter(edge => edge.layer === 'box').length, 2);
  assert.equal(themeOnly.relationships.filter(edge => edge.layer === 'theme').length, 2);
  assert.ok(all.relationships.length > accessionOnly.relationships.length);
  assert.ok(all.relationships.every(edge => edge.historicalRelationshipEstablished === false));
  assert.equal(boxOnly.relationships.every(edge => edge.validationState === 'SYNTHETIC DEMO'), true);
});

test('public anchors draw no box edges and say the mapping is absent', () => {
  const graph = buildAtlasGraph({ objects: PUBLIC_ANCHORS, authorizedBoxMappings: [] });
  const view = applyLayers(graph, { accession: true, box: true });
  assert.equal(view.relationships.some(edge => edge.layer === 'box'), false);
  assert.equal(view.boxNotice, BOX_EMPTY_MESSAGE);
  assert.equal(view.relationships.filter(edge => edge.type === 'primary_accession').length, PUBLIC_ANCHORS.length);
});

test('shared accession strings are ambiguous, not equivalent objects', () => {
  const graph = buildAtlasGraph(syntheticFixture());
  const shared = graph.relationships.filter(edge => edge.validationState === 'AMBIGUOUS');
  assert.ok(shared.length >= 1);
  assert.equal(graph.relationships.some(edge => edge.type === 'additional_accession' && edge.source === 'obj-c' && edge.target === 'accession:SYN-A' && edge.validationState === 'AMBIGUOUS'), true);
  assert.equal(graph.relationships.some(edge => edge.source === 'obj-a' && edge.target === 'obj-c' && edge.layer === 'accession'), false);
});

test('unknown accessions stay unverified', () => {
  assert.equal(findByAccession(PUBLIC_ANCHORS, 'XX1990.1484').status, 'EXACT');
  assert.equal(findByAccession(PUBLIC_ANCHORS, '1990').status, 'NOT_VERIFIED');
  assert.equal(findByAccession(PUBLIC_ANCHORS, 'NOT-A-REAL-ID').record, null);
});
