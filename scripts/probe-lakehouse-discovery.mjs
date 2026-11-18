#!/usr/bin/env node
/**
 * Deliberately small, read-only Lakehouse probe for the artist's authorized
 * computer/Cursor environment. It never runs during a public build and is
 * never suitable for a client/browser bundle.
 *
 * PAST OBSERVATION: the repo's historical capture used limit and offset.
 * This probe does not claim that a filtered accession API is documented.
 */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  buildLocalLakehouseIndex,serializeLocalLakehouseIndex,
  discoverLakehouse,listLakehouseObjects,localDiscoveryCensus
} from '../src/lakehouse-local-discovery.mjs';

export const READ_ONLY_ENDPOINT='https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup';
export const MAX_PAGE_ROWS=5;
export const MAX_RESPONSE_BYTES=384*1024;
export const TIMEOUT_MS=12000;
export const DEFAULT_OFFSET=57200; // prior research capture started at this bounded offset

function integer(value,{min,max,label}){
  const n=Number(value);
  if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(label+' must be an integer from '+min+' to '+max);
  return n;
}
export function optionsFromArgs(argv){
  const opts={limit:5,offset:DEFAULT_OFFSET,input:null,live:false,dryRun:false,query:null};
  for(const arg of argv){
    if(arg==='--live')opts.live=true;
    else if(arg==='--dry-run')opts.dryRun=true;
    else if(arg==='--help')opts.help=true;
    else if(arg.startsWith('--offset='))opts.offset=integer(arg.slice(9),{min:0,max:100000,label:'offset'});
    else if(arg.startsWith('--limit='))opts.limit=integer(arg.slice(8),{min:1,max:MAX_PAGE_ROWS,label:'limit'});
    else if(arg.startsWith('--input='))opts.input=arg.slice(8);
    else if(arg.startsWith('--query='))opts.query=arg.slice(8);
    else throw Error('Unknown flag: '+arg);
  }
  if(opts.input&&(opts.live||opts.dryRun))throw Error('Choose input or a network mode, not both.');
  if(opts.live&&opts.dryRun)throw Error('Choose --live OR --dry-run.');
  return opts;
}
export function boundedRows(payload,limit){
  let rows;
  if(Array.isArray(payload))rows=payload;
  else if(payload&&typeof payload==='object'){
    const keys=['data','records','results','items','matches'].filter(k=>Array.isArray(payload[k]));
    if(keys.length!==1)throw Error('Unrecognized or ambiguous Lakehouse response wrapper.');
    rows=payload[keys[0]];
  }
  if(!Array.isArray(rows))throw Error('Response is not a JSON array of records.');
  if(rows.length>limit)throw Error('Server returned more rows than requested. Stop and verify pagination semantics.');
  if(rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))
    throw Error('Expected an array of record objects.');
  return rows;
}

async function consumeBounded(response,maxBytes){
  if(!response.body)throw Error('No response body.');
  const reader=response.body.getReader(),buffers=[];
  let total=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      total+=value.byteLength;
      if(total>maxBytes)throw Error('Response too large; no records stored.');
      buffers.push(Buffer.from(value));
    }
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  return JSON.parse(Buffer.concat(buffers).toString('utf8'));
}

export async function requestProbePage({offset=DEFAULT_OFFSET,limit=5,fetchImpl=fetch}={}){
  integer(offset,{min:0,max:100000,label:'offset'});
  integer(limit,{min:1,max:MAX_PAGE_ROWS,label:'limit'});
  const url=new URL(READ_ONLY_ENDPOINT);
  // limit/offset were observed in the existing scripts/capture-lakehouse-sample.mjs.
  // No assumed accession-filter parameter, credentials, or internal endpoint.
  url.searchParams.set('limit',String(limit));
  url.searchParams.set('offset',String(offset));
  const response=await fetchImpl(url,{method:'GET',headers:{Accept:'application/json'},
    redirect:'error',signal:AbortSignal.timeout(TIMEOUT_MS)});
  if(!response.ok)throw Error('Read-only Lakehouse request returned HTTP '+response.status+'. No retry or alternative endpoint attempted.');
  const type=response.headers.get('content-type')||'';
  if(!/application\/(?:[\w.+-]*\+)?json/i.test(type))throw Error('Unexpected content-type; response not saved.');
  const length=Number(response.headers.get('content-length'));
  if(Number.isFinite(length)&&length>MAX_RESPONSE_BYTES)throw Error('Body exceeds local probe byte cap.');
  const payload=await consumeBounded(response,MAX_RESPONSE_BYTES);
  return boundedRows(payload,limit);
}

