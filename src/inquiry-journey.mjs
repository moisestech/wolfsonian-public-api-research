/**
 * Archive Dreams · in-memory inquiry trail.
 * Accumulates paths through questions, NOT knowledge claims or museum data.
 * Intentionally no storage, cookies, analytics, model calls or network.
 *
 * Editorial values derived from official Wolfsonian mission (not endorsement):
 * https://wolfsonian.org/about/
 * This is artist-authored interpretation of those values.
 */
import { INQUIRY_STAGES, objectInquiryPath } from './object-inquiry.mjs';

export const MUSEUM_MISSION_SOURCE='https://wolfsonian.org/about/';
export const JOURNEY_CAP=18;
export const INQUIRY_MOVES=Object.freeze({
 observe:Object.freeze({mission:'Look beyond the familiar',axis:'design',question:'Which part of the object supports that description?',handoff:'Who was expected to use or encounter this form?',next:'encounter'}),
 encounter:Object.freeze({mission:'Consider human experience',axis:'social',question:'Whose experience does this imagined use leave out?',handoff:'Who made it, circulated it, or cared for it?',next:'provenance'}),
 provenance:Object.freeze({mission:'Investigate historical change',axis:'historical',question:'Which record would establish that history?',handoff:'Who gained or lost agency in this system?',next:'systems'}),
 systems:Object.freeze({mission:'Question persuasion and power',axis:'political',question:'Which design choices turn a claim into something persuasive?',handoff:'What does this historical promise change in our present?',next:'interpret'}),
 interpret:Object.freeze({mission:'Connect past, present and future',axis:'future',question:'What evidence could overturn our reading?',handoff:'What would another close look reveal?',next:'observe'})
});
const normalize=v=>String(v??'').replace(/\s+/g,' ').trim().slice(0,180);
const stages=new Set(INQUIRY_STAGES.map(s=>s.id));

export function emptyInquiryTrail(){return Object.freeze({visits:[]});}
export function addInquiryVisit(trail,input,allowedAccessions=[]){
 const permitted=new Set(allowedAccessions);
 const accession=normalize(input?.accession),stageId=normalize(input?.stageId);
 if(!permitted.has(accession)||!stages.has(stageId)) throw Error('Only explicitly selected public identities and recognized inquiry stages can enter the trail.');
 const title=normalize(input?.title);
 if(!title)throw Error('A catalog display title is required.');
 const visits=Array.isArray(trail?.visits)?trail.visits:[];
 // Never ingest visitor free text, generated statements or location coordinates.
 const last=visits.at(-1);
 if(last?.accession===accession&&last.stageId===stageId)return {visits:[...visits]};
 const visit={
  accession,title,stageId,
  kind:'ARTIST_AUTHORED_QUESTION',historicalRelationshipEstablished:false,
  locationProvenance:'UNAVAILABLE',claimIds:[],
  question:INQUIRY_MOVES[stageId].question
 };
 return {visits:[...visits,visit].slice(-JOURNEY_CAP)};
}
export function summarizeInquiryTrail(trail){
 const visits=Array.isArray(trail?.visits)?trail.visits:[];
 const stagesVisited=[...new Set(visits.map(v=>v.stageId))];
 const accessions=[...new Set(visits.map(v=>v.accession))];
 return {
  encounters:visits.length,
  movements:stagesVisited.length,
  objects:accessions.length,
  stagesVisited,accessions,
  unresolved:visits.map(v=>({accession:v.accession,stageId:v.stageId,question:v.question,evidence:'UNRESOLVED_EDITORIAL_PROMPT'})),
  connections:visits.slice(1).map((v,i)=>({
    from:visits[i].accession,to:v.accession,
    kind:'VISITOR_QUESTION_PATH',historicalRelationshipEstablished:false,
    sameObject:visits[i].accession===v.accession
  }))
 };
}
export function suggestInquiryMove(trail,{accession}={}){
 const visits=Array.isArray(trail?.visits)?trail.visits:[];
 const last=visits.at(-1);const relevant=visits.filter(v=>v.accession===accession);
 if(!last)return 'observe';
 const current=relevant.at(-1)?.stageId||last.stageId;
 const preferred=INQUIRY_MOVES[current]?.next||'observe';
 const already=new Set(relevant.map(v=>v.stageId));
 if(!already.has(preferred))return preferred;
 const unvisited=INQUIRY_STAGES.find(s=>!already.has(s.id));
 return unvisited?.id||preferred;
}
export function composeInquiryEpisode(record,stageId,trail=emptyInquiryTrail()){
 if(!record?.accession || !stages.has(stageId))throw Error('A recognized object and inquiry stage are required.');
 const scene=objectInquiryPath(record,stageId);
 const preceding=trail.visits?.at(-1);
 const move=INQUIRY_MOVES[stageId];
 const turns=scene.turns.map(t=>({...t}));
 let bridge=null;
 if(preceding){
  const previous=INQUIRY_STAGES.find(s=>s.id===preceding.stageId);
  if(preceding.accession===record.accession){
    bridge='We just asked about '+previous.label.toLowerCase()+'. Now I want to ask something different. What changes if we turn to '+(INQUIRY_STAGES.find(s=>s.id===stageId)?.label.toLowerCase()||'another question')+'?';
  }else{
    bridge='We began this question beside “'+preceding.title+'”. Now we are looking at “'+record.title+'”. Does our earlier question still work here—or does this object resist it?';
  }
  turns.unshift({speaker:'Visitor',role:'visitor',phase:stageId,type:'question',text:bridge,beat:0});
 }
 return {
  ...scene,turns,bridge,missionMove:move.mission,missionAxis:move.axis,
  closingQuestion:move.question,
  nextMovement:suggestInquiryMove({...trail,visits:[...(trail.visits||[]),{accession:record.accession,stageId,title:record.title}]},{accession:record.accession}),
  evidence:'ARTIST_AUTHORED_INTERPRETATION / UNRESOLVED',
  museumStatus:'INDEPENDENT ARTIST PROTOTYPE — NOT AN INSTITUTIONAL VOICE'
 };
}
export function exportInquiryTrail(trail){
 const summary=summarizeInquiryTrail(trail);
 return {
  version:1,project:'Archive Dreams in Public',scope:'LOCAL_VISITOR_QUESTION_PATH',
  museumEndorsement:false,containsUserText:false,
  disclaimer:'This is a record of an individual visitor’s selected questions, not evidence of historical contact, museum research, or archival storage location.',
  visits:(trail?.visits||[]).map(({accession,title,stageId,question})=>({accession,title,stageId,question,kind:'ARTIST_AUTHORED_QUESTION'})),
  totals:{encounters:summary.encounters,objects:summary.objects,movements:summary.movements}
 };
}
