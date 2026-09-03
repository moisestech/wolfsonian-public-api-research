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
        establishedInPublicPacket: seed.established_in_public_packet || [],
        notEstablishedInPublicPacket: seed.not_established_in_public_packet || seed.missing_fields || []
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
      'Independent early research instrument—not an official Wolfsonian product, not a replacement for curatorial expertise, and not a historical truth engine. Public-record packets are manually prepared; interpretive agents are bounded lenses; contradictions are research signals that generate onsite questions.',
    framingNote:
      'Within a minute you should see: (1) public Wolfsonian source records, (2) six bounded interpretive agents, (3) interpretation kept separate from evidence, (4) contradictions treated as useful rather than AI errors, (5) uncertainty labeled, (6) Residency output as object-request candidates for onsite work.',
    dataNote:
      'Public-record packets manually prepared from Wolfsonian sources while automated API connectivity remains under investigation. Source packets and interpretation layers are stored separately. Gaps mean “not established in this public packet,” not “the institution does not know.”',
    representationNote: 'Object figures are original diagrammatic forms, not collection photography.',
    objects: objectIds,
    agents: [
      { id: 'archivist', label: 'Archivist', voice: 'Catalog restraint — cites fields, refuses fluent invention.' },
      { id: 'worker', label: 'Worker', voice: 'Labor and material process — asks what construction leaves out.' },
      { id: 'futurist', label: 'Futurist', voice: 'Optimistic projection — reads forms as promises of tomorrow.' },
      { id: 'mourner', label: 'Mourner', voice: 'Loss and afterlife — tracks what display forgets or buries.' },
      { id: 'propagandist', label: 'Propagandist', voice: 'Persuasion analysis — watches design recruit desire.' },
      { id: 'counterfeit', label: 'Counterfeit', voice: 'Adversarial filler — invents fluent gaps to be challenged.' },
      { id: 'museum', label: 'The Museum', voice: 'Institutional coherence — seeks a shareable public narrative.' }
    ]
  };
  await writeFile(join(root, 'demo', 'data', 'trial-001.json'), `${JSON.stringify(trial, null, 2)}\n`, 'utf8');
  console.log(`Compiled ${objectIds.length} featured demo packets and copied simulation artifacts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