export async function runLocalDiscoveryProbe({
  input=null,live=false,dryRun=false,offset=DEFAULT_OFFSET,limit=5,
  outDir=null,query=null,fetchImpl=fetch
}={}){
  const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const output=resolve(outDir||resolve(root,'.local-research/lakehouse-probe'));
  const url=new URL(READ_ONLY_ENDPOINT);
  url.searchParams.set('limit',String(limit));url.searchParams.set('offset',String(offset));
  if(dryRun)return {dryRun:true,method:'GET',url:url.toString(),maxRows:MAX_PAGE_ROWS,
    maxBytes:MAX_RESPONSE_BYTES,timeoutMs:TIMEOUT_MS,noNetworkRequest:true};
  if(!input&&!live)throw Error('Choose --live for one authorized GET, --input=PRIVATE_JSON for offline testing, or --dry-run.');
  let rows;
  if(input){
    const file=resolve(input);
    const bytes=await readFile(file);
    if(bytes.length>512*1024)throw Error('Local fixture is too large for first probe.');
    rows=boundedRows(JSON.parse(bytes.toString('utf8')),limit);
  }else rows=await requestProbePage({offset,limit,fetchImpl});
  const index=buildLocalLakehouseIndex(rows,{retrievedAt:new Date().toISOString()});
  const census=localDiscoveryCensus(index);
  const querySet=[...'archive dream brain'.split(' '),...(query?[query]:[])];
  const searches=Object.fromEntries(querySet.map(q=>{
    const found=discoverLakehouse(index,q);
    return [q,{matchedRecords:found.total,returned:found.items.length,
      literalMatches:found.items.filter(x=>x.matchType==='literal').length,
      expandedOnlyMatches:found.items.filter(x=>x.matchType==='expanded').length,
      semanticStatus:found.semanticStatus}];
  }));
  const fieldsSeen=[...new Set(rows.flatMap(row=>Object.keys(row)))].sort();
  const summary={...census,probe:{source:input?'local_input':'authorized_local_GET',
    requestedLimit:limit,offset:input?null:offset,requestMode:'single_page_read_only',
    returnedRows:rows.length,byteCap:MAX_RESPONSE_BYTES},
    returnedFieldNames:fieldsSeen,seedSearches:searches,
    disclaimer:'All results are private, unreviewed, and not publication permissions. Word expansions are artist-authored.'};
  await mkdir(output,{recursive:true,mode:0o700});
  await writeFile(resolve(output,'discovery-index.private.json'),
    JSON.stringify(serializeLocalLakehouseIndex(index),null,2),{mode:0o600});
  await writeFile(resolve(output,'probe-summary.json'),JSON.stringify(summary,null,2),{mode:0o600});
  // Local search preview contains exact source excerpts; intentionally excluded from public files.
  const preview=Object.fromEntries(querySet.map(q=>[q,discoverLakehouse(index,q,{limit:8})]));
  await writeFile(resolve(output,'search-preview.private.json'),JSON.stringify(preview,null,2),{mode:0o600});
  // The registry supports browsing even zero-degree records with no scripted voice.
  const listed=listLakehouseObjects(index,{limit:250});
  if(listed.length!==index.objects.length)throw Error('Local browse census missed an object.');
  return {dryRun:false,summary,output,paths:{
    index:resolve(output,'discovery-index.private.json'),
    summary:resolve(output,'probe-summary.json'),
    preview:resolve(output,'search-preview.private.json')
  }};
}
const help=[
  'Local Lakehouse probe. No external data or credentials are committed.',
  '  npm run lakehouse:probe -- --dry-run --offset=57200 --limit=5',
  '  npm run lakehouse:probe -- --live --offset=57200 --limit=5',
  '  npm run lakehouse:probe -- --input=test/fixtures/lakehouse-probe.synthetic.json --limit=5',
  '  npm run lakehouse:probe -- --live --offset=64800 --limit=5 --query=tomorrow',
  'Requests only an observed limit/offset page; NOT an exact-accession filter.',
  'Outputs private files under ignored .local-research/lakehouse-probe/.',
  'Never commit/attach the raw response, index, snippets, network logs or secrets.'
].join('\n');

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const opts=optionsFromArgs(process.argv.slice(2));
    if(opts.help)console.log(help);
    else{
      const result=await runLocalDiscoveryProbe(opts);
      if(result.dryRun)console.log(JSON.stringify(result,null,2));
      else console.log(JSON.stringify({
        probe:result.summary.probe,indexedObjects:result.summary.indexedObjects,
        returnedFieldNames:result.summary.returnedFieldNames,
        seedSearches:result.summary.seedSearches,
        visibility:result.summary.publicationStatus,
        localOutput:result.output
      },null,2));
    }
  }catch(error){
    console.error('Probe stopped: '+error.message);
    process.exitCode=1;
  }
}
