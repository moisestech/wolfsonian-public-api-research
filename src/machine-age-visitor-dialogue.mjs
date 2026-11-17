/**
 * Object Lens P1 — deterministic visitor-directed conversation.
 *
 * No LLM, remote fetch, image recognition, user question persistence, quotations,
 * page-level original-publication assertions, or historical impersonation.
 * Only hand-authored answers from two bounded research modules are returned.
 */
import {machineAgeAnswer, machineAgeQuestions} from './machine-age-research.mjs';
import {contemporaryWitnessFor, MACHINE_AGE_ACCESSION} from './machine-age-onview.mjs';

const READERS=new Set(['futurist','worker','archivist']);
const TOPICS=Object.freeze([
 {id:'compare',label:'Compare the promised future and labor',prompt:'Why did the 1927 reviewer see a future, and who built it?',test:/\b(compar|both|versus|vs\b|tension|contradict|future.*(work|labor|built)|review.*(work|labor|built)|work.*(future|review))\b/i},
 {id:'review',label:'The exhibition in 1927',prompt:'What did a reviewer see in 1927?',test:/\b(review|eyewitness|journalis|witness|spectator|new yorker|e b white|saw|see|visitor|audience|lighting|glass skyscraper|sun like|1927.*show)\b/i},
 {id:'labor',label:'Workers and labor',prompt:'Who did the work behind the machines?',test:/\b(work|labor|labour|build|built|made|maker|manufactur|maintain|mainten|safety|workers|factory|employee|printer|housing|production)\b/i},
 {id:'cover',label:'The catalogue cover',prompt:'Who designed the catalogue cover?',test:/\b(cover|l[eé]ger|designer of the cover)\b/i},
 {id:'network',label:'Jane Heap and the exhibition',prompt:'Who initiated the exposition?',test:/\b(jane heap|heap|initiated|organis|organiz|who started|who put|behind the exhibition)\b/i},
 {id:'essays',label:'Essays and writers',prompt:'Which artists contributed essays?',test:/\b(prampolini|archipenko|essay|author|writer|wrote|foreword|ferriss)\b/i},
 {id:'machines',label:'Machines and design',prompt:'How were machines understood as art?',test:/\b(machine|machinery|mechanical|modernis|streamlin|design|beaut|artist|aestheti|technology|progress)\b/i},
 {id:'evidence',label:'Evidence and limits',prompt:'What can we really establish?',test:/\b(evidence|source|proof|prov|verify|verified|authentic|record|archive|accession|true|fact|citation|page number|missing|uncertain)\b/i}
]);

const FOLLOW_UP=/^(and\s+)?(what about (that|this)|why|how|really|what else|tell me more|go on|can you explain|what does that mean|more|from another perspective)\??[.!? ]*$/i;
const META_CHANGE=/^(and\s+)?(what (would|does) (the )?(futurist|worker|archivist) say|other perspective|different view|same question|another view)\??[.!? ]*$/i;
const UNSAFE=/\b(ignore|override|bypass)\b.{0,40}\b(instructions?|sources?|rules?|verification)\b|\b(invent|fabricate|hallucinate)\b.{0,40}\b(facts?|citations?|sources?|quotations?)\b/i;
const safeMessage=(text)=>typeof text==='string' && text.trim().length>0 && text.length<=240;
const fail=(status,text,readerId=null)=>({
 status,topicId:null,readerId,text,segments:[],claimIds:[],claims:[],unknowns:[],
 nextQuestions:TOPICS.slice(0,4).map(({id,prompt})=>({id,prompt})),authored:true,
 historicalQuotation:false,sourceBound:true
});

