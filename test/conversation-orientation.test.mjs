import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {explainEncounter} from '../src/conversation-orientation.mjs';
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
 assert.match(js,/Linked by shared/);
 assert.match(css,/\.encounter-orientation\{/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(build,/src\/conversation-orientation\.mjs/);
 assert.match(serve,/conversation-orientation/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
