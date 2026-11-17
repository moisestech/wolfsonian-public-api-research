/** Source-first Object Lens: independently authored fiction, no image recognition or private corpus. */
import { PUBLIC_ANCHORS, findByAccession } from './atlas-graph.mjs';
export {visitorTopicChoices, classifyVisitorQuestion, answerVisitorQuestion} from './machine-age-visitor-dialogue.mjs';
export {onViewResourcesFor as researchCopiesFor, contemporaryWitnessFor as contemporaneousAccountFor, MACHINE_AGE_ACCESS_STATE} from './machine-age-onview.mjs';
export { machineAgeQuestions as curatedQuestionsFor, machineAgeAnswer as answerCuratedQuestion, machineAgeClaimLedger as curatedClaimLedgerFor, machineAgeResearchLeads as curatedPrimaryPageLeadsFor } from './machine-age-research.mjs';

export const LENS_READERS = Object.freeze([
  { id:'futurist',label:'Futurist',icon:'⚡',prompt:'Ask what future this object might promise; a promise is not proof of progress.',blindSpot:'Could mistake aspiration for historical outcome.' },
  { id:'worker',label:'Worker',icon:'⚒',prompt:'Ask who made, used, repaired and maintained this; do not invent working lives.',blindSpot:'The available identity packet does not document lived labor.' },
  { id:'archivist',label:'Archivist',icon:'▤',prompt:'Separate verified identity fields from interpretation; name missing sources.',blindSpot:'Catalog completeness is not historical completeness.' }
]);

const FEATURED = Object.freeze({
  'XM1999.108.8': {
    question:'What did the machine age teach artists to imagine?',date:'1927',
    sourceUrl:'https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf',
    readings:{
      futurist:'The title Machine Age Exposition invites us to consider machinery as an artistic future. What, specifically, did the original contributors imagine?',
      worker:'The title celebrates a machine age. Whose hands, skills and working lives can we actually trace in its pages—and whose are absent?',
      archivist:'This public packet identifies a catalogue and its accession. It cannot establish the content of its essays, complete credits, or a relationship to another object. The original pages must be consulted.'
    }
  },
  'XX1990.1484': {
    question:'What future did a domestic radio make imaginable?',date:null,
    sourceUrl:'https://wolfsonian.org/_assets/docs/miami-beach-deco-walk.pdf',
    readings:{
      futurist:'A radio can invite an imagined connected home. What would an original advertisement or design record establish about that promise?',
      worker:'Who assembled, repaired, and operated this radio? The short identity packet cannot name them or describe their working conditions.',
      archivist:'This packet supplies an object title and accession. Manufacturing conditions, physical location and direct connections to other collection objects are not established here.'
    }
  }
});
const GENERIC = Object.freeze({
  futurist:'What future might someone imagine from this object? That is a question, not a documented intention of its creator.',
  worker:'Who made, used, and cared for this object? Its identity alone does not establish individual histories.',
  archivist:'This public packet establishes a title and accession. Any further historical claim needs an attributed source.'
});

export function resolvePublicAccession(accession,records=PUBLIC_ANCHORS) {
  return findByAccession(records,accession);
}
export function encounterFor(accession) {
  const hit=resolvePublicAccession(accession);
  if(hit.status!=='EXACT')return null;
  const a=hit.record, f=FEATURED[a.accession];
  return {
    accession:a.accession,title:a.title,date:f?.date||null,
    question:f?.question||'What does this object tell us—and what remains unknown?',
    sourceState:'VERIFIED_PUBLIC_PACKET_IDENTITY',sourceUrl:f?.sourceUrl||null,
    evidence:[
      {field:'Title',value:a.title,status:'SOURCE_PACKET_IDENTITY'},
      {field:'Accession',value:a.accession,status:'SOURCE_PACKET_IDENTITY'},
      ...(f?.date?[{field:'Date',value:f.date,status:'PUBLIC_EXHIBITION_REFERENCE'}]:[])
    ],
    readers:LENS_READERS.map(r=>({...r,script:f?.readings[r.id]||GENERIC[r.id],
      classification:'ARTIST_AUTHORED_INTERPRETATION',historicalRelationshipEstablished:false,citations:[]}))
  };
}
export function atlasFallbackRecord(a) {
  return { accession:a.accession,title:a.title,creator:'',date:'',objectType:'Public research packet',
    imageFilename:'',source:'public-packet',tags:[],additionalAccessions:a.additionalAccessions||[] };
}
export function withPublicAnchorFallback(records,anchors=PUBLIC_ANCHORS) {
  const result=[...records], present=new Set(records.map(r=>r.accession));
  for(const anchor of anchors)if(!present.has(anchor.accession)){
    result.push(atlasFallbackRecord(anchor));present.add(anchor.accession);
  }
  return result;
}
export function atlasHandoffFor(accession) {
  const hit=resolvePublicAccession(accession);
  return hit.status==='EXACT'?'../archive-society/?accession='+encodeURIComponent(hit.record.accession):null;
}
