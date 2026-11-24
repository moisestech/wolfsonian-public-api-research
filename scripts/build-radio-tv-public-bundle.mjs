/**
 * Build the only browser-visible Radio × Television research snapshot from
 * the artist-prepared public packets. No staff matrix, Lakehouse data, imagery,
 * private annotations, model credentials or unpublished collection material.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const records = [
  { id: 'WOLF-008', accessionNumber: '2012.6.1' },
  { id: 'WOLF-002', accessionNumber: 'XX1990.1484' },
];
const accepted = new Set(records.map(row => row.id));
const approvedUrl = url => {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === 'wolfsonian.org'
      && !parsed.username && !parsed.password;
  } catch { return false; }
};
export async function buildRadioTvPublicBundle(destination = join(root, 'research-console/public/data/radio-tv')) {
  const room = CURATORIAL_PATHS.find(path => path.id === 'radio-and-television');
  if (!room || room.relationshipType !== 'curatorial_juxtaposition' ||
    room.historicalRelationshipEstablished !== false ||
    room.source?.accession !== records[0].accessionNumber ||
    room.target?.accession !== records[1].accessionNumber ||
    room.source?.packet !== records[0].id || room.target?.packet !== records[1].id ||
    typeof room.proposal !== 'string' || typeof room.limits !== 'string') {
    throw new Error('Radio/Television curatorial registry must be reviewed before publishing');
  }
  await mkdir(destination, { recursive: true });
  for (const { id, accessionNumber } of records) {
    if (!accepted.has(id)) throw new Error('Unsupported research packet');
    const seed = JSON.parse(await readFile(join(root, 'data/public/objects', id + '.json'), 'utf8'));
    if (seed.id !== id || seed.accessionNumber !== accessionNumber ||
      seed.research_status !== 'public-record-only' ||
      !approvedUrl(seed.source_urls?.[0]) ||
      typeof seed.retrieved_at !== 'string' ||
      !Array.isArray(seed.not_established_in_public_packet)) {
      throw new Error('Public packet provenance or rights state changed: ' + id);
    }
    // Explicit projection, not full source copying. The SHA-256 used by the runner
    // identifies this public projection snapshot, not the raw source file.
    const exposed = {
      id: seed.id,
      accessionNumber: seed.accessionNumber,
      title: seed.title,
      date: seed.date,
      creator: seed.creator,
      materials: seed.materials,
      source_urls: [seed.source_urls[0]],
      retrieved_at: seed.retrieved_at,
      research_status: seed.research_status,
      not_established_in_public_packet: seed.not_established_in_public_packet,
    };
    await writeFile(join(destination, id + '.json'), JSON.stringify(exposed, null, 2) + '\n');
  }
  const boundedRoom = {
    id: room.id,
    relationshipType: room.relationshipType,
    historicalRelationshipEstablished: false,
    source: { accession: room.source.accession, packet: room.source.packet },
    target: { accession: room.target.accession, packet: room.target.packet },
    proposal: room.proposal,
    limits: room.limits,
  };
  await writeFile(join(destination, 'room.json'), JSON.stringify(boundedRoom, null, 2) + '\n');
  return { packetIds: records.map(item => item.id), roomId: room.id, destination };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildRadioTvPublicBundle().then(value => {
    console.log('Built public-only research bundle: ' + value.roomId + ', ' + value.packetIds.join(', '));
  }).catch(err => { console.error(err.message); process.exitCode = 1; });
}
