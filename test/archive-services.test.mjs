import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { handleArchiveService,LOOKUP,boundedBytes } from '../server/archive-services.mjs';
const token='TEST_ONLY_PRIVATE_DEMO_TOKEN_12345';
const base={ARCHIVE_DEMO_ACCESS_TOKEN:token};
async function invoke(kind,{env=base,method=kind==='voice'?'POST':'GET',body,headers={},url='/api/archive-society/'+kind,fetchImpl=()=>{throw new Error('Unexpected external call');}}={}) {
  const req=Readable.from(body===undefined?[]:[JSON.stringify(body)]);
  Object.assign(req,{method,url,headers:{host:'localhost:8787',authorization:'Bearer '+token,...headers}});
  let bytes;const responseHeaders={};
  const res={setHeader:(k,v)=>responseHeaders[k.toLowerCase()]=v,end:b=>{bytes=Buffer.from(b||'');}};
  await handleArchiveService(kind,req,res,{env,fetchImpl});
  return {status:res.statusCode,headers:responseHeaders,bytes,json:()=>JSON.parse(bytes.toString())};
}
test('services fail closed with no server token and reject Unicode bearer mismatch',async()=>{
  assert.equal((await invoke('status',{env:{}})).status,503);
  assert.equal((await invoke('status',{headers:{authorization:'Bearer '+token.slice(1)+'é'}})).status,401);
});
test('origin, method and disabled provider gates precede external calls',async()=>{
  assert.equal((await invoke('status',{headers:{origin:'https://wrong.example'}})).status,403);
  assert.equal((await invoke('voice',{method:'GET'})).status,405);
  assert.equal((await invoke('voice',{body:{text:'test'}})).json().error,'ELEVENLABS_DISABLED');
});
test('Lakehouse requires a verified query contract; invented IDs are rejected',async()=>{
  const env={...base,ARCHIVE_ENABLE_LAKEHOUSE:'1'};
  assert.equal((await invoke('lakehouse',{env,url:'/?accession=TEST2026.1'})).json().error,'LOOKUP_CONTRACT_NEEDED');
  assert.equal((await invoke('lakehouse',{env,url:'/?accession=FICTION-01'})).status,400);
});
test('bounded approved lookup uses a fixed host and never substitutes internal routes',async()=>{
  const env={...base,ARCHIVE_ENABLE_LAKEHOUSE:'1',LAKEHOUSE_ACCESSION_PARAM:'test_filter',LAKEHOUSE_LIMIT_PARAM:'test_limit'};
  let request;
  const r=await invoke('lakehouse',{env,url:'/?accession=85.7.383a%2Cb',fetchImpl:async(url,options)=>{
    request={url:String(url),options};return new Response(JSON.stringify([{'Accession Number':'85.7.383a,b',Date:'TEST ONLY'}]),{headers:{'content-type':'application/json'}});
  }});
  assert.equal(r.status,200);assert.ok(request.url.startsWith(LOOKUP+'?'));assert.equal(new URL(request.url).searchParams.get('test_limit'),'5');
  assert.equal(request.options.redirect,'error');assert.equal(r.json().status,'EXACT_PRIMARY_ACCESSION');assert.equal(r.headers['cache-control'],'no-store');
});
test('upstream 403 is reported once, without pretending it is a record no-match',async()=>{
  let calls=0;const env={...base,ARCHIVE_ENABLE_LAKEHOUSE:'1',LAKEHOUSE_ACCESSION_PARAM:'test_filter',LAKEHOUSE_LIMIT_PARAM:'test_limit'};
  const r=await invoke('lakehouse',{env,url:'/?accession=TEST2026.1',fetchImpl:async()=>{calls++;return new Response('blocked',{status:403});}});
  assert.equal(calls,1);assert.equal(r.json().error,'LAKEHOUSE_HTTP_403');
});
test('streaming byte cap works even without Content-Length',async()=>{
  const c=new AbortController(),response=new Response(new ReadableStream({start(s){s.enqueue(new Uint8Array(10));s.enqueue(new Uint8Array(10));s.close();}}));
  await assert.rejects(boundedBytes(response,15,c),/bounded/);assert.equal(c.signal.aborted,true);
});
test('voice has fixed server-owned role IDs and requires external approval',async()=>{
  const env={...base,ARCHIVE_ENABLE_ELEVENLABS:'1',ELEVENLABS_API_KEY:'TEST_ONLY_NOT_A_REAL_KEY',ELEVENLABS_VOICE_A_ID:'test_voice'};
  assert.equal((await invoke('voice',{env,body:{text:'TEST ONLY',role:'objectA'}})).json().error,'EXTERNAL_APPROVAL_REQUIRED');
  assert.equal((await invoke('voice',{env,body:{text:'TEST ONLY',role:'objectA',confirmed:true,voice_id:'client_override'}})).status,400);
  let captured;
  const r=await invoke('voice',{env,body:{text:'TEST ONLY',role:'objectA',confirmed:true},fetchImpl:async(url,options)=>{captured={url,options};return new Response(new Uint8Array([73,68,51]),{headers:{'content-type':'audio/mpeg'}});}});
  assert.equal(r.status,200);assert.match(captured.url,/text-to-speech\/test_voice/);assert.equal(JSON.parse(captured.options.body).text,'TEST ONLY');
  assert.ok(!r.bytes.toString().includes('KEY'));assert.equal(r.headers['cache-control'],'no-store');
});
