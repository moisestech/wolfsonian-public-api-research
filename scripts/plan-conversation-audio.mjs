/**
 * Read-only preflight for the proposed audio editions. Run with a canonical
 * scene ID for one room, --all for the production queue or no arguments for totals.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { CURATED_EDGE_SCENES } from '../src/curated-edge-scenes.mjs';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';
import { WORLDS_FAIRS_RESEARCH } from '../src/worlds-fairs-research.mjs';

// Keys are authored IDs. A role in a particular room can change when the pair is reversed.
const scenes = [
  ...CURATED_EDGE_SCENES.map(scene => ({
    id: scene.id, hosts: scene.pair, turns: scene.turns,
  })),
  ...CURATORIAL_PATHS.map(path => ({
    id: path.id, hosts: [path.source.accession, path.target.accession], turns: path.turns,
  })),
];

const pilotExperiments = new Map([
  ['radio-and-television', '01-household-audience'],
  ['program-and-booklet', '02-promise-souvenir'],
  ['globe-and-theme-center', '03-globe-theme-center'],
  ['poster-and-program', '04-poster-program'],
  ['catalogue-and-globe', '05-who-is-modern'],
]);

async function publicSourceIndex() {
  const index = new Map();
  function add(accession, urls) {
    const published = urls.filter(url => typeof url === 'string' && url.startsWith('https://wolfsonian.org/'));
    if (published.length) index.set(accession, [...new Set([...(index.get(accession) || []), ...published])].sort());
  }
  const directory = new URL('../data/public/objects/', import.meta.url);
  for (const file of (await readdir(directory)).filter(name => name.endsWith('.json'))) {
    const packet = JSON.parse(await readFile(new URL(file, directory), 'utf8'));
    add(packet.accessionNumber, packet.source_urls || []);
  }
  for (const record of WORLDS_FAIRS_RESEARCH.candidates) add(record.accession, [record.publicSource]);
  return index;
}

// The fingerprint identifies the ordered script. The operator can inspect the queue
// by speaker and character count while keeping the dialogue in its source registry.
export function describeScene({ id, hosts, turns }, sources) {
  const language = 'en';
  if (hosts.length !== 2 || new Set(hosts).size !== 2 || !turns.length) {
    throw new Error('Expected two different objects and an authored transcript for ' + id);
  }
  const lines = turns.map(({ speakerAccession, text }) => {
    if (speakerAccession !== 'archivist' && !hosts.includes(speakerAccession)) {
      throw new Error('Unknown scripted speaker for ' + id);
    }
    if (typeof text !== 'string' || !text.trim()) throw new Error('Empty scripted turn for ' + id);
    const speaker = speakerAccession === 'archivist' ? 'perspective:archivist' : 'object:' + speakerAccession;
    return [speaker, text];
  });
  const canonical = JSON.stringify(['archive-society/audio-script/v1', id, language, lines]);
  const scriptRevision = createHash('sha256').update(canonical, 'utf8').digest('hex');
  const objects = hosts.map(accession => ({ accession, publicSources: sources.get(accession) || [] }));
  const missing = objects.filter(object => !object.publicSources.length).map(object => object.accession);
  return {
    sceneId: id,
    labExperiment: pilotExperiments.get(id) || null,
    language,
    hosts: objects,
    scriptRevision,
    turns: lines.map(([speaker], index) => ({ turnId: 't' + String(index + 1).padStart(3, '0'), speaker })),
    spokenCharacters: lines.reduce((total, [, text]) => total + [...text].length, 0),
    editions: {
      device: { input: 'displayed-script', availability: 'check-installed-local-voice-on-device' },
      elevenlabs: { input: 'fixed-script', review: 'check-script-cast-processing-and-budget' },
      notebooklm: { input: 'reviewed-source-brief', sourceStatus: missing.length ? 'source-hold' : 'source-locators-present', missing },
    },
  };
}

export async function planConversationAudio() {
  const sources = await publicSourceIndex();
  if (new Set(scenes.map(scene => scene.id)).size !== scenes.length) throw new Error('Duplicate canonical scene ID');
  return scenes.map(scene => describeScene(scene, sources));
}

if (import.meta.main) {
  const rows = await planConversationAudio();
  const [requested, ...rest] = process.argv.slice(2);
  const selected = rows.find(row => row.sceneId === requested);
  if (rest.length || (requested && requested !== '--all' && !selected)) {
    console.error('Pass --all or a canonical scene ID such as program-and-booklet.');
    process.exitCode = 1;
  } else if (requested === '--all') {
    console.log(JSON.stringify(rows, null, 2));
  } else if (selected) {
    console.log(JSON.stringify(selected, null, 2));
  } else {
    const withSources = rows.filter(row => row.editions.notebooklm.sourceStatus === 'source-locators-present').length;
    console.log(JSON.stringify({
      scenes: rows.length,
      speakingObjects: new Set(rows.flatMap(row => row.turns.map(turn => turn.speaker)).filter(speaker => speaker.startsWith('object:'))).size,
      bothObjectSourcesLocated: withSources,
      missingObjectSources: rows.length - withSources,
      pilotSceneIds: [...pilotExperiments.keys()],
    }, null, 2));
  }
}
