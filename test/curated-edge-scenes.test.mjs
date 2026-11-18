import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CURATED_EDGE_SCENES,sceneForConfirmedEdge} from '../src/curated-edge-scenes.mjs';
import {PRESENTATION_PAIRS} from '../src/presentation-pairs.mjs';
import {conversationFor} from '../src/archive-society.mjs';

const nk=x=>String(x||'').replace(/\s+/g,'').toUpperCase();
const key=(a,b)=>[nk(a),nk(b)].sort().join('::');
const makeEdge=(a,b,family,value)=>({
  id:a+'::'+b,source:a,target:b,
  reasons:[{family,value,sourceColumns:['Thematic Category 1'],targetColumns:['Thematic Category 2'],candidateCount:2}],
  classification:'shared_staff_metadata',historicalRelationshipEstablished:false
});
const fakeObject=(id)=>({accession:id,title:'Test record '+id,source:'synthetic',objectType:'Test',tags:[]});

test('the public expansion brings the registry to twenty distinct source-gated scripts',()=>{
  assert.equal(CURATED_EDGE_SCENES.length,20);
  assert.equal(CURATED_EDGE_SCENES.filter(s=>s.group==='opening').length,6);
  assert.equal(CURATED_EDGE_SCENES.filter(s=>s.mode==='question_edge').length,2);
  assert.equal(new Set(CURATED_EDGE_SCENES.map(s=>key(...s.pair))).size,20);
  assert.equal(PRESENTATION_PAIRS.length,12);
  for(const item of PRESENTATION_PAIRS){
    const scene=sceneForConfirmedEdge(item.source,item.target,[{family:item.family,value:item.tag}]);
    assert.ok(scene, 'Presentation edge must have script '+item.source+'/'+item.target);
  }
});

test('all scripts require the exact metadata family and value before speaking',()=>{
 for(const scene of CURATED_EDGE_SCENES){
  assert.equal(scene.historicalRelationshipEstablished,false);
  assert.equal(scene.status,'EDITORIAL_DRAFT_NOT_APPROVED');
  assert.equal(scene.requires.kind,'shared_staff_metadata');
  assert.ok(scene.turns.length===3||scene.turns.length===5);
  const assisted=scene.group==='public-expansion';
  if(!assisted)assert.ok(scene.turns.some(turn=>turn.speakerAccession==='archivist'));
  assert.ok(scene.arc.length>=10&&scene.next.length>=10&&scene.editorialNote.length>=20);
  assert.ok(scene.turns.every(t=>t.kind===(assisted?'AI_ASSISTED_INTERPRETATION':'ARTIST_AUTHORED_INTERPRETATION')&&t.text.length>=35));
  const evidence=[{family:scene.requires.family,value:scene.requires.value}];
  const forward=sceneForConfirmedEdge(...scene.pair,evidence);
  const reversed=sceneForConfirmedEdge(scene.pair[1],scene.pair[0],evidence);
  assert.ok(forward&&reversed);
  assert.deepEqual(forward.turns.map(t=>t.role),scene.turns.map(t=>t.speakerAccession==='archivist'?'archivist':nk(t.speakerAccession)===nk(scene.pair[0])?'objectA':'objectB'));
  assert.deepEqual(reversed.turns.map(t=>t.role),scene.turns.map(t=>t.speakerAccession==='archivist'?'archivist':nk(t.speakerAccession)===nk(scene.pair[0])?'objectB':'objectA'));
  assert.deepEqual(forward.turns.map(t=>t.text),reversed.turns.map(t=>t.text));
  assert.equal(sceneForConfirmedEdge(...scene.pair,[]),null);
  assert.equal(sceneForConfirmedEdge(...scene.pair,[{family:'motif',value:'Unrelated'}]),null);
  assert.equal(sceneForConfirmedEdge(...scene.pair,[{family:'theme',value:'Unrelated'}]),null);
 }
 assert.equal(sceneForConfirmedEdge('NONEXISTENT','ANY',[{family:'theme',value:'Labor'}]),null);
 assert.equal(sceneForConfirmedEdge('85.4.64.34','85.4.64.34',[{family:'motif',value:'Women'}]),null);
});

test('actual On Munitions opening edges use distinct dialogue, with metadata as the limit',()=>{
  const opening=CURATED_EDGE_SCENES.filter(s=>s.group==='opening');
  const results=opening.map(s=>{
    const c=conversationFor(fakeObject(s.a),fakeObject(s.b),makeEdge(s.a,s.b,s.family,s.tag),'family');
    assert.equal(c.mode,'CURATED_EDGE_SCENE');
    assert.equal(c.editorialStatus,'EDITORIAL_DRAFT_NOT_APPROVED');
    assert.equal(c.historicalRelationshipEstablished,false);
    assert.equal(c.evidence[0].value,s.tag);
    assert.deepEqual(c.scriptBasis,{family:s.family,value:s.tag});
    assert.ok(c.turns.length===3||c.turns.length===5);
    assert.equal(c.turns[0].role,'objectA');
    assert.equal(c.turns[1].role,'objectB');
    assert.ok(c.turns.some(t=>t.role==='archivist'));
    assert.ok(c.dramaticArc.length>10);
    assert.ok(c.nextPrompt.length>10);
    assert.ok(c.limits.includes('not a documented relationship'));
    assert.ok(c.turns.every(t=>!t.citations?.length));
    return c.turns.map(t=>t.text).join(' ');
  });
  assert.equal(new Set(results).size,6);
});