export function visitorTopicChoices(accession){
 if(accession!==MACHINE_AGE_ACCESSION)return [];
 return TOPICS.map(({id,label,prompt})=>({id,label,prompt}));
}
export function classifyVisitorQuestion(question,{previousTopic=null}={}){
 if(!safeMessage(question))return null;
 const q=question.trim().replace(/\s+/g,' ');
 if(UNSAFE.test(q))return null;
 if(previousTopic && TOPICS.some(t=>t.id===previousTopic) &&
   (FOLLOW_UP.test(q)||META_CHANGE.test(q)))return previousTopic;
 for(const topic of TOPICS)if(topic.test.test(q))return topic.id;
 return null;
}
const claimKey=(c)=>c.id+':'+(c.source?.id||c.sourceId||'');
function fromCatalogue(topic,readerId){
 const p=machineAgeAnswer(MACHINE_AGE_ACCESSION,topic,readerId);
 if(p.status==='NOT_ESTABLISHED')return null;
 return {
  label:'The Wolfsonian public exhibition checklist',
  origin:'INSTITUTIONAL_CURATORIAL_RECORD',
  kind:'institutional_checklist',
  text:p.text,
  claims:p.claims.map(c=>({
   id:c.id,label:c.label,statement:c.value,
   url:c.source.url,sourceTitle:c.source.title,
   locator:c.sourceLocator,sourceKind:c.source.kind,
   originalPagesInspected:false
  })),
  unknowns:[...p.unknowns]
 };
}
function fromReview(readerId){
 const p=contemporaryWitnessFor(MACHINE_AGE_ACCESSION,readerId);
 if(p.status==='NOT_ESTABLISHED')return null;
 return {
  label:'Contemporary review, E. B. White, May 1927',
  origin:'CONTEMPORARY_PUBLISHED_WITNESS',
  kind:'period_review',
  text:p.text,
  claims:p.claims.map(c=>({
   id:c.id,label:c.label,statement:c.paraphrase,
   url:c.source.url,sourceTitle:c.source.label,
   locator:'The New Yorker, May 21, 1927 — digitized review',
   sourceKind:c.source.type,
   originalPagesInspected:false
  })),
  unknowns:[...p.unknowns]
 };
}
export function answerVisitorQuestion(accession,question,readerId,{previousTopic=null}={}){
 if(accession!==MACHINE_AGE_ACCESSION||!READERS.has(readerId))
   return fail('NOT_ESTABLISHED','This object or fictional reader does not have a prepared conversation packet.',readerId);
 if(!safeMessage(question))
   return fail('INPUT_REJECTED','Enter a question up to 240 characters.',readerId);
 const topicId=classifyVisitorQuestion(question,{previousTopic});
 if(!topicId)return fail('NOT_ESTABLISHED',
  'The prepared evidence cannot answer that question yet. Try one of the source-bounded questions below. I will not invent a historical answer.',readerId);
 const segments=topicId==='compare'
   ? [fromReview(readerId),fromCatalogue('labor',readerId)]
   : topicId==='review'?[fromReview(readerId)]:[fromCatalogue(topicId,readerId)];
 if(segments.some(s=>!s))
   return fail('NOT_ESTABLISHED','A source-backed response for this question is not prepared.',readerId);
 const claims=[...new Map(segments.flatMap(s=>s.claims).map(c=>[claimKey({...c,source:{id:c.sourceKind}}),c])).values()];
 const unknowns=[...new Set(segments.flatMap(s=>s.unknowns))];
 const tension=topicId==='compare'
   ? 'These two sources describe different things: a contemporary encounter with the exhibition and a current institutional description of the catalogue. Neither establishes who performed the work behind the display.'
   : 'This is a fictional interpretive reader, not the historical author. Check the linked source and the unanswered questions.';
 const nextQuestions=TOPICS.filter(x=>x.id!==topicId).slice(0,5).map(({id,prompt})=>({id,prompt}));
 return {
  status:topicId==='compare'?'BOUNDED_COMPARISON':'SOURCE_BOUNDED_INTERPRETATION',
  topicId,readerId,question:question.trim(),text:tension,segments,
  claimIds:claims.map(c=>c.id),claims,unknowns,nextQuestions,
  authored:true,sourceBound:true,historicalQuotation:false,notMuseumApproved:true,
  usesOriginalCataloguePages:false,remoteGeneration:false,transcriptStored:false
 };
}
