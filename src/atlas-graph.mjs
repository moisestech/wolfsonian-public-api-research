/** Relationship layers for the Spatial Atlas. IDs are stable; labels are display-only. */

export const BOX_EMPTY_MESSAGE =
  'Box identifiers exist in Lakehouse; this public view has no authorized mapping loaded.';

export const PUBLIC_ANCHORS = Object.freeze([
  { id: 'WOLF-002', accession: 'XX1990.1484', additionalAccessions: [], title: 'Radio, Sparton, model 558-C', sourceState: 'VERIFIED PUBLIC PACKET' },
  { id: 'WOLF-001', accession: '86.17.1', additionalAccessions: [], title: 'Trylon and Perisphere promotional model', sourceState: 'VERIFIED PUBLIC PACKET' },
  { id: 'WOLF-003', accession: 'XM1999.108.8', additionalAccessions: [], title: 'Machine Age Exposition catalogue', sourceState: 'VERIFIED PUBLIC PACKET' },
  { id: 'WOLF-004', accession: '85.7.383a,b', additionalAccessions: [], title: 'Mappemonde vase with lid', sourceState: 'VERIFIED PUBLIC PACKET' },
  { id: 'WOLF-005', accession: '85.4.72', additionalAccessions: [], title: "World's Fair poster", sourceState: 'VERIFIED PUBLIC PACKET' },
  { id: 'WOLF-006', accession: '86.19.57', additionalAccessions: [], title: 'World of Tomorrow program', sourceState: 'VERIFIED PUBLIC PACKET' },
]);

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();

export function syntheticFixture() {
  return {
    objects: [
      { id: 'obj-a', accession: 'SYN-A', additionalAccessions: ['SYN-A-ALT'], title: 'Synthetic radio', sourceState: 'SYNTHETIC DEMO' },
      { id: 'obj-b', accession: 'SYN-B', additionalAccessions: [], title: 'Synthetic catalogue', sourceState: 'SYNTHETIC DEMO' },
      { id: 'obj-c', accession: 'SYN-C', additionalAccessions: ['SYN-A'], title: 'Synthetic vase', sourceState: 'SYNTHETIC DEMO' },
    ],
    authorizedBoxMappings: [],
    syntheticBoxes: [{ boxId: 'DEMO-BOX-A', objectIds: ['obj-a', 'obj-b'] }],
    themes: [{ namespace: 'matrix_theme', label: 'Technology', objectIds: ['obj-a', 'obj-c'] }],
    interpretations: [{ id: 'interp-1', source: 'obj-a', target: 'obj-c', question: 'Does the silhouette promise progress?' }],
  };
}

function accessionNodeId(value) {
  return 'accession:' + clean(value);
}

