import test from 'node:test';
import assert from 'node:assert/strict';
import {CURATED_EDGE_SCENES} from '../src/curated-edge-scenes.mjs';
import {conversationFor} from '../src/archive-society.mjs';
import {POETIC_OBJECT_LINES,CONVERSATION_TONES,normalizeTone,withConversationTone} from '../src/conversation-tones.mjs';
import {directConversation} from '../src/conversation-performance.mjs';
import {audioCues} from '../scripts/export-curated-audio-cues.mjs';

const record=id=>({accession:id,title:'Test '+id,tags:[],source:'synthetic'});
function conversation(scene){
  return conversationFor(record(scene.a),record(scene.b),{
    id:scene.a+'::'+scene.b,source:scene.a,target:scene.b,
    reasons:[{family:scene.requires.family,value:scene.requires.value,
      sourceColumns:['Thematic Category 1'],targetColumns:['Thematic Category 2'],candidateCount:2}],
    historicalRelationshipEstablished:false,classification:'shared_staff_metadata'
  },'family');
}
const voices=n=>Array.from({length:n},(_,i)=>({
  name:'Installed '+i,voiceURI:'voice-'+i,lang:'en-US',localService:true
}));

test('two deliberate tones cover every authored scene without changing Archivist evidence',()=>{
  assert.deepEqual(Object.keys(CONVERSATION_TONES).sort(),['critical','poetic']);
  assert.deepEqual(Object.keys(POETIC_OBJECT_LINES).sort(),CURATED_EDGE_SCENES.map(s=>s.id).sort());
  for(const scene of CURATED_EDGE_SCENES){
    const canonical=conversation(scene),critical=withConversationTone(canonical,'critical');
    const poetic=withConversationTone(canonical,'poetic');
    assert.equal(critical,canonical,'critical preserves original object and sources');
    assert.equal(poetic.turns.length,3);
    assert.equal(poetic.tone,'poetic');
    assert.notEqual(poetic.turns[0].text,critical.turns[0].text);
    assert.notEqual(poetic.turns[1].text,critical.turns[1].text);
    assert.equal(poetic.turns[2].text,critical.turns[2].text);
    assert.deepEqual(poetic.evidence,critical.evidence);
    assert.equal(poetic.source,critical.source);
    assert.equal(poetic.target,critical.target);
    assert.equal(poetic.historicalRelationshipEstablished,false);
    assert.equal(poetic.resourceLayer,critical.resourceLayer);
    assert.deepEqual(poetic.turns.map(t=>t.role),critical.turns.map(t=>t.role));
    assert.deepEqual(poetic.turns.map(t=>t.citations),critical.turns.map(t=>t.citations));
    assert.deepEqual(canonical.turns,critical.turns,'pure transform cannot mutate source');
  }
});

test('metadata-only fallback never turns into invented poetry or new evidence',()=>{
  const c={id:'metadata-fallback',mode:'scripted_interpretation',
    source:'A',target:'B',evidence:[{family:'motif',value:'Trees'}],
    turns:[{role:'objectA',text:'A'},{role:'objectB',text:'B'},{role:'archivist',text:'Unverified'}]};
  assert.equal(withConversationTone(c,'poetic'),c);
  assert.equal(normalizeTone('unexpected'),'critical');
  assert.equal(normalizeTone('poetic'),'poetic');
});

test('one recognizable Archivist voice remains identical across scenes and tones by default',()=>{
  const v=voices(8);
  const ids=new Set();
  for(const scene of CURATED_EDGE_SCENES){
    const c=conversation(scene);
    for(const tone of ['critical','poetic']){
      const p=directConversation(withConversationTone(c,tone),v,{},{style:'scene-variety',tone});
      assert.equal(p.archivistMode,'single');
      ids.add(p.turns[2].voiceURI);
      assert.equal(p.turns[2].rate,0.89);
      assert.equal(p.turns[2].pitch,0.96);
    }
  }
  assert.equal(ids.size,1,'a single institutional voice is the default');
});

test('experimental plural Archivists can vary while remaining strictly device-local',()=>{
  const v=voices(8),ids=new Set();
  for(const scene of CURATED_EDGE_SCENES){
    const p=directConversation(conversation(scene),v,{},{archivistMode:'plural'});
    assert.equal(p.archivistMode,'plural');
    ids.add(p.turns[2].voiceURI);
    assert.ok(p.turns.every(t=>t.voice?.localService===true));
  }
  assert.ok(ids.size>1,'the optional plurality must be a working alternative');
});

test('poetic performance slows only object readings, never the Archivist evidence voice',()=>{
  const c=conversation(CURATED_EDGE_SCENES[0]);
  const critical=directConversation(c,voices(8),{},{tone:'critical'});
  const poetic=directConversation(withConversationTone(c,'poetic'),voices(8),{},{tone:'poetic'});
  assert.ok(poetic.turns[0].rate<critical.turns[0].rate);
  assert.ok(poetic.turns[1].rate<critical.turns[1].rate);
  assert.equal(poetic.turns[2].rate,critical.turns[2].rate);
  assert.equal(poetic.turns[2].voiceURI,critical.turns[2].voiceURI);
});

test('offline audio cue exporter supports both tone scripts with separate immutable filenames',()=>{
  const a=audioCues({tone:'critical'}),b=audioCues({tone:'poetic'});
  assert.equal(a.tone,'critical');assert.equal(b.tone,'poetic');
  const aTurns=a.scenes.flatMap(s=>s.turns),bTurns=b.scenes.flatMap(s=>s.turns);
  assert.equal(aTurns.length,48);assert.equal(bTurns.length,48);
  assert.equal(new Set([...aTurns,...bTurns].map(t=>t.proposedFile)).size,96);
  for(let i=0;i<48;i++){
    assert.ok(aTurns[i].proposedFile.startsWith('audio/critical/'));
    assert.ok(bTurns[i].proposedFile.startsWith('audio/poetic/'));
    if(i%3===2)assert.equal(aTurns[i].text,bTurns[i].text);
    else assert.notEqual(aTurns[i].text,bTurns[i].text);
    assert.equal(aTurns[i].status,'NOT_RENDERED');
    assert.equal(bTurns[i].status,'NOT_RENDERED');
  }
});
