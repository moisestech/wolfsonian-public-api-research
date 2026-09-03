#!/usr/bin/env node
/**
 * Compile featured public objects (+ demo overlays) into demo/data packets
 * and copy simulation + object-request artifacts for static Pages serving.
 */
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function main() {
  const seedsDir = join(root, 'data', 'public', 'objects');
  const overlayDir = join(root, 'data', 'research', 'demo-overlays');
  const manifest = await readJson(join(root, 'data', 'research', 'simulations', 'sim-001', 'manifest.json'));
  const featured = new Set(manifest.seedIds);
  const outObjects = join(root, 'demo', 'data', 'objects');
  await mkdir(outObjects, { recursive: true });

  // Clear old compiled objects
  for (const name of await readdir(outObjects)) {
    if (name.endsWith('.json')) {
      await writeFile(join(outObjects, name), ''); // placeholder; replace below
    }
  }

  const seedFiles = (await readdir(seedsDir))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .filter((name) => featured.has(name.replace(/\.json$/, '')));

  const objectIds = [];

  for (const [index, file] of seedFiles.entries()) {
    const seed = await readJson(join(seedsDir, file));
    let agents = null;
    try {
      const overlay = await readJson(join(overlayDir, `${seed.id}.json`));
      agents = overlay.agents;
    } catch {
      agents = null;
    }

    const outName = `${String(index + 1).padStart(2, '0')}-${seed.slug || seed.id.toLowerCase()}.json`;
    const packetId = outName.replace(/\.json$/, '');
    objectIds.push(packetId);

    const packet = {
      id: packetId,
      seedId: seed.id,
      trialLabel: `Record ${String(index + 1).padStart(2, '0')}`,
      representation: seed.representation || {
        type: 'original-svg',
        src: '../assets/objects/generic-record.svg',
        caption: 'Original diagrammatic record mark'
      },
      source: {
        institution: seed.institution,
        title: seed.title,
        accessionNumber: seed.accessionNumber,
        bibId: seed.bibId ?? null,
        date: seed.date,
        creator: Array.isArray(seed.creator) ? seed.creator.join('; ') : seed.creator,
        materials: Array.isArray(seed.materials) ? seed.materials.join(', ') : seed.materials,
        dimensions: seed.dimensions ?? null,
        collection: seed.collection ?? null,
        publicRecordUrl: seed.source_urls?.[0] || null,
        preparation: seed.preparation,
        citedAt: seed.retrieved_at,
        missingFields: seed.missing_fields || []
      },
      archivalActor: {
        knows: seed.archival_knows || [],
        doesNotKnow: seed.archival_does_not_know || seed.missing_fields || []
      },
      agents: agents || {}
    };

    await writeFile(join(outObjects, outName), `${JSON.stringify(packet, null, 2)}\n`, 'utf8');
  }

  // Remove non-featured compiled leftovers
  for (const name of await readdir(outObjects)) {
    if (name.endsWith('.json') && !objectIds.includes(name.replace(/\.json$/, ''))) {
      const { unlink } = await import('node:fs/promises');
      await unlink(join(outObjects, name));
    }
  }

  const simSrc = join(root, 'data', 'research', 'simulations', 'sim-001');
  const simDest = join(root, 'demo', 'data', 'simulations', 'sim-001');
  await mkdir(join(simDest, 'rounds'), { recursive: true });
  await cp(join(simSrc, 'manifest.json'), join(simDest, 'manifest.json'));
  const rounds = (await readdir(join(simSrc, 'rounds'))).filter((name) => name.endsWith('.json'));
  for (const round of rounds) {
    await cp(join(simSrc, 'rounds', round), join(simDest, 'rounds', round));
  }

  const candidatesSrc = join(root, 'data', 'research', 'object-request-candidates', 'sim-001.json');
  const candidatesDest = join(root, 'demo', 'data', 'object-request-candidates');
  await mkdir(candidatesDest, { recursive: true });
  try {
    await cp(candidatesSrc, join(candidatesDest, 'sim-001.json'));
  } catch {
    // optional until Phase 4
  }

  const trial = {
    id: 'research-demo-001',
    title: 'The Archive Dreams in Public',
    subtitle: 'Institutional Memory Simulation 001',
    tagline: 'A research instrument for observing how competing interpretations emerge from public archival records.',
    disclaimer:
      'Independent prototype. Not an official Wolfsonian application, production system, or museum-authored dataset. Not a calibrated agent-based model and not a prediction engine.',
    dataNote:
      'Public-record packets manually prepared from Wolfsonian sources while automated API connectivity remains under investigation. Source packets and interpretation layers are stored separately.',
    representationNote: 'Object figures are original diagrammatic forms, not collection photography.',
    objects: objectIds,
    agents: [
      { id: 'archivist', label: 'Archivist' },
      { id: 'worker', label: 'Worker' },
      { id: 'futurist', label: 'Futurist' },
      { id: 'mourner', label: 'Mourner' },
      { id: 'propagandist', label: 'Propagandist' },
      { id: 'counterfeit', label: 'Counterfeit' },
      { id: 'museum', label: 'The Museum' }
    ]
  };
  await writeFile(join(root, 'demo', 'data', 'trial-001.json'), `${JSON.stringify(trial, null, 2)}\n`, 'utf8');
  console.log(`Compiled ${objectIds.length} featured demo packets and copied simulation artifacts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
