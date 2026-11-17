import { parseMatrixCsv } from '../../src/discovery-graph.mjs';
import { inventedRecords, societyView, conversationFor, LENSES, WORLD, categoryIconUrl, district } from '../../src/archive-society.mjs';
import { CARD_BY_ID, portraitUrl } from '../../src/discovery-personas.mjs';
import { applyLayers, buildAtlasGraph, recordsToAtlasInput } from '../../src/atlas-graph.mjs';
import { reconcileLookup } from '../../src/archive-evidence.mjs';
import { conversationRecords, lookupSnapshots } from '../../src/lakehouse-matches.mjs';
import { localImageUrl } from '../../src/local-images.mjs';
import { OPENING_ACCESSION } from '../../src/presentation-pairs.mjs';
import { withPublicAnchorFallback } from '../../src/object-lens-core.mjs';
import { focusedPairGraph } from '../../src/force-graph-data.mjs';
import { mountForceStage } from '../force-stage.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const state={records:inventedRecords(),seed:'FICTION-01',lens:'family',edge:null,identityEdge:null,layerView:null,journey:[],
  urls:new Set(),snapshots:new Map(),payload:null,
  background:'./assets/archive-landscape.jpg',scale:1,panX:0,panY:0,
  playing:false,epoch:0,view:null,conversation:null,lookupBusy:false,hover:null,turnIndex:0,turnKey:null};