export function buildAtlasGraph(input, { useSyntheticBoxes = false } = {}) {
  const objects = input.objects.map(object => ({
    ...object,
    additionalAccessions: (object.additionalAccessions || []).map(clean).filter(Boolean),
    accession: clean(object.accession),
  }));
  const byAccession = new Map();
  for (const object of objects) {
    const list = byAccession.get(object.accession) || [];
    list.push(object.id);
    byAccession.set(object.accession, list);
  }
  const nodes = [];
  const relationships = [];
  for (const object of objects) {
    nodes.push({
      id: object.id,
      kind: 'object',
      label: object.title,
      accession: object.accession,
      sourceState: object.sourceState,
    });
    const ambiguous = (byAccession.get(object.accession) || []).length > 1;
    nodes.push({
      id: accessionNodeId(object.accession),
      kind: 'accession',
      rawValue: object.accession,
      scope: 'primary',
      validationState: ambiguous ? 'AMBIGUOUS' : 'EXACT',
    });
    relationships.push({
      id: object.id + '::primary::' + object.accession,
      source: object.id,
      target: accessionNodeId(object.accession),
      type: 'primary_accession',
      layer: 'accession',
      basis: ambiguous ? 'Exact accession string shared by competing records' : 'Primary accession on this record',
      validationState: ambiguous ? 'AMBIGUOUS' : 'EXACT',
      permissionState: object.sourceState,
      historicalRelationshipEstablished: false,
    });
    for (const extra of object.additionalAccessions) {
      const collides = (byAccession.get(extra) || []).some(id => id !== object.id);
      nodes.push({
        id: accessionNodeId(extra),
        kind: 'accession',
        rawValue: extra,
        scope: 'additional',
        validationState: collides ? 'AMBIGUOUS' : 'EXACT',
      });
      relationships.push({
        id: object.id + '::additional::' + extra,
        source: object.id,
        target: accessionNodeId(extra),
        type: 'additional_accession',
        layer: 'accession',
        basis: collides ? 'Additional accession collides with another record primary accession' : 'Additional accession listed on this record',
        validationState: collides ? 'AMBIGUOUS' : 'EXACT',
        permissionState: object.sourceState,
        historicalRelationshipEstablished: false,
      });
    }
  }
  const authorized = input.authorizedBoxMappings || [];
  let boxNotice = null;
  if (authorized.length) {
    for (const mapping of authorized) {
      const boxId = 'box:' + clean(mapping.boxId);
      nodes.push({ id: boxId, kind: 'box', displayValue: mapping.boxId, disclosure: 'approved' });
      for (const objectId of mapping.objectIds) {
        relationships.push({
          id: objectId + '::box::' + mapping.boxId,
          source: objectId,
          target: boxId,
          type: 'verified_box_membership',
          layer: 'box',
          basis: 'Physical grouping, not historical causation',
          validationState: 'VERIFIED',
          permissionState: 'approved',
          historicalRelationshipEstablished: false,
        });
      }
    }
  } else if (useSyntheticBoxes && input.syntheticBoxes?.length) {
    boxNotice = 'SIMULATED box fixture. Not a museum storage record.';
    for (const mapping of input.syntheticBoxes) {
      const boxId = 'box:' + clean(mapping.boxId);
      nodes.push({ id: boxId, kind: 'box', displayValue: mapping.boxId, disclosure: 'synthetic' });
      for (const objectId of mapping.objectIds) {
        relationships.push({
          id: objectId + '::box::' + mapping.boxId,
          source: objectId,
          target: boxId,
          type: 'verified_box_membership',
          layer: 'box',
          basis: 'SIMULATED physical grouping for demonstration only',
          validationState: 'SYNTHETIC DEMO',
          permissionState: 'synthetic',
          historicalRelationshipEstablished: false,
        });
      }
    }
  } else {
    boxNotice = BOX_EMPTY_MESSAGE;
  }
  for (const theme of input.themes || []) {
    const tagId = 'tag:' + theme.namespace + ':' + clean(theme.label).toLowerCase();
    nodes.push({ id: tagId, kind: 'tag', label: theme.label, namespace: theme.namespace });
    for (const objectId of theme.objectIds) {
      relationships.push({
        id: objectId + '::tag::' + tagId,
        source: objectId,
        target: tagId,
        type: 'shared_metadata',
        layer: 'theme',
        basis: 'Shared ' + theme.namespace + ' label',
        validationState: 'SHARED_METADATA',
        permissionState: 'curatorial',
        historicalRelationshipEstablished: false,
      });
    }
  }
  for (const link of input.interpretations || []) {
    relationships.push({
      id: link.id,
      source: link.source,
      target: link.target,
      type: 'curatorial_interpretation',
      layer: 'interpretation',
      basis: link.question,
      question: link.question,
      validationState: 'INTERPRETATION',
      permissionState: 'artist-authored',
      historicalRelationshipEstablished: false,
    });
  }
  const dedupedNodes = [...new Map(nodes.map(node => [node.id, node])).values()];
  return { nodes: dedupedNodes, relationships, boxNotice };
}

export function applyLayers(graph, layers) {
  const active = {
    accession: layers.accession !== false,
    box: layers.box === true,
    theme: layers.theme === true,
    interpretation: layers.interpretation === true,
    conversation: layers.conversation === true,
  };
  const relationships = graph.relationships.filter(edge => active[edge.layer]);
  const used = new Set(relationships.flatMap(edge => [edge.source, edge.target]));
  const nodes = [
    ...graph.nodes.filter(node => node.kind === 'object'),
    ...graph.nodes.filter(node => node.kind !== 'object' && used.has(node.id)),
  ];
  const boxEdges = relationships.filter(edge => edge.layer === 'box');
  return {
    nodes,
    relationships,
    boxNotice: active.box ? (boxEdges.length ? graph.boxNotice : graph.boxNotice || BOX_EMPTY_MESSAGE) : null,
    hidden: graph.relationships.filter(edge => !active[edge.layer]).map(edge => edge.id),
  };
}

export function recordsToAtlasInput(records) {
  return {
    objects: records.map(record => ({
      id: 'object:' + record.accession,
      accession: record.accession,
      additionalAccessions: record.additionalAccessions || [],
      title: record.title,
      sourceState: record.source === 'invented' ? 'SYNTHETIC DEMO' : record.source === 'local-csv' ? 'STAFF MATRIX CANDIDATE' : 'VERIFIED PUBLIC PACKET',
    })),
    authorizedBoxMappings: [],
    syntheticBoxes: records.length >= 2 ? [{ boxId: 'DEMO-BOX-A', objectIds: ['object:' + records[0].accession, 'object:' + records[1].accession] }] : [],
    themes: [],
    interpretations: [],
  };
}

export function findByAccession(records, accession) {
  const wanted = clean(accession);
  if (!wanted) return { status: 'NOT_VERIFIED', record: null };
  const matches = records.filter(record => clean(record.accession) === wanted || (record.additionalAccessions || []).some(value => clean(value) === wanted));
  if (!matches.length) return { status: 'NOT_VERIFIED', record: null };
  if (matches.length > 1) return { status: 'AMBIGUOUS', record: null, matches };
  return { status: 'EXACT', record: matches[0] };
}
