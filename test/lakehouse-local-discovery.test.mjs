import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
  buildLocalLakehouseIndex,serializeLocalLakehouseIndex,rehydrateLocalLakehouseIndex,
  discoverLakehouse,listLakehouseObjects,localDiscoveryCensus,SEED_CONCEPTS
} from '../src/lakehouse-local-discovery.mjs';
import {
  optionsFromArgs,boundedRows,requestProbePage,runLocalDiscoveryProbe,READ_ONLY_ENDPOINT,
  MAX_PAGE_ROWS,MAX_RESPONSE_BYTES
} from '../scripts/probe-lakehouse-discovery.mjs';

const filename=new URL('./fixtures/lakehouse-probe.synthetic.json',import.meta.url);
const input=JSON.parse(await readFile(filename,'utf8'));
const index=buildLocalLakehouseIndex(input.data,{retrievedAt:'SYNTHETIC_TEST'});
test('all permitted rows remain discoverable even if isolated, unpictured, and silent',()=>{
  const census=localDiscoveryCensus(index);
  assert.equal(census.indexedObjects,5);
  assert.equal(census.objectIds,5);
  assert.equal(census.zeroVoiceOrLinksDiscoverable,true);
  assert.equal(census.possibleAmbiguousAccessions,1);
  assert.equal(listLakehouseObjects(index,{limit:20}).length,5);
  assert.equal(listLakehouseObjects(index,{limit:20}).some(row=>row.accession==='SYN-D'),true);
  assert.ok(index.objects.every(o=>o.provenance.visibility==='private_local_unreviewed'));
  assert.ok(index.objects.every(o=>o.provenance.rightsStatus==='not_approved_for_publication'));
  assert.ok(index.objects.every(o=>o.provenance.historicalRelationshipEstablished===false));
});
test('compound commas are preserved and ambiguous accessions show both records',()=>{
  const byId=discoverLakehouse(index,'SYN-A');
  assert.equal(byId.total,2);
  assert.equal(byId.ambiguous,true);
  assert.ok(byId.items.every(x=>x.matchType==='exact_accession'));
  assert.equal(discoverLakehouse(index,'85.7.383a,b').items[0].record.accession,'SYN-A');
  assert.equal(discoverLakehouse(index,'SYN-B-ALIAS').items[0].record.accession,'SYN-B');
  assert.equal(discoverLakehouse(index,'SYN-UNKNOWN').total,0);
});
test('archive, dream, brain distinguish observed words from artist expansions',()=>{
  assert.deepEqual(Object.keys(SEED_CONCEPTS).sort(),['archive','brain','dream']);
  const archive=discoverLakehouse(index,'archive');
  const literal=discoverLakehouse(index,'archive',{literalOnly:true});
  assert.ok(archive.total>=1);
  assert.ok(literal.items.some(x=>x.reasons.some(r=>r.method==='literal'&&r.sourceField==='Subject')));
  assert.equal(archive.items.every(x=>x.historicalRelationshipEstablished===false),true);
  assert.ok(archive.items.some(x=>x.reasons.some(r=>r.method==='artist_vocabulary_expansion')));
  const dream=discoverLakehouse(index,'dream');
  assert.ok(dream.items.some(x=>x.record.accession==='SYN-A'));
  const brain=discoverLakehouse(index,'brain');
  assert.equal(brain.items.some(x=>x.record.accession==='SYN-C'),true);
  assert.ok(brain.items.every(x=>x.reasons.some(r=>r.basis.includes('NOT a catalog subject'))));
  assert.equal(discoverLakehouse(index,'brain',{literalOnly:true}).total,0);
  assert.equal(brain.semanticStatus,'not_enabled_permission_pending');
  assert.ok(discoverLakehouse(index,'Electric Apparatus',{literalOnly:true}).items.some(x=>x.record.accession==='SYN-C'));
  assert.equal(discoverLakehouse(index,'mineral',{literalOnly:true}).items[0].record.accession,'SYN-D');
});
test('registry snapshot is private and does not retain photo fields or unsafe URLs',()=>{
  const serial=serializeLocalLakehouseIndex(index);
  assert.equal(serial.byAccession,undefined);
  const raw=JSON.stringify(serial);
  assert.equal(raw.includes('Thumbnail'),false);
  assert.equal(raw.includes('example.invalid'),false);
  assert.equal(raw.includes('studio portrait'),false);
  assert.equal(rehydrateLocalLakehouseIndex(serial).byAccession.size,index.byAccession.size);
  assert.throws(()=>rehydrateLocalLakehouseIndex({...serial,visibility:'public'}),/private local/);
});
test('CLI accepts only one page, at most five rows, and explicit network intent',()=>{
  assert.equal(MAX_PAGE_ROWS,5);
  assert.equal(optionsFromArgs(['--live','--limit=3','--offset=64800']).offset,64800);
  assert.throws(()=>optionsFromArgs(['--live','--input=foo']),/Choose input/);
  assert.throws(()=>optionsFromArgs(['--limit=50']),/integer from/);
  assert.throws(()=>optionsFromArgs(['--limit=5','--all']),/Unknown flag/);
  assert.throws(()=>boundedRows({data:Array(6).fill({'Accession Number':'SYN-A'})},5),/more rows/);
  assert.throws(()=>boundedRows({data:[],records:[]},5),/ambiguous/);
});
test('real probe function uses one fixed GET and observed pagination, never credentials',async()=>{
  const calls=[];
  const fetchImpl=async (url,options)=>{
    calls.push({url:String(url),options});
    return new Response(JSON.stringify({data:input.data.slice(0,2)}),
      {status:200,headers:{'content-type':'application/json'}});
  };
  const rows=await requestProbePage({offset:57200,limit:2,fetchImpl});
  assert.equal(rows.length,2);
  assert.equal(calls.length,1);
  const u=new URL(calls[0].url);
  assert.equal(u.origin,'https://lakehouse.wolfsonian.org');
  assert.equal(u.pathname,'/api/v1/aa_good_lookup');
  assert.equal(u.searchParams.get('limit'),'2');
  assert.equal(u.searchParams.get('offset'),'57200');
  assert.deepEqual([...u.searchParams.keys()].sort(),['limit','offset']);
  assert.equal(calls[0].options.method,'GET');
  assert.equal(calls[0].options.redirect,'error');
  assert.equal(calls[0].options.headers.Accept,'application/json');
  assert.equal(Object.hasOwn(calls[0].options.headers,'Authorization'),false);
  assert.equal(READ_ONLY_ENDPOINT,u.origin+u.pathname);
});
test('unbounded API output, wrong content type and HTTP failures stop before storing',async()=>{
  const tooMany=()=>Promise.resolve(new Response(JSON.stringify({data:input.data}),{headers:{'content-type':'application/json'}}));
  await assert.rejects(requestProbePage({limit:2,fetchImpl:tooMany}),/more rows/);
  await assert.rejects(requestProbePage({limit:2,fetchImpl:()=>Promise.resolve(new Response('<html>test</html>',{headers:{'content-type':'text/html'}}))}),/content-type/);
  await assert.rejects(requestProbePage({limit:2,fetchImpl:()=>Promise.resolve(new Response('Forbidden',{status:403}))}),/HTTP 403/);
  await assert.rejects(requestProbePage({limit:2,fetchImpl:()=>Promise.resolve(new Response('x'.repeat(MAX_RESPONSE_BYTES+1),{headers:{'content-type':'application/json'}}))}),/(too large|exceeds local probe byte cap)/);
});
test('offline preview and mocked live probe produce private, ignored, fully indexed files',async()=>{
  const tmp=await mkdtemp(join(tmpdir(),'wolfsonian-probe-'));
  try{
    const summary=await runLocalDiscoveryProbe({input:new URL('./fixtures/lakehouse-probe.synthetic.json',import.meta.url).pathname,outDir:tmp,limit:5});
    assert.equal(summary.summary.indexedObjects,5);
    assert.ok(summary.summary.seedSearches.archive.matchedRecords>0);
    assert.equal(summary.summary.seedSearches.brain.literalMatches,0);
    assert.equal(summary.summary.seedSearches.brain.semanticStatus,'not_enabled_permission_pending');
    const saved=JSON.parse(await readFile(summary.paths.index,'utf8'));
    assert.equal(saved.objects.length,5);
    assert.equal(JSON.stringify(saved).includes('example.invalid'),false);
    assert.equal((await stat(summary.paths.index)).mode&0o077,0);
    const dry=await runLocalDiscoveryProbe({dryRun:true});
    assert.equal(dry.noNetworkRequest,true);
    assert.ok(dry.url.includes('limit=5'));
    const fakeLive=await runLocalDiscoveryProbe({live:true,offset:64800,limit:2,outDir:tmp,
      fetchImpl:async()=>new Response(JSON.stringify({data:input.data.slice(0,2)}),{headers:{'content-type':'application/json'}})});
    assert.equal(fakeLive.summary.indexedObjects,2);
  }finally{await rm(tmp,{recursive:true,force:true});}
});
test('new local adapter and probe are absent from public-site bundle allowlist',async()=>{
  const build=await readFile(new URL('../scripts/assemble-public-site.mjs',import.meta.url),'utf8');
  assert.equal(build.includes("'src/lakehouse-local-discovery.mjs'"),false);
  assert.equal(build.includes("'scripts/probe-lakehouse-discovery.mjs'"),false);
});
