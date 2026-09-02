#!/usr/bin/env node
/**
 * Deterministic institutional-memory graph builder.
 * No LLM. Reads research-seeds + interpretations → demo/data/graph.json
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedsDir = join(root, 'data', 'research-seeds');
const interpDir = join(root, 'data', 'interpretations');
const outPath = join(root, 'demo', 'data', 'graph.json');

function slug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entity';
}

function addNode(map, id, node) {
  const existing = map.get(id);
  if (!existing) {
    map.set(id, node);
    return id;
  }
  // Prefer authoritative record nodes over concept stubs created by early relationships.
  if (existing.kind !== 'record' && node.kind === 'record') {
    map.set(id, node);
  }
  return id;
}

function addEdge(edges, edge) {
  const key = `${edge.source}|${edge.type}|${edge.target}|${edge.layer}`;
  if (!edges.has(key)) edges.set(key, { id: `e-${edges.size + 1}`, ...edge });
}

async function main() {
  const seedFiles = (await readdir(seedsDir)).filter((name) => name.endsWith('.json')).sort();
  if (seedFiles.length === 0) throw new Error('No research seeds found');

  const nodes = new Map();
  const edges = new Map();

  for (const file of seedFiles) {
    const seed = JSON.parse(await readFile(join(seedsDir, file), 'utf8'));
    const recordId = `record:${seed.id}`;
    addNode(nodes, recordId, {
      id: recordId,
      kind: 'record',
      label: seed.title,
      seedId: seed.id,
      accessionNumber: seed.accessionNumber,
      date: seed.date,
      cluster: seed.cluster || null
    });

    for (const creator of seed.creator || []) {
      const personId = `person:${slug(creator)}`;
      addNode(nodes, personId, { id: personId, kind: 'person', label: creator });
      addEdge(edges, {
        source: personId,
        target: recordId,
        type: 'created',
        layer: 'source',
        label: 'creator'
      });
    }

    for (const material of seed.materials || []) {
      const materialId = `concept:material-${slug(material)}`;
      addNode(nodes, materialId, { id: materialId, kind: 'concept', label: material, facet: 'material' });
      addEdge(edges, {
        source: recordId,
        target: materialId,
        type: 'made_of',
        layer: 'source',
        label: 'material'
      });
    }

    for (const subject of seed.subjects || []) {
      const subjectId = `concept:${slug(subject)}`;
      addNode(nodes, subjectId, { id: subjectId, kind: 'concept', label: subject, facet: 'subject' });
      addEdge(edges, {
        source: recordId,
        target: subjectId,
        type: 'indexed_as',
        layer: 'source',
        label: 'subject'
      });
    }

    if (seed.date) {
      const year = String(seed.date).match(/\d{4}/)?.[0];
      if (year) {
        const yearId = `concept:year-${year}`;
        addNode(nodes, yearId, { id: yearId, kind: 'concept', label: year, facet: 'temporal' });
        addEdge(edges, {
          source: recordId,
          target: yearId,
          type: 'dated',
          layer: 'source',
          label: 'date'
        });
      }
    }

    const interpPath = join(interpDir, `${seed.id}.json`);
    let interp = null;
    try {
      interp = JSON.parse(await readFile(interpPath, 'utf8'));
    } catch {
      interp = null;
    }
    if (!interp) continue;

    for (const entity of interp.entities || []) {
      const entityId = `${entity.kind || 'concept'}:${slug(entity.label)}`;
      addNode(nodes, entityId, {
        id: entityId,
        kind: entity.kind || 'concept',
        label: entity.label,
        facet: entity.facet || 'interpreted'
      });
      addEdge(edges, {
        source: recordId,
        target: entityId,
        type: entity.relation || 'associated_with',
        layer: 'interpreted',
        label: entity.relation || 'associated_with'
      });
    }

    for (const rel of interp.relationships || []) {
      const fromId = rel.from.startsWith('record:') ? rel.from : `concept:${slug(rel.from)}`;
      const toId = rel.to.startsWith('record:') ? rel.to : `concept:${slug(rel.to)}`;
      if (!nodes.has(fromId)) {
        addNode(nodes, fromId, { id: fromId, kind: 'concept', label: rel.from.replace(/^record:/, ''), facet: 'interpreted' });
      }
      if (!nodes.has(toId)) {
        addNode(nodes, toId, { id: toId, kind: 'concept', label: rel.to.replace(/^record:/, ''), facet: 'interpreted' });
      }
      addEdge(edges, {
        source: fromId,
        target: toId,
        type: rel.type || 'related_to',
        layer: 'interpreted',
        label: rel.type || 'related_to',
        via: seed.id
      });
    }

    for (const pressure of interp.possible_pressures || []) {
      const pressureId = `concept:pressure-${slug(pressure)}`;
      addNode(nodes, pressureId, {
        id: pressureId,
        kind: 'concept',
        label: pressure,
        facet: 'pressure'
      });
      addEdge(edges, {
        source: recordId,
        target: pressureId,
        type: 'pressured_by',
        layer: 'interpreted',
        label: 'pressure'
      });
    }
  }

  const graph = {
    generatedAt: new Date().toISOString(),
    generator: 'scripts/build-institutional-graph.mjs',
    capacityNote: 'Schema supports up to 30 research seeds; current corpus may be smaller.',
    counts: {
      records: [...nodes.values()].filter((node) => node.kind === 'record').length,
      nodes: nodes.size,
      edges: edges.size,
      sourceEdges: [...edges.values()].filter((edge) => edge.layer === 'source').length,
      interpretedEdges: [...edges.values()].filter((edge) => edge.layer === 'interpreted').length
    },
    nodes: [...nodes.values()],
    edges: [...edges.values()]
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath} (${graph.counts.records} records, ${graph.counts.nodes} nodes, ${graph.counts.edges} edges)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
