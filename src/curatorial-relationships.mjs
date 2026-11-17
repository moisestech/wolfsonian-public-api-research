/**
 * Relationship labels for the research preview.
 * A shared tag stays a metadata overlap. A juxtaposition is an authored
 * comparison. A documented historical relationship would need reviewed
 * evidence of contact, and this set has none.
 */
import { WORLDS_FAIRS_RESEARCH } from './worlds-fairs-research.mjs';

export const RELATIONSHIP_TYPES = Object.freeze({
  metadata_overlap: Object.freeze({
    id: 'metadata_overlap',
    label: 'Metadata overlap',
    meaning: 'A shared catalog tag. It is not evidence that the objects met.',
  }),
  curatorial_juxtaposition: Object.freeze({
    id: 'curatorial_juxtaposition',
    label: 'Curatorial juxtaposition',
    meaning: 'An authored comparison with a question, published sources, and a limit. It is not a catalog match or a documented meeting.',
  }),
  documented_historical_relationship: Object.freeze({
    id: 'documented_historical_relationship',
    label: 'Documented historical relationship',
    meaning: 'Reviewed evidence of contact between the records. This preview has none.',
  }),
});

export const DOCUMENTED_HISTORICAL_RELATIONSHIPS = Object.freeze([]);

const CHECKLIST = 'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf';

function researchRecord(accession) {
  const candidate = WORLDS_FAIRS_RESEARCH.candidates.find(item => item.accession === accession);
  if (!candidate) throw new Error('Missing checklist candidate ' + accession);
  return Object.freeze({
    accession: candidate.accession,
    title: candidate.title,
    year: candidate.year,
    creator: '',
    date: '',
    source: 'research-preview',
    researchOnly: true,
    rightsApproved: false,
    tags: [],
  });
}

function existingRecord(accession, title) {
  return Object.freeze({
    accession,
    title,
    creator: '',
    date: '',
    source: 'research-preview',
    researchOnly: false,
    tags: [],
  });
}

const NARRATES_ARCHIVIST = 'The published checklist describes the 1939 Futurama book spread and the Harlem invitation leaflet. That checklist fact does not show that a Harlem Tours client attended Futurama or met anyone from General Motors.';
const REFUSED_ARCHIVIST = 'The published checklist lists The Threatening Shadow as an unexecuted maquette rejected by fair organizers. That checklist fact does not show what visitors encountered beside the Trylon and Perisphere, or why the organizers refused the proposal.';
const BUILDS_ARCHIVIST = 'The published checklist identifies The Glory of Iron as a sculpture of workers constructing the Eiffel Tower. On Munitions: Skilled Work is a separate object already in this demo. The checklist does not connect their makers, workplaces, or dates.';

function edgeFor(id, source, target) {
  return Object.freeze({
    id: 'juxtaposition::' + id,
    source: source.accession,
    target: target.accession,
    relationshipType: 'curatorial_juxtaposition',
    label: 'Curatorial juxtaposition',
    reasons: [],
    classification: 'curatorial_juxtaposition',
    historicalRelationshipEstablished: false,
  });
}

function scene(path) {
  return Object.freeze({
    ...path,
    status: 'research_preview',
    relationshipType: 'curatorial_juxtaposition',
    historicalRelationshipEstablished: false,
    sourceUrl: CHECKLIST,
  });
}

const PATH_DRAFTS = [
  {
    id: 'who-narrates-tomorrow',
    arc: 'Who narrates tomorrow?',
    source: researchRecord('83.2.19'),
    target: researchRecord('XC2024.03.1.1'),
    proposal: 'The checklist places a corporate narration of an imagined city beside a Harlem invitation to the same fair. This pair is not a catalog match or a documented meeting.',
    limits: 'This record does not tell us what an individual fairgoer believed, nor prove that any Harlem Tours client attended the Futurama ride.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '83.2.19',
        speaker: 'Futurama (book page spread)',
        text: 'I narrate a city from above while the visitor is carried past it. If this voice explains tomorrow, who is allowed to interrupt it?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: 'XC2024.03.1.1',
        speaker: 'Harlem Invites You to Visit the New York World\'s Fair (leaflet)',
        text: 'I invite Harlem to the fair and name a route of our own. Your narration does not decide who is addressed, or which road we take.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: NARRATES_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
  {
    id: 'which-future-is-refused',
    arc: 'Which future is refused?',
    source: researchRecord('83.6.2'),
    target: existingRecord('86.17.1', 'Trylon and Perisphere'),
    proposal: 'The checklist says organizers rejected this unexecuted warning. The Trylon and Perisphere is a different, already built fair emblem. This pair is not a catalog match or a documented meeting.',
    limits: 'The checklist supports rejection of the proposal, not the full decision process, organizers\' private motives, or visitor reactions.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '83.6.2',
        speaker: 'The Threatening Shadow (unexecuted maquette)',
        text: 'I was drawn as a warning against authoritarian aggression, and the fair left me unbuilt. What future remains when the warning is refused?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: '86.17.1',
        speaker: 'Trylon and Perisphere',
        text: 'I am the built emblem of that fair. Your refusal is not my story, and my silhouette does not answer for the warning that was turned away.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: REFUSED_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
  {
    id: 'who-builds-the-future',
    arc: 'Who builds the future?',
    source: researchRecord('84.6.14'),
    target: existingRecord('85.4.64.34', 'On Munitions: Skilled Work'),
    proposal: 'The checklist shows workers constructing the Eiffel Tower. On Munitions is a separate print about skilled work. This pair is not a catalog match or a documented meeting.',
    limits: 'No proven connection to the 1917 On Munitions print; the comparison crosses separate moments and contexts.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '84.6.14',
        speaker: 'La Gloire du fer [The Glory of Iron] (sculpture)',
        text: 'I show workers raising the iron of the Eiffel Tower. A monument to progress still has to account for the people who built it.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: '85.4.64.34',
        speaker: 'On Munitions: Skilled Work',
        text: 'My title has to announce that munitions work is skilled. If the future is made by hands, the announcement should not be the only place those hands appear.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: BUILDS_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
];

export const CURATORIAL_PATHS = Object.freeze(PATH_DRAFTS.map(path => scene({
  ...path,
  edge: edgeFor(path.id, path.source, path.target),
})));

export function pathById(id) {
  return CURATORIAL_PATHS.find(path => path.id === id) || null;
}

export function juxtapositionConversation(path) {
  if (!path || path.relationshipType !== 'curatorial_juxtaposition') throw new Error('Select a curatorial juxtaposition.');
  return {
    id: path.id,
    mode: 'CURATORIAL_JUXTAPOSITION',
    relationshipType: 'curatorial_juxtaposition',
    researchPreview: true,
    editorialStatus: 'research_preview',
    historicalRelationshipEstablished: false,
    dramaticArc: path.arc,
    nextPrompt: '',
    source: path.source.accession,
    target: path.target.accession,
    proposal: path.proposal,
    limits: path.limits,
    evidence: [],
    turns: path.turns.map(turn => ({
      role: turn.role,
      speaker: turn.speaker,
      text: turn.text,
      citations: [],
      kind: turn.kind,
    })),
  };
}
