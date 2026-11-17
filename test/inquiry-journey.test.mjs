import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyInquiryTrail,addInquiryVisit,summarizeInquiryTrail,suggestInquiryMove,composeInquiryEpisode,exportInquiryTrail,INQUIRY_MOVES,MUSEUM_MISSION_SOURCE,JOURNEY_CAP} from '../src/inquiry-journey.mjs';
import {INQUIRY_STAGES} from '../src/object-inquiry.mjs';

const records=[
 {id:'XX1990.1484',title:'Sparton radio'},
 {id:'86.17.1',title:'Trylon and Perisphere model'}
];
const allowed=records.map(x=>x.id);
const visit=(trail,index,stageId)=>addInquiryVisit(trail,{accession:records[index].id,title:records[index].title,stageId},allowed);

test('every artist inquiry movement maps to a mission-inspired question and next movement',()=>{
 assert.deepEqual(Object.keys(INQUIRY_MOVES).sort(),INQUIRY_STAGES.map(s=>s.id).sort());
 for(const key of Object.keys(INQUIRY_MOVES)){
  const item=INQUIRY_MOVES[key];
  assert.ok(item.mission.length>8&&item.question.endsWith('?'));
  assert.ok(INQUIRY_STAGES.some(s=>s.id===item.next));
 }
 assert.equal(MUSEUM_MISSION_SOURCE,'https://wolfsonian.org/about/');
});
test('a visit leaves only a selected research-question path, no user text or historical edges',()=>{
 const start=emptyInquiryTrail();
 const one=visit(start,0,'observe');
 const two=visit(one,0,'encounter');
 const three=visit(two,1,'systems');
 assert.equal(start.visits.length,0);
 assert.equal(three.visits.length,3);
 const summary=summarizeInquiryTrail(three);
 assert.deepEqual([summary.encounters,summary.objects,summary.movements],[3,2,3]);
 assert.ok(summary.connections.every(x=>x.kind==='VISITOR_QUESTION_PATH'&&!x.historicalRelationshipEstablished));
 assert.equal(summary.connections[0].sameObject,true);
 assert.equal(summary.connections[1].sameObject,false);
 assert.ok(three.visits.every(v=>v.kind==='ARTIST_AUTHORED_QUESTION'&&v.claimIds.length===0&&v.locationProvenance==='UNAVAILABLE'));
 assert.deepEqual(visit(one,0,'observe'),one,'do not inflate visits by opening the same stage');
});
test('session paths follow unvisited inquiry movements and can cycle safely',()=>{
 let trail=emptyInquiryTrail();
 assert.equal(suggestInquiryMove(trail,{}),'observe');
 trail=visit(trail,0,'observe');assert.equal(suggestInquiryMove(trail,{accession:allowed[0]}),'encounter');
 trail=visit(trail,0,'encounter');assert.equal(suggestInquiryMove(trail,{accession:allowed[0]}),'provenance');
 trail=visit(trail,0,'provenance');assert.equal(suggestInquiryMove(trail,{accession:allowed[0]}),'systems');
 trail=visit(trail,0,'systems');assert.equal(suggestInquiryMove(trail,{accession:allowed[0]}),'interpret');
 trail=visit(trail,0,'interpret');assert.equal(suggestInquiryMove(trail,{accession:allowed[0]}),'observe');
 assert.equal(suggestInquiryMove(trail,{accession:allowed[1]}),'observe');
});
test('object-specific authored questions vary by exact accession without making unverified historical claims',()=>{
 const radio=composeInquiryEpisode({accession:allowed[0],title:records[0].title},'systems');
 const fair=composeInquiryEpisode({accession:allowed[1],title:records[1].title},'systems');
 assert.notEqual(radio.turns[0].text,fair.turns[0].text);
 assert.match(radio.turns[0].text,/voices heard through a radio/);
 assert.match(fair.turns[0].text,/invited into the promise of tomorrow/);
 assert.ok(radio.turns[0].text.endsWith('?'));
 assert.ok(fair.turns[0].text.endsWith('?'));
 assert.equal(radio.evidence,fair.evidence);
});
test('subsequent scripted dialogue explicitly bridges previous question and resists invented object contact',()=>{
 const first=composeInquiryEpisode({accession:allowed[0],title:records[0].title},'observe');
 assert.equal(first.turns.length,7);
 const trail=visit(emptyInquiryTrail(),0,'observe');
 const same=composeInquiryEpisode({accession:allowed[0],title:records[0].title},'encounter',trail);
 assert.equal(same.turns.length,8);
 assert.match(same.bridge,/just asked about look before naming/);
 const other=composeInquiryEpisode({accession:allowed[1],title:records[1].title},'systems',trail);
 assert.equal(other.turns.length,8);
 assert.match(other.bridge,/Now we are looking at/);
 assert.match(other.bridge,/resist it/);
 assert.equal(other.evidence,'ARTIST_AUTHORED_INTERPRETATION / UNRESOLVED');
 assert.match(other.museumStatus,/NOT AN INSTITUTIONAL VOICE/);
});
test('unapproved accessions, stages, and a physical box cannot enter an inquiry trail',()=>{
 assert.throws(()=>addInquiryVisit(emptyInquiryTrail(),{accession:'DEMO-BOX-01',title:'A box',stageId:'observe'},allowed),/Only explicitly/);
 assert.throws(()=>addInquiryVisit(emptyInquiryTrail(),{accession:allowed[0],title:records[0].title,stageId:'wrong'},allowed),/Only explicitly/);
 assert.throws(()=>addInquiryVisit(emptyInquiryTrail(),{accession:allowed[0],title:'',stageId:'observe'},allowed),/display title/);
 assert.throws(()=>composeInquiryEpisode({accession:'anything'},'invented'),/recognized/);
});
test('exports only authored metadata, no user questions or location fields, with capped trail',()=>{
 let trail=emptyInquiryTrail();
 for(let i=0;i<32;i++)trail=visit(trail,i%2,INQUIRY_STAGES[i%5].id);
 assert.equal(trail.visits.length,JOURNEY_CAP);
 const data=exportInquiryTrail(trail);
 assert.equal(data.containsUserText,false);
 assert.equal(data.museumEndorsement,false);
 assert.ok(data.visits.every(x=>Object.keys(x).sort().join(',')==='accession,kind,question,stageId,title'));
 assert.ok(!JSON.stringify(data).includes('DEMO-BOX'));
 assert.ok(!JSON.stringify(data).includes('coordinates'));
});
test('UI presents mission, optional export, clear, and no automatically persistent visitor data',async()=>{
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(new URL('../demo/storage-volume/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../demo/storage-volume/storage.mjs',import.meta.url),'utf8');
 const build=await readFile(new URL('../scripts/assemble-public-site.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
 for(const id of ['trail-status','trail-list','follow-question','compare-object','clear-trail','download-trail'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('https://wolfsonian.org/about/'));
 for(const name of ['composeInquiryEpisode','addInquiryVisit','exportInquiryTrail','summarizeInquiryTrail'])assert.ok(js.includes(name));
 assert.ok(build.includes("'src/inquiry-journey.mjs'"));
 assert.ok(server.includes('inquiry-journey'));
 assert.ok(!/localStorage|sessionStorage|fetch\(|sendBeacon\(|navigator\.sendBeacon/.test(js));
});
