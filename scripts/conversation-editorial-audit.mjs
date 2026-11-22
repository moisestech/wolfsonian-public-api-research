import { readFile, readdir } from 'node:fs/promises';
import { MATRIX_OBJECTS as publicObjects } from '../src/public-matrix-objects.mjs';
import { CURATED_EDGE_SCENES } from '../src/curated-edge-scenes.mjs';
import { CURATORIAL_PATHS } from '../src/curatorial-relationships.mjs';
import { WORLDS_FAIRS_RESEARCH } from '../src/worlds-fairs-research.mjs';
import { matrixToRecords } from '../src/matrix-room.mjs';
import { accessionKey, objectVoiceProfile, PERSPECTIVE_VOICES } from '../src/conversation-voices.mjs';
import { authoredPairs, auditConversationCoverage, planConversationCoverage } from '../src/conversation-editorial.mjs';

const scope = process.argv.find(arg => arg.startsWith('--scope='))?.split('=')[1] || 'public';
if (!['public', 'matrix', 'working'].includes(scope)) throw new Error('Use --scope=public, matrix or working.');
const base = scope === 'public' ? publicObjects : (await import('../src/matrix-objects.mjs')).MATRIX_OBJECTS;
const objects = new Map(matrixToRecords(base).map(record => [accessionKey(record.accession), record]));
function add(record) { if (!objects.has(accessionKey(record.accession))) objects.set(accessionKey(record.accession), record); }
if (scope !== 'matrix') {
  for (const path of CURATORIAL_PATHS) { add(path.source); add(path.target); }
  for (const file of await readdir(new URL('../data/public/objects/', import.meta.url))) {
    if (!file.endsWith('.json')) continue;
    const packet = JSON.parse(await readFile(new URL('../data/public/objects/' + file, import.meta.url), 'utf8'));
    const record = objects.get(accessionKey(packet.accessionNumber)) || {};
    // No invented shared tags from packet subjects. Preserve the distinct comparison route.
    objects.set(accessionKey(packet.accessionNumber), { ...record, accession: packet.accessionNumber, title: packet.title, date: packet.date, source: 'public-packet', tags: record.tags || [] });
  }
}
if (scope === 'working') for (const candidate of WORLDS_FAIRS_RESEARCH.candidates) add({ ...candidate, source: 'research-preview', tags: [], registryOnly: candidate.graph === 'registry_only' });
const records = [...objects.values()], pairs = authoredPairs(CURATED_EDGE_SCENES, CURATORIAL_PATHS);
const plan = planConversationCoverage(records, pairs);
// Explicit research proposals handle untagged objects without manufacturing tag matches.
// These stay in this editorial CLI and never enter the runtime registry or public bundle.
const researchProposals = scope === 'working' ? [
  ['84.5.103.2','XX1991.13','How does a drawing ask us to imagine entering a building?'],
  ['84.5.103.2','86.17.1','What makes an architectural proposal look public?'],
  ['TD1989.19.9','XC2024.03.1.1','Who chooses the route to a fair?'],
  ['TD1989.19.9','86.19.57','What journey sits behind an invitation to tomorrow?'],
  ['XB1991.830','83.2.19','What changes when the future returns as another ride?'],
  ['XB1991.830','XB1992.1640','What changes between two publications that promise Futurama?'],
].map(([a,b,question]) => ({id:[a,b].sort().join('::'),a,b,question,relationship:'curatorial_juxtaposition',status:'RESEARCH_PROPOSAL_NOT_A_CONVERSATION',requires:undefined,
  review:{sourceCheck:'PENDING',objectInspection:'PENDING',dialogueEdit:'PENDING',readAloud:'PENDING',approval:'PENDING'},
  basis:'Inspect the two exact records before accepting this artist-proposed comparison. No shared tag or historical contact is claimed.'})) : [];
const profiles = records.map(objectVoiceProfile);
const result = {
  scope, sourceRevision: '89b2abc5c5031b35425257c0362fe4dc68b5d5ea',
  counts: { ...auditConversationCoverage(records, pairs), authoredVoiceDirections: profiles.filter(p => p.status === 'AUTHORED_DIRECTION_DRAFT').length, provisionalRecordBriefs: profiles.filter(p => p.status === 'RECORD_BRIEF_AWAITING_AUTHORSHIP').length, perspectives: PERSPECTIVE_VOICES.length },
  plan: { proposedPairs: plan.proposedPairs.length + researchProposals.length, batchesOfFour: Math.ceil((plan.proposedPairs.length + researchProposals.length) / 4), projected: auditConversationCoverage(records,[...pairs,...plan.proposedPairs,...researchProposals]), note: plan.note },
  profiles, perspectives: PERSPECTIVE_VOICES, proposedPairs: [...plan.proposedPairs,...researchProposals],
};
console.log(JSON.stringify(result, null, 2));
