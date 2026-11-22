// Produce one editorial brief per reachable, unscripted pair in the public build.
import { MATRIX_OBJECTS } from '../src/public-matrix-objects.mjs';
import { matrixToRecords } from '../src/matrix-room.mjs';
import { societyView, conversationFor } from '../src/archive-society.mjs';
import { conversationEpisode } from '../src/conversation-orientation.mjs';
import { sceneVoiceBrief } from '../src/conversation-voices.mjs';

const records = matrixToRecords(MATRIX_OBJECTS);
const byId = new Map(records.map(record => [record.accession, record]));
const prompts = new Map();
for (const source of records) {
  for (const edge of societyView(records, source.accession).edges) {
    const target = byId.get(edge.target);
    const conversation = conversationFor(source, target, edge);
    const episode = conversationEpisode({ source, target, conversation });
    if (episode.mode !== 'RESEARCH_PROMPT' || prompts.has(episode.id)) continue;
    prompts.set(episode.id, {
      id: episode.id,
      question: episode.question,
      objects: episode.participants.map(({ accession, title }) => ({ accession, title })),
      sharedTags: edge.reasons.map(({ family, value }) => ({ family, value })),
      instruction: 'Draft two short object voices that disagree about the question. Anchor each voice in its own title or shared tag. Mark all speech as imagined. List any claim that needs a collection source.',
      voiceBrief: sceneVoiceBrief(source,target),
      review: { sourceCheck:'PENDING', objectInspection:'PENDING', dialogueEdit:'PENDING', readAloud:'PENDING', approval:'PENDING' },
      status: 'AWAITING_EDITORIAL_DRAFT',
    });
  }
}
console.log(JSON.stringify([...prompts.values()], null, 2));