test('weak trees and water connections deliberately question the algorithm',()=>{
 const weak=CURATED_EDGE_SCENES.filter(s=>s.mode==='question_edge');
 assert.equal(weak.length,2);
 for(const s of weak){
  const c=conversationFor(fakeObject(s.a),fakeObject(s.b),makeEdge(s.a,s.b,s.family,s.tag),'archivist');
  assert.equal(c.edgeMode,'question_edge');
  assert.match(c.turns[2].text,/No documented|Not enough|not establish|unproven/i);
  assert.match(c.nextPrompt,/withdraw|reject/i);
 }
});

test('unscripted edges use theme-specific or motif-only editorial fallback without pretending to be facts',()=>{
 const a=fakeObject('EXAMPLE-A'),b=fakeObject('EXAMPLE-B');
 const theme=conversationFor(a,b,makeEdge(a.accession,b.accession,'theme','Technology'),'worker');
 const motif=conversationFor(a,b,makeEdge(a.accession,b.accession,'motif','Trees'),'worker');
 assert.equal(theme.mode,'scripted_interpretation');
 assert.equal(theme.edgeMode,'THEMATIC_COMPARISON');
 assert.equal(motif.edgeMode,'QUESTION_THIS_LINK');
 assert.ok(motif.nextPrompt.includes('withdraw'));
 assert.equal(theme.historicalRelationshipEstablished,false);
 assert.equal(motif.historicalRelationshipEstablished,false);
 assert.equal(theme.turns.length,5);
 assert.equal(motif.turns.length,5);
 assert.ok(theme.turns.every(t=>t.role==='objectA'||t.role==='objectB'||t.role==='archivist'));
});

test('frontend renders editorial arc, source-based explanation and visitor question safely',async()=>{
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
 assert.match(js,/CURATED_EDGE_SCENE/);
 assert.match(js,/c\.dramaticArc/);
 assert.match(js,/c\.nextPrompt/);
 assert.match(js,/dataset\.followObject/);
 assert.match(js,/dataset\.returnObject/);
 assert.match(js,/state\.journey/);
 assert.match(js,/c\.scriptBasis/);
 assert.match(js,/ARTIST-AUTHORED SCENE/);
 assert.match(js,/Inspect the reason for this edge/);
 assert.match(server,/curated-edge-scenes/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});

test('all four additional pairs open from the public directory with correctly attributed voices',async()=>{
  const {MATRIX_OBJECTS}=await import('../src/public-matrix-objects.mjs');
  const {matrixToRecords}=await import('../src/matrix-room.mjs');
  const {societyView}=await import('../src/archive-society.mjs');
  const {conversationEpisode}=await import('../src/conversation-orientation.mjs');
  const records=matrixToRecords(MATRIX_OBJECTS);
  const scenes=CURATED_EDGE_SCENES.filter(scene=>scene.group==='public-expansion');
  assert.equal(scenes.length,4);
  for(const scene of scenes){
    const source=records.find(r=>r.accession===scene.a);
    const target=records.find(r=>r.accession===scene.b);
    const edge=societyView(records,source.accession).edges.find(e=>e.target===target.accession);
    const episode=conversationEpisode({source,target,conversation:conversationFor(source,target,edge)});
    assert.equal(episode.question,scene.arc);
    assert.equal(episode.label,'AI-assisted script');
    assert.deepEqual(episode.turns.map(t=>t.role),['objectA','objectB','objectA']);
    assert.ok(episode.turns.every(t=>t.kind==='AI_ASSISTED_INTERPRETATION'));
  }
});


test('the two weak-link challenge scenes ask visitor questions without showing editorial withdraw controls as titles',async()=>{
 const {conversationEpisode}=await import('../src/conversation-orientation.mjs');
 const named=new Map([
  ['challenge-robeson-architectural-fantasy','Can a tree connect Paul Robeson to an imagined house?'],
  ['challenge-utrecht-living-rise','Can water connect a trade fair to Let the Living Rise?']
 ]);
 for(const scene of CURATED_EDGE_SCENES.filter(s=>s.mode==='question_edge')){
  const c=conversationFor(fakeObject(scene.a),fakeObject(scene.b),makeEdge(scene.a,scene.b,scene.family,scene.tag));
  const episode=conversationEpisode({source:fakeObject(scene.a),target:fakeObject(scene.b),conversation:c});
  assert.equal(episode.question,named.get(scene.id));
  assert.doesNotMatch(episode.question,/withdraw|reject|edge|algorithm/i);
  assert.match(c.nextPrompt,/withdraw|reject/i,'Internal editorial boundary remains available');
  assert.equal(episode.historicalRelationshipEstablished,false);
 }
});
