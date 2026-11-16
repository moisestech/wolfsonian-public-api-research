import test from 'node:test';
import assert from 'node:assert/strict';
import {voiceRole,localEnglishVoices,castLocalConversation,waitForLocalEnglishVoices} from '../src/voice-cast.mjs';

const voices = [
  {name:'One',voiceURI:'local:one',localService:true,lang:'en-US'},
  {name:'Two',voiceURI:'local:two',localService:true,lang:'en-GB'},
  {name:'Three',voiceURI:'local:three',localService:true,lang:'en-US'},
  {name:'Remote',voiceURI:'remote:four',localService:false,lang:'en-US'},
  {name:'Foreign',voiceURI:'local:spanish',localService:true,lang:'es-MX'}
];
const turns=[
  {role:'objectA',speaker:'Fruit Porters',text:'An archival record gives a date.'},
  {role:'objectB',speaker:'Other object',text:'Our shared tag is not history.'},
  {role:'archivist',speaker:'Archivist · fictional protocol',text:'Consult the original record.'}
];
test('three local English voices are distinct across object A, B and archivist',()=>{
  const cast=castLocalConversation(voices,turns);
  assert.equal(cast.installedLocalVoices,3);
  assert.equal(cast.distinctVoicesUsed,3);
  assert.deepEqual(cast.turns.map(t=>t.role),['objectA','objectB','archivist']);
  assert.deepEqual(new Set(cast.turns.map(t=>t.voice?.voiceURI)).size,3);
  assert.ok(cast.turns[0].rate < cast.turns[1].rate);
  assert.ok(cast.turns[0].pitch < cast.turns[1].pitch);
  assert.match(cast.disclosure,/3 distinct installed local voices/);
});
test('never selects remote speech or a language that does not match the English script',()=>{
  assert.equal(localEnglishVoices([voices[3],voices[4]]).length,0);
  const cast=castLocalConversation([voices[3],voices[4]],turns);
  assert.equal(cast.available,false);
  assert.ok(cast.turns.every(t=>t.voice===null));
  assert.match(cast.disclosure,/written transcript/);
});
test('one local voice clearly discloses pitch/rate-only character variation',()=>{
  const cast=castLocalConversation([voices[0]],turns);
  assert.equal(cast.distinctVoicesUsed,1);
  assert.match(cast.disclosure,/One installed local voice/);
  assert.notEqual(cast.turns[0].pitch,cast.turns[1].pitch);
});
test('all three available voices select deterministic roles regardless of incoming voice ordering',()=>{
  const first=castLocalConversation(voices,turns);
  const shuffled=castLocalConversation([...voices].reverse(),turns);
  assert.deepEqual(first.turns.map(x=>x.voiceName),shuffled.turns.map(x=>x.voiceName));
});
test('reader persona labels and Discovery Lab fiction roles map to contrasting profiles',()=>{
  assert.equal(voiceRole({speaker:'Worker'}),'worker');
  assert.equal(voiceRole({speaker:'Futurist'}),'futurist');
  assert.equal(voiceRole({speaker:'Limit'}),'limit');
  assert.equal(voiceRole({actor:'Historic item',role:'Fictional object voice 01'}),'objectA');
  assert.equal(voiceRole({actor:'Another item',role:'Fictional object voice 02'}),'objectB');
  assert.equal(voiceRole({actor:'Archivist',role:'Artist-authored interpretation'}),'archivist');
  const cast=castLocalConversation(voices,[
    {speaker:'Archivist'}, {speaker:'Worker'}, {speaker:'Limit'}]);
  assert.equal(cast.distinctVoicesUsed,3);
});
test('waits for late browser voiceschanged event without any external service',async()=>{
  let callback=null;
  const synth={
    voices:[],
    getVoices(){return this.voices;},
    addEventListener(event,fn){if(event==='voiceschanged')callback=fn;},
    removeEventListener(event,fn){if(callback===fn)callback=null;}
  };
  const promise=waitForLocalEnglishVoices(synth,500);
  synth.voices=[voices[0]];
  callback();
  const result=await promise;
  assert.equal(result.length,1);
  assert.equal(callback,null);
});
test('no mutation of script data or speech voice inventory',()=>{
  const prior=JSON.stringify(turns),list=JSON.stringify(voices);
  const c=castLocalConversation(voices,turns);
  assert.equal(JSON.stringify(turns),prior);
  assert.equal(JSON.stringify(voices),list);
  assert.ok(Object.isFrozen(c.turns));
});
