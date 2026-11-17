import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CURATED_EDGE_SCENES} from '../src/curated-edge-scenes.mjs';
import {conversationFor} from '../src/archive-society.mjs';
import {directConversation,PERFORMANCE_SCORE,DELIVERY} from '../src/conversation-performance.mjs';

const speakers=(count=8)=>Array.from({length:count},(_,i)=>({
  voiceURI:'installed-'+i,name:'Local '+i,lang:'en-US',localService:true
}));
const remote={voiceURI:'remote',name:'Cloud',lang:'en-US',localService:false};
const record=a=>({accession:a,title:'Record '+a,tags:[],source:'test'});
const sceneConversation=(scene,reverse=false)=>{
  const source=reverse?scene.b:scene.a,target=reverse?scene.a:scene.b;
  const reason={family:scene.requires.family,value:scene.requires.value,sourceColumns:['Test'],targetColumns:['Test']};
  return conversationFor(record(source),record(target),{
    id:source+'::'+target,reasons:[reason],
    source,target,classification:'shared_staff_metadata',
    historicalRelationshipEstablished:false
  },'family');
};

test('all 16 authored scenes receive a 3-beat directional score without affecting their evidence',()=>{
  assert.deepEqual(Object.keys(PERFORMANCE_SCORE).sort(),CURATED_EDGE_SCENES.map(s=>s.id).sort());
  for(const scene of CURATED_EDGE_SCENES){
    const conversation=sceneConversation(scene);
    const p=directConversation(conversation,speakers());
    assert.equal(p.sceneId,scene.id);
    assert.equal(p.turns.length,3);
    assert.equal(p.localOnly,true);
    assert.equal(conversation.historicalRelationshipEstablished,false);
    assert.equal(p.editorialQuestion,PERFORMANCE_SCORE[scene.id].question);
    assert.ok(p.tension.length>10);
    assert.deepEqual(p.turns.map(part=>part.delivery),PERFORMANCE_SCORE[scene.id].beat);
    assert.ok(p.turns.every(part=>DELIVERY[part.delivery]&&part.rate>=.85&&part.rate<=1.1));
    assert.ok(p.turns.every(part=>part.pitch>=.9&&part.pitch<=1.1));
  }
});

test('with 8 installed voices each scene has contrasting readers and replays exactly the same cast',()=>{
  const voices=[remote,...speakers()];
  for(const scene of CURATED_EDGE_SCENES){
    const c=sceneConversation(scene);
    const a=directConversation(c,voices),b=directConversation(c,voices);
    assert.deepEqual(a.turns.map(p=>p.voiceURI),b.turns.map(p=>p.voiceURI));
    assert.equal(new Set(a.turns.map(p=>p.voiceURI)).size,3);
    assert.ok(a.turns.every(p=>p.voice?.localService===true&&p.voiceURI!=='remote'));
  }
});

test('scene variety produces more than one performance for same object across its opening encounters',()=>{
  const opening=CURATED_EDGE_SCENES.filter(s=>s.group==='opening');
  const voices=speakers(8),varied=new Set(),continuous=new Set();
  for(const scene of opening){
    const c=sceneConversation(scene);
    const variedPlan=directConversation(c,voices,{},{style:'scene-variety'});
    const stablePlan=directConversation(c,voices,{},{style:'continuity'});
    const find=(plan)=>plan.turns.find(t=>t.speakerId==='85.4.64.34')?.voiceURI;
    varied.add(find(variedPlan));
    continuous.add(find(stablePlan));
  }
  assert.ok(varied.size>=2,'Scene-specific variety should be meaningful');
  assert.equal(continuous.size,1,'Continuity should preserve absolute accession identity');
});

test('reversed object orientation keeps the same voice for each physical accession within scene',()=>{
  const scene=CURATED_EDGE_SCENES[4],voices=speakers(8);
  const f=directConversation(sceneConversation(scene,false),voices);
  const r=directConversation(sceneConversation(scene,true),voices);
  const byId=p=>new Map(p.turns.map(t=>[t.speakerId,t.voiceURI]));
  assert.deepEqual([...byId(f)].sort(),[...byId(r)].sort());
  assert.equal(r.turns[0].role,'objectB');
  assert.equal(r.turns[1].role,'objectA');
});

test('manual overrides only accept installed local voices; missing voices degrade to silent transcript',()=>{
  const scene=sceneConversation(CURATED_EDGE_SCENES[0]);
  const p=directConversation(scene,[remote,...speakers(4)],{objectA:'installed-3',objectB:'remote'});
  assert.equal(p.turns[0].voiceURI,'installed-3');
  assert.notEqual(p.turns[1].voiceURI,'remote');
  const none=directConversation(scene,[remote]);
  assert.ok(none.turns.every(t=>t.voice===null&&t.engine==='browser-local-only'));
  const single=directConversation(scene,speakers(1));
  assert.ok(single.turns.every(t=>t.voiceURI==='installed-0'));
});

test('unknown metadata fallback is intentionally source-neutral and receives no approved scene claims',()=>{
  const c={id:'fallback-graph-edge',source:'A',target:'B',turns:[
    {role:'objectA',text:'Interpretive title question'},
    {role:'objectB',text:'Comparative question'},
    {role:'archivist',text:'Metadata is not proof'}
  ]};
  const p=directConversation(c,speakers(2));
  assert.equal(p.editorialQuestion,null);
  assert.equal(p.tension,null);
  assert.deepEqual(p.turns.map(t=>t.delivery),['observe','question','document']);
});

test('the local exhibition server serves the director module to the browser',async()=>{
  const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
  assert.match(server,/conversation-performance/);
});
