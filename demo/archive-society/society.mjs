import { parseMatrixCsv } from '../../src/discovery-graph.mjs';
import { inventedRecords, societyView, conversationFor, LENSES, photoKeys, imageKeys, WORLD } from '../../src/archive-society.mjs';
import { reconcileLookup } from '../../src/archive-evidence.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const state={records:inventedRecords(),seed:'FICTION-01',lens:'family',edge:null,
  photos:new Map(),urls:new Set(),snapshots:new Map(),payload:null,
  background:'./assets/archive-landscape.jpg',scale:1,panX:0,panY:0,
  playing:false,epoch:0,view:null,conversation:null,lookupBusy:false};
let playback=0,voiceAbort=null,currentAudio=null,lookupAbort=null,cancelDeviceSpeech=null;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
const message=(id,text)=>{$(id).textContent=text;};
const record=()=>state.records.find(r=>r.accession===state.seed);
const photo=r=>photoKeys(r).map(k=>state.photos.get(k)).find(Boolean);
function fit(){state.scale=1;state.panX=0;state.panY=0;transform();}
function transform(){const e=$('world');if(e)e.setAttribute('transform','translate('+state.panX+' '+state.panY+') translate(1000 562.5) scale('+state.scale+') translate(-1000 -562.5)');}
function zoom(amount){state.scale=Math.max(.55,Math.min(2.8,state.scale*amount));transform();}
function setPanel(name){
  for(const p of ['conversation','record','services'])$(p+'-panel').hidden=p!==name;
  for(const b of document.querySelectorAll('[data-panel]'))b.setAttribute('aria-pressed',String(b.dataset.panel===name));
}
function resetApproval(){ $('external-approved').checked=false; }
function stop(){
  playback++;voiceAbort?.abort();voiceAbort=null;
  if(currentAudio){currentAudio.pause();currentAudio=null;}
  window.speechSynthesis?.cancel();cancelDeviceSpeech?.();cancelDeviceSpeech=null;state.playing=false;$('play').disabled=!state.conversation;
  document.querySelectorAll('.conversation-edge.speaking').forEach(e=>e.classList.remove('speaking'));
}
function changeSeed(id){stop();resetApproval();state.seed=id;state.edge=null;
  if(state.payload)state.snapshots.set(id,reconcileLookup(state.payload,id,'UNKNOWN_LOCAL_CAPTURE_TIME'));
  render();setPanel('record');}
