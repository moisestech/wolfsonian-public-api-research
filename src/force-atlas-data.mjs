/**
 * Source-safe 3D renderer adapter. No API requests, museum images, or private matrix records.
 * Both the 2D and 3D surfaces can consume the same evidence-layer graph contract.
 */
import { PUBLIC_ANCHORS, buildAtlasGraph, applyLayers, BOX_EMPTY_MESSAGE } from './atlas-graph.mjs';

export const ARTIST_QUESTIONS = Object.freeze([
  { id: 'question:sparton-machine-age', source: 'WOLF-002', target: 'WOLF-003',
    question: 'What did industrial design promise the home, and which workers made that promise possible?' },
  { id: 'question:sparton-trylon', source: 'WOLF-002', target: 'WOLF-001',
    question: 'How did a domestic radio and a world-fair monument make technological optimism desirable?' },
  { id: 'question:trylon-poster', source: 'WOLF-001', target: 'WOLF-005',
    question: 'How did the future move between the fairground and its promotional images?' },
  { id: 'question:trylon-program', source: 'WOLF-001', target: 'WOLF-006',
    question: 'Whose vision of tomorrow is presented by the fair and its printed program?' }
]);
// These links are artist-authored QUESTIONS, never a documented object-to-object association.

const COLORS = Object.freeze({
  object: '#245d59',
  accession: '#718580',
  box: '#94684d',
  interpretation: '#ad6242',
  identity: '#91aaa2'
});
const clean = value => String(value ?? '').trim();

export function makeForceAtlasGraph({
  objects = PUBLIC_ANCHORS,
  questions = ARTIST_QUESTIONS,
  authorizedBoxMappings = [],
  selectedAccession = 'XX1990.1484',
  showAccession = true,
  showQuestions = true,
  showBox = false,
  maxObjects = 6
} = {}) {
  if (!Array.isArray(objects) || !Array.isArray(questions)) throw new TypeError('Expected object and question arrays.');
  const budget = Math.min(36, Math.max(1, Math.floor(Number(maxObjects) || 6)));
  const eligible = objects.filter(o => o && clean(o.id) && clean(o.accession) && clean(o.title))
    .slice(0, budget);
  const ids = new Set(eligible.map(o => o.id));
  if (ids.size !== eligible.length) throw new Error('Duplicate source object identifiers require review.');
  const safeQuestions = questions.filter(q => q && ids.has(q.source) && ids.has(q.target) && q.source !== q.target)
    .map(q => ({
      id: clean(q.id), source: q.source, target: q.target,
      question: clean(q.question)
    })).filter(q => q.id && q.question);
  // The graph module creates identity/box/interpretation edges and keeps source states.
  const graph = buildAtlasGraph({
    objects: eligible,
    interpretations: safeQuestions,
    authorizedBoxMappings: Array.isArray(authorizedBoxMappings) ? authorizedBoxMappings : [],
    themes: []
  }, { useSyntheticBoxes: false });
  const layered = applyLayers(graph, {
    accession: showAccession,
    box: showBox,
    interpretation: showQuestions,
    theme: false
  });
  const selected = eligible.find(o => o.accession === clean(selectedAccession)) || eligible[0];
  const selectedId = selected?.id ?? null;
  const nodes = layered.nodes.map((node, index) => {
    const primary = node.kind === 'object';
    const origin = eligible.find(o => o.id === node.id);
    const angle = (Math.PI * 2 * index) / Math.max(1, layered.nodes.length);
    return {
      id: node.id,
      kind: node.kind,
      label: node.label || node.rawValue || node.displayValue || node.id,
      accession: node.accession || node.rawValue || '',
      sourceState: origin?.sourceState || node.validationState || node.disclosure || 'UNVERIFIED',
      color: COLORS[node.kind] || COLORS.accession,
      val: primary ? (node.id === selectedId ? 7 : 5) : 1.1,
      x: Math.round(Math.cos(angle) * 55),
      y: Math.round(Math.sin(angle) * 38),
      z: Math.round(Math.sin(angle * 2) * 15),
      selected: node.id === selectedId
    };
  });
  const validIds = new Set(nodes.map(n => n.id));
  const links = layered.relationships.filter(edge => validIds.has(edge.source) && validIds.has(edge.target))
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      layer: edge.layer,
      type: edge.type,
      basis: edge.basis,
      question: edge.question || '',
      validationState: edge.validationState,
      historicalRelationshipEstablished: false,
      color: edge.layer === 'interpretation' ? COLORS.interpretation :
        edge.layer === 'box' ? COLORS.box : COLORS.identity
    }));
  return {
    nodes, links,
    selectedId,
    boxNotice: showBox ? (layered.boxNotice || BOX_EMPTY_MESSAGE) : null,
    status: 'PUBLIC PACKETS / ARTIST QUESTIONS — NOT LIVE LAKEHOUSE',
    stats: {
      objects: eligible.length,
      identities: links.filter(e => e.layer === 'accession').length,
      questions: links.filter(e => e.layer === 'interpretation').length,
      boxes: links.filter(e => e.layer === 'box').length
    }
  };
}
