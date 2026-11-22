/** Editorial directions are authored choices, never additional catalog facts. */
import { OBJECT_VOICE_DIRECTIONS } from './object-voice-directions.mjs';

// Artist decisions, November 21: vary tone by scene; listeners introduce the present.
export const CONVERSATION_LANGUAGE_POLICY = Object.freeze({
  humorPalette: Object.freeze(['dry_object_wit', 'warm_everyday_banter', 'occasional_absurdity', 'serious']),
  toneSelection: 'Choose the tone that serves this pair and its stakes. A serious scene needs no joke; do not combine every tone in every scene.',
  presentDayComparisons: 'LISTENER_PERSPECTIVES_ONLY',
  objectBoundary: 'Keep object speech grounded in its documented material, purpose and historical context. Objects do not introduce present-day platforms, technologies or events, or remember the future.',
  listenerBoundary: 'A listener perspective may introduce a present-day comparison as a clearly framed interpretation. Use separately supplied, cited contemporary context for factual claims; an analogy is not proof of historical continuity.',
});

export const accessionKey = value => String(value ?? '').replace(/\s+/g, '').replace(/[–—]/g, '-').toUpperCase();
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const directions = new Map(OBJECT_VOICE_DIRECTIONS.map(item => [accessionKey(item.accession), item]));
const roles = [
  ['family', 'Follow the practical consequences for daily life and care.', 'Warm, direct questions; notice the task someone still has to do.', 'Who has to make that work at home?', 'Do not invent a household or treat family life as universal.'],
  ['tourist', 'Test the invitation against the journey it asks someone to make.', 'Curious, spatial and alert to an inconvenient detour.', 'Lovely view. How do I actually get there?', 'Do not confuse advertised access with an actual visit.'],
  ['novice', 'Ask the clear question that an expert has skipped.', 'Plain words, specific observations; confident curiosity.', 'Wait. What am I meant to notice first?', 'Do not perform stupidity or apologize for asking.'],
  ['connoisseur', 'Make a formal detail change the interpretation.', 'Precise and sensuous; one material or compositional detail at a time.', 'Look at that edge. What does it make us overlook?', 'Do not use connoisseurship as superiority or infer influence from resemblance.'],
  ['worker', 'Follow the task, time, maintenance and allocation of credit.', 'Practical verbs; a concrete follow-up rather than an automatic denunciation.', 'Fine. Who keeps it working?', 'Do not invent a worker, wage, injury or class dialect.'],
  ['archivist', 'Identify the particular claim that a source could confirm or change.', 'Brief, curious precision; intervene at the factual hinge.', 'Which part can we check?', 'Do not recite the same disclaimer after every line or impersonate staff.'],
  ['futurist', 'Make the attraction of a proposed future understandable, then test it.', 'Energetic possibilities; enthusiasm capable of revision.', 'Suppose it worked. What would have to change first?', 'Do not make every future inevitable or treat Futurism as politically neutral history.'],
  ['mourner', 'Notice the absence, survival or loss an attractive account leaves aside.', 'Unhurried and particular; allow a pause or an unfinished thought.', 'What had to disappear for this picture to look complete?', 'Do not invent bereavement, victims or lived trauma.'],
  ['propagandist', 'Expose how a message recruits belief by demonstrating its rhetoric.', 'Sharp about a pronoun, promise, repetition or call to action.', 'Listen to the word “we.” Who gets included?', 'Analyze persuasion without reenacting hate or endorsing the source message.'],
  ['counterfeit', 'Offer an explicitly hypothetical inference and show where it fails.', 'Quick, plausible, then self-correcting; never leave the invention standing.', 'That would be a neat story. What would prove it wrong?', 'No fabricated fact, citation or uncertainty presented as a discovery.'],
  ['museum', 'Consider how a public account can hold an unresolved disagreement.', 'Hospitable, deliberate and willing to revise a label.', 'What could we put beside this so someone can disagree?', 'Fictional institutional perspective; never claim Wolfsonian authority.'],
];
export const PERSPECTIVE_VOICES = Object.freeze(roles.map(([id, purpose, rhythm, example, limit]) => Object.freeze({ id, purpose, rhythm, example, limit, status: 'ARTIST_AUTHORED_DIRECTION' })));
export function perspectiveVoice(id) { return PERSPECTIVE_VOICES.find(item => item.id === id) || null; }

function inheritedDirection(record) {
  const type = clean(record.objectType).toLowerCase();
  if (/poster|advert|catalog cover/.test(type)) return 'Try a public address: invite, warn, sell or persuade. Choose the act only after inspecting this item.';
  if (/architect|render|blueprint|plan/.test(type)) return 'Move between the view from a plan and one practical question at human scale.';
  if (/photo/.test(type)) return 'Attend to framing and what lies beyond the image; do not speak as the photographed person.';
  if (/print|painting|mural/.test(type)) return 'Make one represented action or formal detail matter; keep the artwork distinct from its subjects.';
  return 'Begin with one particular word, form or task supported by this record; choose the speaking purpose after inspection.';
}
export function objectVoiceProfile(record = {}) {
  const known = directions.get(accessionKey(record.accession));
  const title = clean(record.title || known?.label || 'Unidentified object');
  const english = title.match(/\[([^\]]+)\]/)?.[1] || title;
  const vocabulary = [...new Set((english.match(/[\p{L}][\p{L}’'-]{2,}/gu) || []).filter(word => !/^(the|and|for|from|with|this|that|into|untitled)$/i.test(word)))].slice(0, 7);
  return Object.freeze({
    accession: record.accession || '', title,
    status: known ? 'AUTHORED_DIRECTION_DRAFT' : 'RECORD_BRIEF_AWAITING_AUTHORSHIP',
    direction: known?.direction || inheritedDirection(record),
    vocabulary: Object.freeze(vocabulary),
    example: known?.example || '',
    sourceContext: Object.freeze({ date: clean(record.date || record.year), place: clean(record.geography), type: clean(record.objectType), source: clean(record.source) }),
    periodPhrases: Object.freeze([]),
    historicalSpeechEstablished: false,
    nextResearch: 'Inspect this exact object and its dated language source before approving period vocabulary. A supplied date/place is context, not a dialect.',
  });
}

export function sceneVoiceBrief(source, target, perspectiveId = 'family') {
  return Object.freeze({ objects: Object.freeze([objectVoiceProfile(source), objectVoiceProfile(target)]), perspective: perspectiveVoice(perspectiveId), languagePolicy: CONVERSATION_LANGUAGE_POLICY,
    instruction: 'Preserve each object’s voice across perspectives. Write an actual response, one turn in the argument, and an inspectable evidence hinge. Use only reviewed period phrases; an empty phrase bank means plain authored language.' });
}