function options(){
  const query=$('search').value.toLowerCase();
  const entries=state.records.filter(r=>(r.title+' '+r.accession).toLowerCase().includes(query));
  $('seed').replaceChildren(...entries.map(r=>{const o=node('option',r.title+' · '+r.accession);o.value=r.accession;return o;}));
  $('seed').value=state.seed;
  if(!$('seed').value&&entries.length){state.seed=entries[0].accession;$('seed').value=state.seed;state.edge=null;}
}
function categories(){
  const themes=[...new Set(state.records.flatMap(r=>(r.tags||[]).filter(t=>t.family==='theme').map(t=>t.value)))].sort();
  const all=node('option','All categories');all.value='';
  $('theme').replaceChildren(all,...themes.map(t=>{const o=node('option',t);o.value=t;return o;}));
}
function wrapTitle(text,max=24){
  const lines=[];let line='';
  for(const word of String(text).split(/\s+/)){if((line+' '+word).trim().length>max&&line){lines.push(line);line='';}line+=(line?' ':'')+word;}
  if(line)lines.push(line);return lines.length>2?[lines[0],lines[1].slice(0,max-1)+'…']:lines;
}
function renderGraph(){
  const s=svg('g',{id:'world'}),defs=svg('defs');
  s.append(svg('image',{href:state.background,x:0,y:0,width:WORLD.width,height:WORLD.height,preserveAspectRatio:'xMidYMid meet'}));
  s.append(svg('rect',{x:0,y:0,width:2000,height:1125,fill:'#10231c',opacity:Number($('veil').value)/100}));
  const byId=new Map(state.view.nodes.map(n=>[n.record.accession,n]));
  for(const edge of state.view.edges){
    const a=byId.get(edge.source),b=byId.get(edge.target),mx=(a.x+b.x)/2,my=(a.y+b.y)/2-45;
    const d='M '+a.x+' '+a.y+' Q '+mx+' '+(my-90)+' '+b.x+' '+b.y;
    const g=svg('g',{class:'conversation-edge'+(edge.id===state.edge?' selected':''),role:'button',tabindex:0,'aria-label':'Hear conversation: '+b.record.title+'; shared '+edge.reasons[0].value,'data-edge':edge.id});
    g.append(svg('path',{d,class:'edge-line'}),svg('path',{d,class:'hit'}));
    const label='◌ '+edge.reasons[0].value+' · 3 turns',width=Math.min(350,Math.max(165,label.length*8.2));
    g.append(svg('rect',{x:mx-width/2,y:my-62,width,height:36,rx:18,class:'chip'}),svg('text',{x:mx,y:my-38,'text-anchor':'middle'},label));
    const select=()=>{stop();resetApproval();state.edge=edge.id;render();setPanel('conversation');};
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});s.append(g);
  }
  state.view.nodes.forEach((item,i)=>{
    const {record:r,x,y}=item,w=238,h=173;
    const g=svg('g',{class:'object-card'+(r.accession===state.seed?' selected':''),transform:'translate('+(x-w/2)+' '+(y-h/2)+')',role:'button',tabindex:0,'aria-label':r.title+' · '+r.accession,'data-accession':r.accession});
    g.append(svg('rect',{x:0,y:0,width:w,height:h,rx:10,class:'card'}));
    const url=photo(r),clipId='photo-clip-'+i,clip=svg('clipPath',{id:clipId});
    clip.append(svg('rect',{x:9,y:9,width:220,height:83,rx:5}));defs.append(clip);
    if(url)g.append(svg('image',{href:url,x:9,y:9,width:220,height:83,preserveAspectRatio:'xMidYMid meet','clip-path':'url(#'+clipId+')',class:'thumbnail'}));
    else{
      g.append(svg('rect',{x:9,y:9,width:220,height:83,rx:5,class:'photo-placeholder'}));
      if(r.source==='invented'&&r.objectType==='radio'){
        g.append(svg('path',{d:'M 77 65 V 35 Q 77 21 92 21 H 149 Q 163 21 163 35 V 65 Z M 87 31 H 122 V 56 H 87 Z M 135 63 H 143',class:'placeholder-icon'}));
        g.append(svg('circle',{cx:145,cy:42,r:10,class:'placeholder-icon'}));
      }else if(r.source==='invented'&&r.objectType==='stove'){
        g.append(svg('path',{d:'M 88 24 H 151 V 68 H 88 Z M 94 42 H 145 V 62 H 94 Z',class:'placeholder-icon'}));
        for(const cx of [102,137])g.append(svg('circle',{cx,cy:32,r:4,class:'placeholder-icon'}));
      }else if(r.source==='invented'&&['repair','archive'].includes(r.objectType)){
        g.append(svg('path',{d:'M 80 27 Q 103 20 119 29 Q 136 20 159 27 V 63 Q 136 56 119 66 Q 103 56 80 63 Z M 119 29 V 66',class:'placeholder-icon'}));
      }else g.append(svg('path',{d:'M 91 66 L 104 38 L 120 54 L 132 42 L 149 66 Z M 96 27 H 143 V 73 H 96 Z',class:'placeholder-icon'}));
      g.append(svg('text',{x:119,y:86,'text-anchor':'middle',class:'node-kind'},r.source==='invented'?'ILLUSTRATIVE / INVENTED':'LOCAL PHOTO NOT LOADED'));
    }
    wrapTitle(r.title).forEach((line,j)=>g.append(svg('text',{x:13,y:113+j*21,class:'object-title'},line)));
    g.append(svg('text',{x:13,y:160,class:'accession'},r.accession.length>28?r.accession.slice(0,27)+'…':r.accession));
    g.addEventListener('click',()=>changeSeed(r.accession));g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();changeSeed(r.accession);}});
    s.append(g);
  });
  $('network').replaceChildren(defs,s);transform();
}
function renderConversation(){
  const edge=state.view.edges.find(e=>e.id===state.edge),box=$('conversation-content');box.replaceChildren();
  state.conversation=null;
  if(!edge){box.append(node('h2','No shared category in this view.'),node('p','Try another object, category or perspective. An absent edge does not mean the objects have no relationship.'));$('voice-controls').hidden=true;$('play').disabled=true;return;}
  const target=state.records.find(r=>r.accession===edge.target);
  const c=conversationFor(record(),target,edge,state.lens,{source:state.snapshots.get(state.seed),target:state.snapshots.get(target.accession)});state.conversation=c;
  box.append(node('span','SHARED METADATA · NOT DOCUMENTED HISTORY','evidence-type'),node('h2','A conversation begins at '+edge.reasons[0].value+'.','edge-title'));
  for(const turn of c.turns){const e=node('article',undefined,'turn');e.dataset.role=turn.role;e.append(node('strong',turn.speaker),node('p',turn.text));
    for(const citation of turn.citations||[])e.append(node('small','Catalog field '+citation.pointer+' · '+citation.retrievedAt,'muted'));
    box.append(e);}
  const details=node('details');details.append(node('summary','Inspect the reason for this edge'));
  for(const reason of c.evidence){const e=node('div',undefined,'reason');e.append(node('strong',reason.family+' / '+reason.value),node('small',reason.sourceColumns.join(' + ')+' → '+reason.targetColumns.join(' + ')),node('small','Shared by '+reason.candidateCount+' records in this local index.'));details.append(e);}
  details.append(node('p',c.limits,'muted'));box.append(details);$('voice-controls').hidden=false;$('play').disabled=state.playing;
}
function pair(list,label,value){list.append(node('dt',label),node('dd',value||'Not supplied'));}
function renderRecord(){
  const r=record(),box=$('record-content');box.replaceChildren(node('span',r.source==='invented'?'INVENTED EXAMPLE':'LOCAL CSV · SOURCE INPUT','evidence-type'),node('h2',r.title));
  if(photo(r)){const img=node('img');img.src=photo(r);img.alt='Locally supplied image matched to '+r.accession;box.append(img);}
  const list=node('dl');pair(list,'Accession',r.accession);pair(list,'Creator',r.creator);pair(list,'Date',r.date);pair(list,'Categories',(r.tags||[]).filter(t=>t.family==='theme').map(t=>t.value).join(' · '));pair(list,'Image source',photo(r)?'Local file · permission and credit remain with the source':'Illustrative card · no collection photo loaded');box.append(list);
  $('lookup').disabled=r.source==='invented'||state.lookupBusy;renderSnapshot();
}
function renderSnapshot(){
  const s=state.snapshots.get(state.seed),box=$('snapshot-content');box.replaceChildren();
  if(!s){box.append(node('p','No Lakehouse evidence loaded for this record.','muted'));return;}
  box.append(node('strong',s.status),node('p',s.retrievedAt),node('p','Adapter: '+s.schemaStatus+'. Exact identifier matching does not establish historical relationships.','muted'));
  if(s.sourceUrl){const a=node('a','Public lookup request ↗');a.href=s.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}
  for(const match of s.matches){const dl=node('dl');for(const [key,field]of Object.entries(match.fields)){
    const value=field.status==='PRESENT'?Array.isArray(field.value)?field.value.join(' · '):String(field.value):field.status;
    pair(dl,key,value);if(field.pointer)dl.append(node('dd',field.pointer,'muted'));
  }box.append(dl);}
  box.append(node('p','Storage/box mapping: not established by this adapter.','muted'));
}
function render(){
  state.view=societyView(state.records,state.seed,state.lens,{atlas:$('atlas-mode').checked,theme:$('theme').value});
  if(!state.view.edges.some(e=>e.id===state.edge))state.edge=state.view.edges[0]?.id||null;
  const lens=LENSES.find(l=>l.id===state.lens);
  message('lens-question',lens.question);message('lens-limit',lens.limits);message('atlas-title',record().title);
  message('counts',state.view.nodes.length+' visible objects · '+state.view.edges.length+' conversation paths · 0 historical claims inferred');
  message('source-status',record().source==='invented'?'Invented demonstration':'Local CSV · browser only');
  renderGraph();renderConversation();renderRecord();
}
async function service(path,options={}){
  const token=$('access-token').value;
  const response=await fetch('/api/archive-society/'+path,{...options,credentials:'omit',headers:{...options.headers,Authorization:'Bearer '+token}});
  if(!response.ok){let error;try{error=await response.json();}catch{}throw new Error(error?.message||'Server unavailable ('+response.status+').');}
  return response;
}
async function play(){
  if(!state.conversation)return;stop();const session=playback;
  const conversation=state.conversation,mode=$('voice-mode').value;
  if(mode==='elevenlabs'&&!$('external-approved').checked){message('voice-status','Review the displayed transcript and confirm external-processing approval first.');return;}
  state.playing=true;$('play').disabled=true;document.querySelectorAll('.conversation-edge.selected').forEach(e=>e.classList.add('speaking'));
  try{
    let localVoice;
    if(mode==='device'){
      if(!window.speechSynthesis)throw new Error('No device speech service. The written transcript remains available.');
      localVoice=window.speechSynthesis.getVoices().find(v=>v.localService);
      if(!localVoice){await new Promise(r=>setTimeout(r,500));localVoice=window.speechSynthesis.getVoices().find(v=>v.localService);}
      if(!localVoice)throw new Error('No local device voice is installed. Use the written transcript or configure ElevenLabs.');
    }
    for(const [i,turn]of conversation.turns.entries()){
      if(session!==playback)return;message('voice-status','Speaking '+(i+1)+' of '+conversation.turns.length+' · '+turn.speaker);
      if(mode==='device'){
        await new Promise((resolve,reject)=>{cancelDeviceSpeech=resolve;const u=new SpeechSynthesisUtterance(turn.text);u.voice=localVoice;u.rate=.92;u.pitch=turn.role==='objectA'?.95:turn.role==='objectB'?1.08:1;u.onend=()=>{cancelDeviceSpeech=null;resolve();};u.onerror=()=>{cancelDeviceSpeech=null;reject(new Error('Device speech stopped or unavailable.'));};window.speechSynthesis.speak(u);});
      }else{
        voiceAbort=new AbortController();
        const response=await service('voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:turn.text,role:turn.role,confirmed:true}),signal:voiceAbort.signal});
        const url=URL.createObjectURL(await response.blob());
        try{
          if(session!==playback)return;const audio=new Audio(url);currentAudio=audio;
          await new Promise((resolve,reject)=>{audio.onended=resolve;audio.onerror=()=>reject(new Error('Audio playback unavailable.'));audio.onpause=()=>{if(session!==playback)resolve();};audio.play().catch(reject);});
        }finally{URL.revokeObjectURL(url);currentAudio=null;}
      }
    }
    if(session===playback)message('voice-status','Finished · this was a scripted interpretation, not historical testimony.');
  }catch(error){if(session===playback)message('voice-status',error.message);}
  finally{if(session===playback){state.playing=false;$('play').disabled=false;document.querySelectorAll('.conversation-edge.speaking').forEach(e=>e.classList.remove('speaking'));}}
}
function invalidateData(){stop();resetApproval();lookupAbort?.abort();state.epoch++;state.edge=null;state.snapshots.clear();state.payload=null;state.lookupBusy=false;}
function clearPhotos(){for(const url of state.urls)URL.revokeObjectURL(url);state.urls.clear();state.photos.clear();state.background='./assets/archive-landscape.jpg';}
function saveConversation(){
  if(!state.conversation)return;
  const payload={...state.conversation,exportedAt:new Date().toISOString(),source:record().source,notice:'Local research export. Review permissions before sharing. No photos, service token or provider credentials included.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=node('a');a.href=url;a.download='archive-conversation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('lens').replaceChildren(...LENSES.map(p=>{const o=node('option',p.label);o.value=p.id;return o;}));
$('lens').addEventListener('change',()=>{stop();resetApproval();state.lens=$('lens').value;state.edge=null;render();});
$('seed').addEventListener('change',()=>changeSeed($('seed').value));
$('search').addEventListener('input',()=>{stop();resetApproval();options();render();});
for(const id of ['theme','atlas-mode'])$(id).addEventListener('change',()=>{stop();resetApproval();state.edge=null;render();});
$('veil').addEventListener('input',renderGraph);
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
$('voice-mode').addEventListener('change',()=>{stop();resetApproval();$('approval-box').hidden=$('voice-mode').value!=='elevenlabs';});
$('play').addEventListener('click',play);$('stop').addEventListener('click',()=>{stop();message('voice-status','Playback stopped.');});$('export').addEventListener('click',saveConversation);
$('restore').addEventListener('click',()=>{invalidateData();clearPhotos();state.records=inventedRecords();state.seed=state.records[0].accession;$('search').value='';$('atlas-mode').checked=false;categories();options();fit();render();message('import-status','Invented example restored. Local images and snapshots cleared.');});
$('csv-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw new Error('CSV exceeds the 5 MiB demo limit.');const parsed=parseMatrixCsv(await file.text());invalidateData();state.records=parsed.records.map(r=>({...r,source:'local-csv'}));state.seed=state.records[0].accession;$('search').value='';categories();options();fit();render();message('import-status',state.records.length+' CSV objects loaded locally. No upload.');}catch(error){message('import-status',error.message);}finally{e.target.value='';}
});
$('photos').addEventListener('change',e=>{
  let count=0;
  for(const file of [...e.target.files].slice(0,400)){
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>10*1024*1024)continue;
    const url=URL.createObjectURL(file);state.urls.add(url);for(const key of imageKeys(file.name))state.photos.set(key,url);count++;
  }
  render();message('import-status',count+' local images indexed by filename/accession. No upload. Keep their source credits.');e.target.value='';
});
$('background-file').addEventListener('change',e=>{const f=e.target.files[0];if(f&&/^image\/(png|jpeg|webp)$/.test(f.type)&&f.size<=10*1024*1024){const url=URL.createObjectURL(f);state.urls.add(url);state.background=url;renderGraph();}e.target.value='';});
$('snapshot-file').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{if(f.size>512*1024)throw new Error('Use a complete lookup JSON file smaller than 512 KiB.');const payload=JSON.parse(await f.text());const snapshot=reconcileLookup(payload,state.seed,'UNKNOWN_LOCAL_CAPTURE_TIME');stop();resetApproval();state.payload=payload;state.snapshots.set(state.seed,snapshot);renderSnapshot();renderConversation();}catch(error){message('snapshot-content',error.message);}finally{e.target.value='';}
});
$('lookup').addEventListener('click',async()=>{
  const accession=state.seed,epoch=state.epoch;lookupAbort?.abort();lookupAbort=new AbortController();state.lookupBusy=true;$('lookup').disabled=true;
  message('snapshot-content','Requesting one bounded lookup…');
  try{const response=await service('lakehouse?accession='+encodeURIComponent(accession),{signal:lookupAbort.signal});const snapshot=await response.json();if(state.epoch===epoch){stop();resetApproval();state.snapshots.set(accession,snapshot);renderSnapshot();renderConversation();}}
  catch(error){if(state.epoch===epoch)message('snapshot-content',error.message);}
  finally{if(state.epoch===epoch){state.lookupBusy=false;$('lookup').disabled=record().source==='invented';}}
});
$('check-services').addEventListener('click',async()=>{try{const r=await service('status'),s=await r.json();message('service-status','Lakehouse: '+(s.lakehouse?'enabled':'disabled')+' · ElevenLabs: '+(s.elevenlabs?'enabled':'disabled')+' · live conversation model: no.');}catch(error){message('service-status',error.message);}});
$('zoom-in').addEventListener('click',()=>zoom(1.2));$('zoom-out').addEventListener('click',()=>zoom(1/1.2));$('fit').addEventListener('click',fit);
$('present').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('voice-status','Full screen unavailable on this device.');}});
let drag=null;
$('network').addEventListener('pointerdown',e=>{if(e.target.closest('.object-card,.conversation-edge'))return;drag={x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};$('network').setPointerCapture(e.pointerId);});
$('network').addEventListener('pointermove',e=>{if(!drag)return;const r=$('network').getBoundingClientRect();state.panX=drag.px+(e.clientX-drag.x)*2000/r.width;state.panY=drag.py+(e.clientY-drag.y)*1125/r.height;transform();});
for(const event of ['pointerup','pointercancel'])$('network').addEventListener(event,()=>{drag=null;});
$('network').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();zoom(e.deltaY<0?1.07:1/1.07);},{passive:false});
window.addEventListener('beforeunload',()=>{stop();clearPhotos();});
categories();options();render();
