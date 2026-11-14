import { timingSafeEqual } from 'node:crypto';
import { reconcileLookup } from '../src/archive-evidence.mjs';
export const LOOKUP='https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup';
const counters=new Map();
class ServiceError extends Error { constructor(status,code,message){super(message);Object.assign(this,{status,code});} }
const fail=(status,code,message)=>{throw new ServiceError(status,code,message);};
function authorized(req,env) {
  const token=env.ARCHIVE_DEMO_ACCESS_TOKEN||'';
  if(token.length<24)fail(503,'SERVER_NOT_CONFIGURED','Set a private server access token of at least 24 characters.');
  const actual=String(req.headers.authorization||'');
  const expected='Bearer '+token;
  const actualBytes=Buffer.from(actual),expectedBytes=Buffer.from(expected);
  if(actualBytes.length!==expectedBytes.length||!timingSafeEqual(actualBytes,expectedBytes))fail(401,'UNAUTHORIZED','Enter the private demo access token.');
  const origin=req.headers.origin;
  if(origin) {
    let parsed;try{parsed=new URL(origin);}catch{fail(403,'ORIGIN','Invalid origin.');}
    if(parsed.host!==req.headers.host)fail(403,'ORIGIN','Cross-origin service requests are not accepted.');
  }
}
function budget(kind) {
  const now=Date.now(),entry=counters.get(kind)||{start:now,count:0};
  if(now-entry.start>=60000){entry.start=now;entry.count=0;}
  if(++entry.count>(kind==='voice'?12:6))fail(429,'DEMO_REQUEST_BUDGET','Wait a minute before another service request.');
  counters.set(kind,entry);
}
export async function boundedBytes(response,cap,controller) {
  if(!response.body)fail(502,'EMPTY_RESPONSE','The upstream response had no body.');
  const reader=response.body.getReader(),chunks=[];let size=0;
  try {
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
      if(size>cap){controller.abort();await reader.cancel().catch(()=>{});fail(502,'BODY_LIMIT','Response exceeded the bounded demo size. Request a supported small lookup.');}
      chunks.push(Buffer.from(value));
    }
  } finally {reader.releaseLock();}
  return Buffer.concat(chunks);
}
async function readBody(req) {
  if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body)) {
    if(Buffer.byteLength(JSON.stringify(req.body))>8192)fail(413,'BODY_TOO_LARGE','Request too large.');
    return req.body;
  }
  let text='';
  for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)fail(413,'BODY_TOO_LARGE','Request too large.');}
  try{return JSON.parse(text);}catch{fail(400,'INVALID_JSON','Expected a JSON request.');}
}
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(body));}
export async function handleArchiveService(kind,req,res,{env=process.env,fetchImpl=fetch}={}) {
  try {
    if(req.method!==(kind==='voice'?'POST':'GET')){res.setHeader('Allow',kind==='voice'?'POST':'GET');fail(405,'METHOD','Unsupported method.');}
    authorized(req,env);
    if(kind==='status')return json(res,200,{lakehouse:env.ARCHIVE_ENABLE_LAKEHOUSE==='1',elevenlabs:env.ARCHIVE_ENABLE_ELEVENLABS==='1'&&!!env.ELEVENLABS_API_KEY,
      mode:'internal-demo',liveConversationModel:false,requestBudget:'Per-process demo guard; not a durable public quota.'});
    if(kind==='lakehouse') {
      if(env.ARCHIVE_ENABLE_LAKEHOUSE!=='1')fail(503,'LAKEHOUSE_DISABLED','Lakehouse lookup is disabled on this server.');
      const input=new URL(req.url,'http://localhost').searchParams;
      const accession=(input.get('accession')||'').trim();
      if(!/^[A-Za-z0-9][A-Za-z0-9 .,()/_-]{0,119}$/.test(accession)||accession.startsWith('FICTION-'))fail(400,'ACCESSION','Select a real, nonempty accession.');
      // Parameter names have no guessed defaults. Populate only from a verified contract.
      if(!env.LAKEHOUSE_ACCESSION_PARAM||!env.LAKEHOUSE_LIMIT_PARAM)fail(503,'LOOKUP_CONTRACT_NEEDED','Configure the supported accession filter and bounded limit parameter after the home API test.');
      const url=new URL(LOOKUP);
      for(const name of [env.LAKEHOUSE_ACCESSION_PARAM,env.LAKEHOUSE_LIMIT_PARAM])if(!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(name))fail(503,'LOOKUP_CONTRACT','Invalid configured parameter name.');
      if(env.LAKEHOUSE_ACCESSION_PARAM===env.LAKEHOUSE_LIMIT_PARAM)fail(503,'LOOKUP_CONTRACT','Filter and limit parameters must differ.');
      url.searchParams.set(env.LAKEHOUSE_ACCESSION_PARAM,accession);url.searchParams.set(env.LAKEHOUSE_LIMIT_PARAM,'5');
      budget('lakehouse');const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
      try {
        const upstream=await fetchImpl(url,{headers:{Accept:'application/json'},redirect:'error',signal:controller.signal});
        if(!upstream.ok)fail(502,'LAKEHOUSE_HTTP_'+upstream.status,'Lakehouse returned HTTP '+upstream.status+'. No retries performed; this server does not inherit home IP authorization.');
        if(!/application\/(?:[\w.+-]*\+)?json/i.test(upstream.headers.get('content-type')||''))fail(502,'NOT_JSON','Lakehouse returned a non-JSON response.');
        const bytes=await boundedBytes(upstream,512*1024,controller);let payload;
        try{payload=JSON.parse(bytes.toString('utf8'));}catch{fail(502,'INVALID_UPSTREAM_JSON','Lakehouse did not return complete parseable JSON.');}
        const snapshot=reconcileLookup(payload,accession);
        if(snapshot.rowsObserved>5)fail(502,'LOOKUP_LIMIT_IGNORED','The upstream response exceeded the configured five-row limit. Verify the lookup contract.');
        return json(res,200,{...snapshot,sourceUrl:url.toString(),sourceSystem:'Lakehouse public lookup',requestMode:'bounded-supported-filter'});
      } finally {clearTimeout(timer);}
    }
    if(kind==='voice') {
      if(env.ARCHIVE_ENABLE_ELEVENLABS!=='1'||!env.ELEVENLABS_API_KEY)fail(503,'ELEVENLABS_DISABLED','ElevenLabs is not enabled on this server. Use the transcript or local device voices.');
      const body=await readBody(req);
      if(body.confirmed!==true)fail(400,'EXTERNAL_APPROVAL_REQUIRED','Confirm approval to send the displayed words to ElevenLabs.');
      if(Object.keys(body).some(k=>!['text','role','confirmed'].includes(k)))fail(400,'VOICE_REQUEST','Unsupported voice request field.');
      if(typeof body.text!=='string'||body.text.trim().length<1||body.text.length>1000)fail(400,'TEXT_LENGTH','Speech text must contain 1–1000 characters.');
      const voice={objectA:env.ELEVENLABS_VOICE_A_ID,objectB:env.ELEVENLABS_VOICE_B_ID,archivist:env.ELEVENLABS_ARCHIVIST_VOICE_ID}[body.role];
      if(!voice||!/^[A-Za-z0-9_-]{1,100}$/.test(voice))fail(503,'VOICE_NOT_CONFIGURED','Configure this role’s server-side voice ID.');
      budget('voice');const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
      try {
        const upstream=await fetchImpl('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(voice)+'?output_format=mp3_44100_128',{
          method:'POST',headers:{'xi-api-key':env.ELEVENLABS_API_KEY,'Content-Type':'application/json',Accept:'audio/mpeg'},
          body:JSON.stringify({text:body.text,model_id:env.ELEVENLABS_MODEL_ID||'eleven_multilingual_v2'}),redirect:'error',signal:controller.signal
        });
        if(!upstream.ok)fail(502,'ELEVENLABS_HTTP_'+upstream.status,'ElevenLabs returned HTTP '+upstream.status+'. No retry or account detail was exposed.');
        if(!(upstream.headers.get('content-type')||'').toLowerCase().startsWith('audio/'))fail(502,'NOT_AUDIO','The speech provider did not return audio.');
        const audio=await boundedBytes(upstream,1024*1024,controller);if(!audio.length)fail(502,'EMPTY_AUDIO','The speech provider returned empty audio.');
        res.statusCode=200;res.setHeader('Content-Type','audio/mpeg');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');return res.end(audio);
      } finally {clearTimeout(timer);}
    }
    fail(404,'NOT_FOUND','Unknown service.');
  } catch(error) {
    const status=error.status||502,code=error.code||'UPSTREAM_UNAVAILABLE';
    // Do not log provider responses, request bodies, keys or private record content.
    return json(res,status,{error:code,message:error instanceof ServiceError?error.message:'Service unavailable or timed out. Local graph and transcript remain available.'});
  }
}