let playback=0,voiceAbort=null,currentAudio=null,lookupAbort=null,cancelDeviceSpeech=null;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
const message=(id,text)=>{$(id).textContent=text;};
const record=()=>state.records.find(r=>r.accession===state.seed);
const photo=r=>localImageUrl(r?.accession);
function fit(){stage.fit();syncZoomUi();}
function setZoomT(t){stage.setZoomT(t);syncZoomUi();}
function zoom(amount){stage.zoom(amount);syncZoomUi();}
function syncZoomUi(){
  const input=$('zoom');if(!input)return;
  state.scale=stage.scale();
  const t=100*Math.log(Math.max(state.scale,1))/Math.log(4);
  state.t=Number.isFinite(t)?Math.min(100,Math.max(0,t)):0;
  input.value=String(Math.round(state.t));
  for(const button of document.querySelectorAll('[data-stop]'))button.classList.toggle('on',Math.abs(Number(button.dataset.stop)-state.t)<4);
  $('fit').classList.toggle('on',state.t<4);
}
function setPanel(name){
  for(const p of ['conversation','record'])$(p+'-panel').hidden=p!==name;
  for(const b of document.querySelectorAll('[data-panel]'))b.setAttribute('aria-pressed',String(b.dataset.panel===name));
}
function resetApproval(){ $('external-approved').checked=false; }
function stop(){
  playback++;voiceAbort?.abort();voiceAbort=null;
  if(currentAudio){currentAudio.pause();currentAudio=null;}
  window.speechSynthesis?.cancel();cancelDeviceSpeech?.();cancelDeviceSpeech=null;state.playing=false;$('play').disabled=!state.conversation;
  document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));
  $('voice-controls')?.classList.remove('playing');
  stage.setSpeaking('');
  updateTurnFocus();
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
function lensMatch(record){
  const lens=LENSES.find(item=>item.id===state.lens)||LENSES[0];
  return Object.entries(lens.focus||{}).some(([family,values])=>(record.tags||[]).some(tag=>tag.family===family&&values.includes(tag.value)));
}
function portraitFor(record){
  if(!lensMatch(record))return '';
  const card=CARD_BY_ID.get(state.lens);
  return card?portraitUrl(card):'';
}
function tagColor(label){
  let hash=2166136261;
  for(const char of String(label))hash=Math.imul(hash^char.charCodeAt(0),16777619);
  return 'hsl('+((hash>>>0)%360)+', 72%, 46%)';
}
function linkedAccessions(){
  const linked=new Set([state.seed]);
  for(const edge of state.view?.edges||[]){
    if(edge.source===state.seed||edge.target===state.seed){linked.add(edge.source);linked.add(edge.target);}
  }
  return linked;
}
function objectBadge(record){
  const letter=(record.title||'?').replace(/[<>&"]/g,'').slice(0,1).toUpperCase()||'?';
  const markup='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#e6e6e6"/><text x="32" y="42" text-anchor="middle" font-size="28" font-family="system-ui,sans-serif" fill="#111">'+letter+'</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup);
}
function avatarFor(record){return photo(record)||portraitFor(record)||objectBadge(record);}
function bindHover(g,hover){
  g.addEventListener('pointerenter',()=>{state.hover=hover;paintPreview();});
  g.addEventListener('pointerleave',event=>{
    const next=event.relatedTarget;
    if(next&&next.closest&&next.closest('.object-card,.conversation-edge,.identity-edge'))return;
    state.hover=null;paintPreview();
  });
}
function paintPreview(){
  document.querySelectorAll('.preview').forEach(el=>el.classList.remove('preview'));
  if(state.hover?.kind==='object')document.querySelector('[data-accession="'+CSS.escape(state.hover.accession)+'"]')?.classList.add('preview');
  if(state.hover?.kind==='edge'||state.hover?.kind==='identity')document.querySelector('[data-edge="'+CSS.escape(state.hover.id)+'"]')?.classList.add('preview');
  if(!state.playing){renderStage();renderConversation();renderRecord();}
}
function shownEdge(){
  if(!state.view)return null;
  if(state.hover?.kind==='object'||state.hover?.kind==='identity')return state.view.edges.find(e=>e.id===state.edge)||null;
  if(state.hover?.kind==='edge')return state.view.edges.find(e=>e.id===state.hover.id)||null;
  return state.view.edges.find(e=>e.id===state.edge)||null;
}
function focusRecord(){
  if(state.hover?.kind==='object')return state.records.find(r=>r.accession===state.hover.accession)||record();
  return record();
}
function addAvatar(defs,g,href,x,y,size,extra=''){
  const id='avatar-'+Math.random().toString(36).slice(2,9);
  const clip=svg('clipPath',{id});
  clip.append(svg('circle',{cx:x+size/2,cy:y+size/2,r:size/2}));
  defs.append(clip);
  g.append(svg('image',{href,x,y,width:size,height:size,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#'+id+')',class:('avatar '+extra).trim()}));
  g.append(svg('circle',{cx:x+size/2,cy:y+size/2,r:size/2,class:'avatar-ring'}));
}
function wrapTitle(text,max=20){
  const lines=[];let line='';
  for(const word of String(text).split(/\s+/)){if((line+' '+word).trim().length>max&&line){lines.push(line);line='';}line+=(line?' ':'')+word;}
  if(line)lines.push(line);return lines.slice(0,2).map((line,i)=>line.length>max||(i===1&&lines.length>2)?line.slice(0,max-1)+'…':line);
}
function renderGraph(){
  if (!state.view.edges.some(item => item.id === state.edge)) state.edge = state.view.edges[0]?.id || null;
  const edge = state.view.edges.find(item => item.id === state.edge) || null;
  const nodes = state.view.nodes.map(item => ({
    id: item.record.accession,
    label: item.record.title,
    image: photo(item.record) || '',
    color: '#f4f4f4',
    neighbor: item.record.accession !== state.seed && state.view.edges.some(link => link.source === item.record.accession || link.target === item.record.accession),
    emphasized: lensMatch(item.record),
  }));
  const links = state.view.edges.map(item => ({ source: item.source, target: item.target, label: item.reasons?.[0]?.value || '', color: tagColor(item.reasons?.[0]?.value || 'shared') }));
  const graph = edge ? focusedPairGraph(nodes, links, edge.source, edge.target) : focusedPairGraph(nodes, links);
  const layers = applyLayers(buildAtlasGraph(recordsToAtlasInput(state.view.nodes.map(n => n.record)), { useSyntheticBoxes: $('layer-box-sim').checked }), { accession: $('layer-accession').checked, box: $('layer-box').checked });
  state.layerView = layers;
  const notice = $('layer-notice');
  if ($('layer-box').checked && layers.boxNotice) { notice.hidden = false; notice.textContent = layers.boxNotice; }
  else notice.hidden = true;
  $('stage').dataset.theme = $('theme').value;
  stage.setGraph(graph.nodes, graph.links);
  if (edge) stage.focusPair(edge.source, edge.target);
}
function onGraphSelect(id){
  const edge = state.view?.edges.find(item => item.target === id || item.source === id);
  if (edge && id !== state.seed) {
    stop(); resetApproval(); state.edge = edge.id; state.identityEdge = null;
    render(); setPanel('conversation');
    return;
  }
  if (id !== state.seed) changeSeed(id);
}
function stagePlate(rec){
  const fig=node('figure',undefined,'plate');
  const img=node('img');img.className='object-shot';img.src=avatarFor(rec);img.alt='';
  fig.append(img,node('figcaption',rec.title+' · '+rec.accession));
  return fig;
}
function renderStage(){
  const box=$('zoom-stage');if(!box||!state.view)return;
  box.replaceChildren();
  const edge=shownEdge();
  const linkColor=edge?tagColor(edge.reasons?.[0]?.value||'shared'):'';
  const row=node('div',undefined,'zoom-pair');
  if(linkColor)row.style.setProperty('--link',linkColor);
  let people=[focusRecord()];
  if(state.hover?.kind==='identity'){
    const rel=state.layerView?.relationships.find(item=>item.id===state.hover.id);
    const hit=state.records.find(r=>r.accession===rel?.source?.replace(/^object:/,''));
    if(hit)people=[hit];
  }else if(state.hover?.kind!=='object'){
    const edge=shownEdge();
    if(edge)people=[state.records.find(r=>r.accession===edge.source),state.records.find(r=>r.accession===edge.target)].filter(Boolean);
  }
  for(const rec of people)row.append(stagePlate(rec));
  const guide=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('archivist');
  const reader=node('figure',undefined,'plate persona');
  const face=node('img');face.src=portraitUrl(guide);face.alt='';
  reader.append(face,node('figcaption',guide.label));
  row.append(reader);
  box.append(row);
}

/** Reading focus is independent of speech: visitors can inspect every turn in silence. */
function updateTurnFocus(){
  const turns=[...document.querySelectorAll('#conversation-content .bubble.turn')];
  const c=state.conversation;
  if(!c||!turns.length){
    $('turn-navigation').hidden=true;
    $('zoom-stage').dataset.activeRole='';
    stage.setActiveSpeaker('');
    return;
  }
  state.turnIndex=Math.max(0,Math.min(state.turnIndex,turns.length-1));
  const index=state.turnIndex;
  turns.forEach((turn,i)=>{
    turn.classList.toggle('current',i===index);
    turn.setAttribute('aria-current',i===index?'step':'false');
  });
  const current=c.turns[index],speaker=current.speaker;
  const activeId=current.role==='objectA'?c.source:current.role==='objectB'?c.target:'';
  stage.setActiveSpeaker(activeId,current.role);
  $('zoom-stage').dataset.activeRole=current.role;
  $('turn-progress').textContent='Reading '+(index+1)+' of '+turns.length+' · '+speaker;
  $('previous-turn').disabled=index===0||state.playing;
  $('next-turn').disabled=index===turns.length-1||state.playing;
  $('turn-navigation').hidden=false;
}
function focusTurn(index){
  if(!state.conversation||state.playing)return;
  state.turnIndex=Math.max(0,Math.min(index,state.conversation.turns.length-1));
  updateTurnFocus();
}
$('previous-turn').addEventListener('click',()=>focusTurn(state.turnIndex-1));
$('next-turn').addEventListener('click',()=>focusTurn(state.turnIndex+1));

function renderConversation(){
  const edge=shownEdge(),box=$('conversation-content');box.replaceChildren();
  state.conversation=null;
  $('turn-navigation').hidden=true;
  $('graph-dialogue-label').hidden=true;
  stage.setActiveSpeaker('');
  if(state.hover?.kind==='identity'){
    const identity=state.layerView?.relationships.find(item=>item.id===state.hover.id);
    if(identity){box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','A shared tag or identifier is not a historical relationship.','muted'));$('voice-controls').hidden=true;$('play').disabled=true;return;}
  }
  if(state.identityEdge&&state.identityEdge.id===state.edge&&state.hover?.kind!=='edge'){
    const identity=state.identityEdge;
    box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','Hidden layers remove both the line and its hit target. This edge is not a historical relationship.','muted'));
    $('voice-controls').hidden=true;$('play').disabled=true;return;
  }
  if(!edge){box.append(node('h2','No shared category in this view.'),node('p','Try another object, category or perspective. An absent edge does not mean the objects have no relationship.'));$('voice-controls').hidden=true;$('play').disabled=true;return;}
  const source=record(),target=state.records.find(r=>r.accession===edge.target);
  const c=conversationFor(source,target,edge,state.lens,{source:state.snapshots.get(state.seed),target:state.snapshots.get(target.accession)});state.conversation=c;
  const turnKey=state.seed+'|'+edge.id+'|'+state.lens;
  if(state.turnKey!==turnKey){state.turnIndex=0;state.turnKey=turnKey;}
  const kind=c.mode==='CURATED_EDGE_SCENE'?'ARTIST-AUTHORED SCENE · EDITORIAL DRAFT':
    c.edgeMode==='QUESTION_THIS_LINK'?'QUESTIONABLE MATCH · METADATA ONLY':'SOURCE-BOUNDED METADATA READING';
  box.append(node('span',kind,'evidence-type'));
  if(c.dramaticArc)box.append(node('h2',c.dramaticArc));
  const chat=node('div',undefined,'chat');
  const linkColor=tagColor(edge.reasons[0].value);
  const topic=node('p',c.scriptBasis?.value||edge.reasons[0].value,'chat-topic');topic.style.background=linkColor;topic.style.color='#111';chat.append(topic);
  chat.style.setProperty('--link',linkColor);
  const guide=CARD_BY_ID.get('archivist');
  const faces={
    objectA:{name:source.title,src:avatarFor(source),side:'a'},
    objectB:{name:target.title,src:avatarFor(target),side:'b'},
    archivist:{name:'Archivist',src:guide?portraitUrl(guide):'',side:'guide'}
  };
  for(const turn of c.turns){
    const face=faces[turn.role]||faces.archivist;
    const bubble=node('article',undefined,'bubble turn side-'+face.side);bubble.dataset.role=turn.role;
    const img=node('img');img.className='avatar';img.alt='';img.src=face.src;
    const say=node('div',undefined,'say');
    const roleLabel=turn.role==='objectA'?'OBJECT A':turn.role==='objectB'?'OBJECT B':'THE ARCHIVIST';
    say.append(node('span',roleLabel,'speaker-id'),node('strong',face.name),node('p',turn.text));
    for(const citation of turn.citations||[])say.append(node('small','Catalog field '+citation.pointer+' · '+citation.retrievedAt,'muted'));
    bubble.append(img,say);chat.append(bubble);
  }
  box.append(chat);
  if(c.nextPrompt)box.append(node('p','NEXT QUESTION · '+c.nextPrompt,'edge-next-question'));
  // A narrative edge can become a new starting object. Make this an explicit
  // visitor action; graph connectivity is never inferred from the dialogue.
  const actions=node('div',undefined,'edge-path-actions');
  const follow=node('button','Follow this object');
  follow.type='button';follow.dataset.followObject=target.accession;
  follow.setAttribute('aria-label','Continue the investigation with '+target.title);
  follow.addEventListener('click',()=>{
    if(state.journey.length>=8)state.journey.shift();
    state.journey.push(state.seed);
    changeSeed(target.accession);setPanel('conversation');
  });
  actions.append(follow);
  if(state.journey.length){
    const back=node('button','Back to previous object','quiet');
    back.type='button';back.dataset.returnObject=state.journey[state.journey.length-1];
    back.addEventListener('click',()=>{
      const previous=state.journey.pop();if(previous){changeSeed(previous);setPanel('conversation');}
    });
    actions.append(back);
  }
  box.append(actions);
  const details=node('details');details.append(node('summary','Inspect the reason for this edge'));
  for(const reason of c.evidence){const e=node('div',undefined,'reason');e.append(node('strong',reason.family+' / '+reason.value),node('small',reason.sourceColumns.join(' + ')+' → '+reason.targetColumns.join(' + ')),node('small','Shared by '+reason.candidateCount+' records in this local index.'));details.append(e);}
  details.append(node('p',c.limits,'muted'),node('p','A shared tag is not a historical relationship.','muted'));box.append(details);$('voice-controls').hidden=false;$('play').disabled=state.playing;
  if($('audio-elapsed'))$('audio-elapsed').textContent='Turn 1 of '+c.turns.length;
  updateTurnFocus();
}
function pair(list,label,value){list.append(node('dt',label),node('dd',value||'Not supplied'));}
function renderRecord(){
  const r=focusRecord(),box=$('record-content');
  box.replaceChildren(node('h2',r.title));
  if(r.source!=='lakehouse')box.prepend(node('span',r.source==='invented'?'INVENTED EXAMPLE':r.source==='public-packet'?'PUBLIC PACKET · IDENTITY ONLY':'LOCAL CSV · SOURCE INPUT','evidence-type'));
  if(r.source==='public-packet')box.append(node('p','This packet identifies an accession and title only. No direct historical relationship, source-linked image, or staff-tag neighbor has been established for it in this view.','muted'));
  if(photo(r)){const img=node('img');img.src=photo(r);img.alt='Locally supplied image matched to '+r.accession;box.append(img);}
  const list=node('dl');pair(list,'Accession',r.accession);pair(list,'Creator',r.creator);pair(list,'Date',r.date);pair(list,'Categories',(r.tags||[]).filter(t=>t.family==='theme').map(t=>t.value).join(' · '));
  if(r.catalogSubject)pair(list,'Catalog subject',r.catalogSubject);
  pair(list,'Image source',photo(r)?'Local file · permission and credit remain with the source':'Illustrative card · no collection photo loaded');box.append(list);
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
  state.hover=null;
  state.view=societyView(state.records,state.seed,state.lens,{atlas:$('atlas-mode').checked,theme:$('theme').value});
  const lens=LENSES.find(l=>l.id===state.lens);
  message('lens-question',lens.question);
  const current=record();
  message('atlas-title',current?.title?current.title+' · '+current.accession:'');
  renderGraph();
  const identityVisible=state.identityEdge&&state.layerView.relationships.some(edge=>edge.id===state.identityEdge.id);
  if(!identityVisible){
    state.identityEdge=null;
    if(!state.view.edges.some(edge=>edge.id===state.edge))state.edge=state.view.edges[0]?.id||null;
  }
  const identityCount=state.layerView?.relationships.length||0;
  message('counts',state.view.nodes.length+' visible objects · '+state.view.edges.length+' conversation paths · '+identityCount+' identity or storage lines · 0 historical claims inferred');
  renderStage();renderConversation();renderRecord();
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
      $('voice-controls')?.classList.add('playing');
      if($('audio-elapsed'))$('audio-elapsed').textContent='Turn '+(i+1)+' of '+conversation.turns.length;
      state.turnIndex=i;
      stage.setSpeaking(turn.role==='objectA'?conversation.source:turn.role==='objectB'?conversation.target:'');
      updateTurnFocus();
      document.querySelectorAll('#conversation-content .turn').forEach((el,index)=>el.classList.toggle('speaking',index===i));
      if(mode==='device'){
        await speakOnDevice(turn,localVoice);
      }else{
        try{
          voiceAbort=new AbortController();
          const response=await service('voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:turn.text,role:turn.role,confirmed:true}),signal:voiceAbort.signal});
          const url=URL.createObjectURL(await response.blob());
          try{
            if(session!==playback)return;const audio=new Audio(url);currentAudio=audio;
            await new Promise((resolve,reject)=>{audio.onended=resolve;audio.onerror=()=>reject(new Error('Audio playback unavailable.'));audio.onpause=()=>{if(session!==playback)resolve();};audio.play().catch(reject);});
          }finally{URL.revokeObjectURL(url);currentAudio=null;}
        }catch(error){
          if(session!==playback||error.name==='AbortError')return;
          const provider=error.message;
          // A known-disabled provider is a configuration state, not a transient
          // audio failure. Preserve this actionable status and avoid retrying
          // with an unconfirmed local voice or additional network requests.
          if(/not enabled/i.test(provider))throw error;
          message('voice-status',provider);
          try{await speakOnDevice(turn,localVoice);}catch(deviceError){if(session===playback)message('voice-status',provider+' '+deviceError.message);}
        }
      }
    }
    if(session===playback)message('voice-status','Finished · this was a scripted interpretation, not historical testimony.');
  }catch(error){if(session===playback)message('voice-status',error.message);}
  finally{if(session===playback){state.playing=false;$('play').disabled=false;document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));$('voice-controls')?.classList.remove('playing');stage.setSpeaking('');updateTurnFocus();}}
}
function speakOnDevice(turn,voice){
  return new Promise((resolve,reject)=>{
    if(!window.speechSynthesis){reject(new Error('No device speech service. The written transcript remains available.'));return;}
    cancelDeviceSpeech=resolve;
    const utterance=new SpeechSynthesisUtterance(turn.text);
    if(voice)utterance.voice=voice;
    utterance.rate=.92;
    utterance.pitch=turn.role==='objectA'?0.95:turn.role==='objectB'?1.08:1;
    utterance.onend=()=>{cancelDeviceSpeech=null;resolve();};
    utterance.onerror=()=>{cancelDeviceSpeech=null;reject(new Error('Device speech stopped or unavailable.'));};
    window.speechSynthesis.speak(utterance);
  });
}
function invalidateData(){stop();resetApproval();lookupAbort?.abort();state.epoch++;state.edge=null;state.turnIndex=0;state.turnKey=null;state.journey=[];state.snapshots.clear();state.payload=null;state.lookupBusy=false;}
function saveConversation(){
  if(!state.conversation)return;
  const payload={...state.conversation,exportedAt:new Date().toISOString(),source:record().source,notice:'Local research export. Review permissions before sharing. No photos, service token or provider credentials included.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=node('a');a.href=url;a.download='archive-conversation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('lens').replaceChildren(...LENSES.map(p=>{const o=node('option',p.label);o.value=p.id;return o;}));
$('lens').addEventListener('change',()=>{stop();resetApproval();state.lens=$('lens').value;state.edge=null;render();paintReading();});
function paintReading(){
  const card=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  $('reading-portrait').src=portraitUrl(card);
  $('reading-name').textContent=card.label;
  for(const button of document.querySelectorAll('[data-lens]'))button.setAttribute('aria-pressed',String(button.dataset.lens===state.lens));
}
$('reading-popover').replaceChildren(...LENSES.map(lens=>{
  const card=CARD_BY_ID.get(lens.id);
  const button=node('button');
  button.type='button';button.className='reading-choice';button.dataset.lens=lens.id;
  const img=node('img');img.src=portraitUrl(card);img.alt='';
  button.append(img,node('span',lens.label));
  button.addEventListener('click',()=>{$('lens').value=lens.id;$('lens').dispatchEvent(new Event('change'));$('reading-popover').hidden=true;$('reading-toggle').setAttribute('aria-expanded','false');});
  return button;
}));
document.querySelector('.finder').addEventListener('submit',event=>event.preventDefault());
$('reading-toggle').addEventListener('click',()=>{const open=$('reading-popover').hidden;for(const id of ['seed','theme']){$(id+'-popover').hidden=true;$(id+'-toggle').setAttribute('aria-expanded','false');}$('reading-popover').hidden=!open;$('reading-toggle').setAttribute('aria-expanded',String(open));});
function toggleTool(button,popover){
  const open=popover.hidden;
  $('reading-popover').hidden=true;$('reading-toggle').setAttribute('aria-expanded','false');
  for(const id of ['seed','theme']){$(id+'-popover').hidden=true;$(id+'-toggle').setAttribute('aria-expanded','false');}
  popover.hidden=!open;button.setAttribute('aria-expanded',String(open));
}
$('seed-toggle').addEventListener('click',()=>toggleTool($('seed-toggle'),$('seed-popover')));
$('theme-toggle').addEventListener('click',()=>toggleTool($('theme-toggle'),$('theme-popover')));
document.addEventListener('click',event=>{
  if(!$('reading-popover').hidden&&!event.target.closest('.reading')){$('reading-popover').hidden=true;$('reading-toggle').setAttribute('aria-expanded','false');}
  for(const id of ['seed','theme']){
    if($(id+'-popover').hidden||event.target.closest('[data-tool="'+id+'"]'))continue;
    $(id+'-popover').hidden=true;$(id+'-toggle').setAttribute('aria-expanded','false');
  }
});
const stage=mountForceStage($('stage'),{onSelect:id=>onGraphSelect(id),background:'#111111'});
paintReading();
$('seed').addEventListener('change',()=>{state.journey=[];changeSeed($('seed').value);});
$('search').addEventListener('input',()=>{stop();resetApproval();options();render();});
for(const id of ['layer-accession','layer-box','layer-box-sim'])$(id).addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();});
$('atlas-mode').addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();stage.fit();});
$('theme').addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();});
$('veil').addEventListener('input',renderGraph);
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
$('voice-mode').addEventListener('change',()=>{stop();resetApproval();$('approval-box').hidden=$('voice-mode').value!=='elevenlabs';});
$('play').addEventListener('click',play);$('stop').addEventListener('click',()=>{stop();message('voice-status','Playback stopped.');});$('export').addEventListener('click',saveConversation);
$('restore').addEventListener('click',()=>{invalidateData();state.records=inventedRecords();state.seed=state.records[0].accession;$('search').value='';$('atlas-mode').checked=false;categories();options();fit();render();message('import-status','Invented example restored.');});
$('csv-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw new Error('CSV exceeds the 5 MiB demo limit.');const parsed=parseMatrixCsv(await file.text());invalidateData();state.records=parsed.records.map(r=>({...r,source:'local-csv'}));state.seed=state.records[0].accession;$('search').value='';categories();options();fit();render();message('import-status',state.records.length+' CSV objects loaded locally. No upload.');}catch(error){message('import-status',error.message);}finally{e.target.value='';}
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
$('check-services').addEventListener('click',async()=>{
  try{
    const r=await service('status'),s=await r.json();
    const voices=s.voices||{};
    const roles=[['objectA','object A'],['objectB','object B'],['archivist','archivist']];
    const ready=roles.filter(([key])=>voices[key]).map(([,label])=>label);
    const missing=roles.filter(([key])=>!voices[key]).map(([,label])=>label);
    const voiceLine=missing.length?'voice IDs still needed for '+missing.join(', '):'voices ready for '+ready.join(', ');
    message('service-status','Lakehouse: '+(s.lakehouse?'enabled':'disabled')+' · ElevenLabs: '+(s.elevenlabs?'enabled':'disabled')+' · '+voiceLine+' · live conversation model: no.');
  }catch(error){message('service-status',error.message);}
});
$('zoom-in').addEventListener('click',()=>zoom(1.2));$('zoom-out').addEventListener('click',()=>zoom(1/1.2));$('fit').addEventListener('click',fit);
$('zoom').addEventListener('input',()=>setZoomT(Number($('zoom').value)));
for(const button of document.querySelectorAll('[data-stop]'))button.addEventListener('click',()=>setZoomT(Number(button.dataset.stop)));
$('present').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('voice-status','Full screen unavailable on this device.');}});
$('admin-toggle').addEventListener('click',()=>{const open=$('admin').hidden;$('admin').hidden=!open;$('admin-toggle').setAttribute('aria-expanded',String(open));});
$('access-token').addEventListener('input',()=>sessionStorage.setItem('archive-demo-token',$('access-token').value));
if(sessionStorage.getItem('archive-demo-token'))$('access-token').value=sessionStorage.getItem('archive-demo-token');
window.addEventListener('beforeunload',()=>{stop();});
function bestSeed(records){
  if(records.some(item=>item.accession===OPENING_ACCESSION))return OPENING_ACCESSION;
  let best=records[0].accession,count=-1;
  for(const item of records){
    const edges=societyView(records,item.accession,'family').edges.length;
    if(edges>count){count=edges;best=item.accession;}
  }
  return best;
}
async function loadLakehouse(){
  try{
    const response=await fetch('/data/lakehouse/project-matches.json');
    if(!response.ok)return;
    const packet=await response.json();
    const graph=conversationRecords(packet);
    if(graph.strong<2)return;
    state.records=graph.records;
    state.seed=bestSeed(graph.records);
    for(const [accession,snapshot] of lookupSnapshots(packet,graph.records))state.snapshots.set(accession,snapshot);
  }catch{/* The invented field remains when the local capture is missing. */}
}
const requested=new URLSearchParams(location.search).get('accession');
await loadLakehouse();
// Preserve a requested public packet identity even when this graph has no source-backed neighbors.
// Never infer thematic relationships for the fallback record.
if(requested)state.records=withPublicAnchorFallback(state.records);
if(requested&&state.records.some(item=>item.accession===requested))state.seed=requested;
categories();options();render();
if(requested&&!state.records.some(item=>item.accession===requested))message('import-status','Requested accession is not in the loaded set. No identity was assumed.');
