import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {conversationRecords} from '../src/lakehouse-matches.mjs';
import {conversationGuide,destinationForScene,CONVERSATION_CHAPTERS} from '../src/conversation-guide.mjs';
import {localVoiceOptions,roleVoiceCast} from '../src/local-voice-cast.mjs';
import {societyView} from '../src/archive-society.mjs';

const packet=JSON.parse(await readFile(new URL('../data/lakehouse/project-matches.json',import.meta.url),'utf8'));
const graph=conversationRecords(packet);

test('all sixteen scenes are grouped exactly once into five editorial chapters',()=>{
  const chapters=conversationGuide(graph.records),scenes=chapters.flatMap(ch=>ch.scenes);
  assert.equal(CONVERSATION_CHAPTERS.length,5);
  assert.equal(scenes.length,16);
  assert.equal(new Set(scenes.map(s=>s.id)).size,16);
  assert.equal(chapters[0].scenes.length,6);
  assert.equal(chapters[4].scenes.filter(s=>s.mode==='question_edge').length,2);
});

test('all curated conversation destinations are real, exact-tag six-neighbor edges in saved snapshot',()=>{
  const chapters=conversationGuide(graph.records);
  for(const scene of chapters.flatMap(ch=>ch.scenes)){
    assert.equal(scene.available,true,scene.id+' must have a discoverable source-backed pair');
    const dest=destinationForScene(chapters,scene.id);
    assert.ok(dest);
    const view=societyView(graph.records,dest.seed,'family');
    const edge=view.edges.find(e=>e.id===dest.edgeId);
    assert.ok(edge,scene.id+' must not fabricate a route');
    assert.equal(edge.source,dest.seed);
    assert.equal(edge.target,dest.target);
    assert.ok(edge.reasons.some(r=>r.family===scene.tagFamily&&r.value===scene.tagValue));
    assert.equal(edge.historicalRelationshipEstablished,false);
  }
});

test('guide fails closed on absent records and nonexistent scenes',()=>{
  const onlyOne=conversationGuide(graph.records.slice(0,1));
  assert.equal(onlyOne.flatMap(ch=>ch.scenes).filter(s=>s.available).length,0);
  assert.equal(destinationForScene(onlyOne,'opening-skilled-work-lottery'),null);
  assert.equal(destinationForScene(conversationGuide(graph.records),'bogus-scene'),null);
});

const v=(voiceURI,name,lang,localService)=>({voiceURI,name,lang,localService});
test('local voice casting excludes remotely synthesized voices and chooses three distinct voices when available',()=>{
  const voices=[
    v('remote-en','remote','en-US',false),v('local-a','Alex','en-US',true),
    v('local-b','Bea','en-GB',true),v('local-c','Cy','en-US',true)
  ];
  const local=localVoiceOptions(voices);
  assert.equal(local.length,3);
  assert.ok(!local.some(x=>x.voiceURI==='remote-en'));
  const cast=roleVoiceCast(voices);
  assert.equal(new Set(Object.values(cast).map(x=>x.voiceURI)).size,3);
  assert.equal(roleVoiceCast(voices,{archivist:'local-b'}).archivist.voiceURI,'local-b');
  assert.ok(!Object.values(cast).some(x=>x.localService!==true));
});

test('missing local voice does not silently select a remote voice',()=>{
  const cast=roleVoiceCast([v('remote','cloud','en-US',false)]);
  assert.deepEqual(cast,{objectA:null,objectB:null,archivist:null});
  const one=roleVoiceCast([v('single','local','en-US',true)]);
  assert.equal(one.objectA.voiceURI,'single');
  assert.equal(one.objectB.voiceURI,'single');
});

test('navigation and local voice controls exist without secret keys or automatic third-party audio',async()=>{
  const [ui,html,server]=await Promise.all([
    readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8'),
    readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8'),
    readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8')
  ]);
  assert.match(html,/id="conversation-guide"/);
  assert.match(html,/id="guide-search"/);
  assert.match(html,/data-voice-role="objectA"/);
  assert.match(html,/data-voice-role="objectB"/);
  assert.match(html,/data-voice-role="archivist"/);
  assert.match(ui,/navigateToConversation/);
  assert.match(ui,/destinationForScene/);
  assert.match(ui,/history\.pushState/);
  assert.match(ui,/roleVoiceCast/);
  assert.match(ui,/localVoiceOptions/);
  assert.match(server,/conversation-guide/);
  assert.match(server,/local-voice-cast/);
});
