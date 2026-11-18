import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {explainEncounter,conversationEpisode,connectionCaption,visitorFollowUp} from '../src/conversation-orientation.mjs';
import {CURATED_EDGE_SCENES} from '../src/curated-edge-scenes.mjs';
import {conversationFor} from '../src/archive-society.mjs';
const rec=(id,title)=>({accession:id,title,source:'synthetic'});
const edge=(a,b,family,value)=>({
 id:a+'::'+b,
 reasons:[{family,value,sourceColumns:['Thematic Category 1'],targetColumns:['Thematic Category 2']}]
});
test('two chosen neighbors provide different human-readable stakes and document their shared tag',()=>{
 const source=rec('85.4.64.34','On Munitions: Skilled Work');
 const a=rec('85.4.64.43','Making the Engine');
 const b=rec('TD1989.317.66',"Exhibition of Women's Labor (lottery)");
 const ca=conversationFor(source,a,edge(source.accession,a.accession,'motif','Factories'),'family');
 const cb=conversationFor(source,b,edge(source.accession,b.accession,'motif','Women'),'family');
 const first=explainEncounter({source,target:a,conversation:ca,lensLabel:'Family'});
 const second=explainEncounter({source,target:b,conversation:cb,lensLabel:'Family',previous:first});
 assert.match(first.evidenceBasis,/Factories/);
 assert.match(second.evidenceBasis,/Women/);
 assert.notEqual(first.question,second.question);
 assert.notEqual(first.targetName,second.targetName);
 assert.match(second.changed,/Previously:.*Now:/);
 assert.match(second.changed,/Making the Engine/);
 assert.match(second.changed,/Labor/);
 assert.equal(first.type,'PAIR-SPECIFIC SCENE');
 assert.match(first.frame,/does not change its script/);
 assert.match(first.boundary,/not evidence of historical contact/);
 assert.equal(first.evidenceBasis.includes('proof they met'),true);
});
test('generic scripted comparisons disclose their reused form and chosen lens',()=>{
 const a=rec('A','Object A'),b=rec('B','Object B');
 const c=conversationFor(a,b,edge('A','B','theme','Labor'),'worker');
 const story=explainEncounter({source:a,target:b,conversation:c,lensLabel:'Worker'});
 assert.equal(story.type,'TAG-BASED SCRIPT');
 assert.match(story.form,/template/);
 assert.match(story.form,/can repeat/);
 assert.match(story.frame,/Worker/);
 assert.match(story.evidenceBasis,/Labor/);
 assert.match(story.changed,/Choose another object/);
});
test('editorial research juxtaposition is explicitly not a catalog match',()=>{
 const source=rec('RESEARCH-A','Research A'),target=rec('RESEARCH-B','Research B');
 const c={id:'curatorial-one',relationshipType:'curatorial_juxtaposition',mode:'CURATORIAL_JUXTAPOSITION',dramaticArc:'Whose future gets shown?',nextPrompt:'',evidence:[]};
 const s=explainEncounter({source,target,conversation:c});
 assert.equal(s.type,'ARTIST-PROPOSED PAIR');
 assert.match(s.evidenceBasis,/not a catalog match/);
 assert.match(s.frame,/research path/);
});
test('no source identity or scene yields an explanation',()=>{
 assert.throws(()=>explainEncounter({}),/selected source/);
 assert.throws(()=>explainEncounter({source:{title:'fake'},target:{accession:'B'},conversation:{}}),/selected source/);
});
test('visible UI includes evidence/question/change explanations on both conversational paths',async()=>{
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
 const build=await readFile(new URL('../scripts/assemble-public-site.mjs',import.meta.url),'utf8');
 const serve=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
 for(const text of ['Why these two?','What are they exploring?','What changes when you choose another?','How this conversation was written'])assert.ok(js.includes(text));
 assert.ok(js.includes('addEncounterOrientation(box,source,target,c);'));
 assert.ok(js.match(/addEncounterOrientation\(box,source,target,c\);/g).length===2);
 assert.match(js,/episode\.rationale/);
 assert.match(css,/\.encounter-orientation\{/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(build,/src\/conversation-orientation\.mjs/);
 assert.match(serve,/conversation-orientation/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});

test('one episode carries an exact pair, editorial question and truthful source status across lenses',()=>{
 const source=rec('85.4.64.43','Making the Engine'),target=rec('TD1989.318.1','Grind safely [A splinter can cost an eye]');
 const link=edge(source.accession,target.accession,'motif','Machines');
 const make=lens=>conversationEpisode({source,target,conversation:conversationFor(source,target,link,lens)});
 const family=make('family'),worker=make('worker');
 assert.equal(family.question,'Who pays the price of progress?');
 assert.equal(family.id,worker.id);
 assert.deepEqual(family.turns,worker.turns);
 assert.equal(family.mode,'CURATED_SCRIPT');
 assert.equal(family.sourceStatus,'LOCAL_INPUT');
 assert.deepEqual(family.participants.map(p=>p.accession),[source.accession,target.accession]);
 assert.equal(family.participants[1].shortName,'Safety warning');
 assert.equal(family.participants[1].title,target.title);
 assert.equal(family.historicalRelationshipEstablished,false);
 assert.match(family.editorialStatus,/NOT_APPROVED/);
});
test('a template becomes an unvoiced research prompt; a tag never verifies a catalog relationship',()=>{
 const source={...rec('A','Object A'),source:'matrix'},target={...rec('B','Object B'),source:'matrix'};
 const c=conversationFor(source,target,edge('A','B','motif','Trees'),'worker');
 const episode=conversationEpisode({source,target,conversation:c});
 assert.equal(episode.mode,'RESEARCH_PROMPT');assert.deepEqual(episode.turns,[]);
 assert.equal(episode.sourceStatus,'STAFF_METADATA');
 assert.match(episode.question,/Trees/);
 assert.equal(episode.historicalRelationshipEstablished,false);
 assert.equal(episode.relationship.type,'SHARED_TAG');
});
test('artist proposals remain separate from shared tags and verified identities',()=>{
 const source=rec('A','First'),target=rec('B','Second');
 const episode=conversationEpisode({source,target,conversation:{mode:'CURATORIAL_JUXTAPOSITION',relationshipType:'curatorial_juxtaposition',turns:[],nextPrompt:'Who is absent?'}});
 assert.equal(episode.sourceStatus,'ARTIST_PROPOSAL');
 assert.equal(episode.question,'Who is absent?');
 assert.equal(episode.relationship.type,'ARTIST_COMPARISON');
 assert.equal(episode.relationship.term,null);
 assert.match(episode.rationale,/Not a catalog match/);
});

test('the room subtitle names its real basis, while the about page explains the fictional format',async()=>{
 const source=rec('85.4.64.43','Making the Engine'),target=rec('TD1989.318.1','Safety warning');
 const actual=conversationFor(source,target,edge(source.accession,target.accession,'motif','Machines'),'family');
 const episode=conversationEpisode({source,target,conversation:actual});
 assert.equal(connectionCaption({episode}),'Both records include “Machines” · no historical link established');
 const curatorial=conversationEpisode({source:rec('A','First'),target:rec('B','Second'),
   conversation:{mode:'CURATORIAL_JUXTAPOSITION',relationshipType:'curatorial_juxtaposition',turns:[],nextPrompt:'Why this pairing?'}});
 const proposed=connectionCaption({episode:curatorial,proposal:'These two printed artifacts use different media to narrate the future. The pairing does not establish that their visitors met.'});
 assert.match(proposed,/^Artist-proposed connection · These two printed artifacts/);
 assert.ok(proposed.length<175);
 assert.match(connectionCaption({episode:curatorial}),/Not a catalog match/);
 assert.throws(()=>connectionCaption({}),/episode is required/);
 const about=await readFile(new URL('../demo/about/index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 assert.match(about,/<h2>A conversation between two objects<\/h2>/);
 assert.match(about,/Neither establishes historical contact or influence/);
 assert.match(app,/connectionCaption\(\{episode,proposal:state.researchPath\?\.proposal\}\)/);
 assert.doesNotMatch(app,/room-description'\)\.textContent=episode\.mode/);
});


test('about explains authored scene, shared motif and imagined comparison outside discovery cards',async()=>{
 const about=await readFile(new URL('../demo/about/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 for(const heading of ['Authored scene','Shared motif','Imagined comparison']){
  assert.ok(about.includes('<h3>'+heading+'</h3>'),heading+' explained in About');
 }
 assert.match(about,/decision to keep or withdraw a network edge belongs to the editorial process/);
 assert.doesNotMatch(js,/meta\.append\(node\('span',episode\.label\)\)/);
 assert.match(js,/\['Conversations',scenes\]/);
 assert.match(js,/\['Proposed pairings',comparisons\]/);
 assert.match(js,/\['Open questions',prompts\]/);
 assert.match(js,/\$\('room-rationale'\)\.textContent='Why these two\? ↗'/);
});


test('internal withdraw-edge editorial choices are not exposed as visitor prompts',()=>{
 const c={edgeMode:'question_edge',nextPrompt:'Keep the comparison as a question, or withdraw this edge?'};
 assert.match(c.nextPrompt,/withdraw this edge/);
 assert.equal(visitorFollowUp(c),'What evidence beyond a shared motif would make this connection convincing?');
 assert.doesNotMatch(visitorFollowUp(c),/withdraw|reject|edge/);
 assert.equal(visitorFollowUp({edgeMode:'QUESTION_THIS_LINK',nextPrompt:'Reject the link?'}),visitorFollowUp(c));
 assert.equal(visitorFollowUp({edgeMode:'contest',nextPrompt:'What would the publisher say?'}),'What would the publisher say?');
});
