import { buildDiscoveryIndex, parseMatrixCsv, recommendNeighbors } from '../../src/discovery-graph.mjs';
import { inventedRecords, societyView, conversationFor, LENSES, WORLD, categoryIconUrl, district, deviceCast } from '../../src/archive-society.mjs';
import { CARD_BY_ID, portraitUrl, portraitFallbackUrl } from '../../src/discovery-personas.mjs';
import { applyLayers, buildAtlasGraph, recordsToAtlasInput } from '../../src/atlas-graph.mjs';
import { reconcileLookup } from '../../src/archive-evidence.mjs';
import { applyLakehouseFields, conversationRecords, lookupSnapshots } from '../../src/lakehouse-matches.mjs';
import { MATRIX_OBJECTS, layoutRoom, matrixToRecords } from '../../src/matrix-room.mjs';
import { localImageUrl } from '../../src/local-images.mjs';
import { OPENING_ACCESSION, PRESENTATION_PAIRS } from '../../src/presentation-pairs.mjs';
import { withPublicAnchorFallback } from '../../src/object-lens-core.mjs';
import { focusedPairGraph } from '../../src/force-graph-data.mjs';
import { mountForceStage } from '../force-stage.mjs';
import { nearestZoomStop } from '../../src/zoom-stops.mjs';
import { visitorGuide } from '../../src/visitor-guide.mjs';
import { explainEncounter, conversationEpisode, connectionCaption, visitorFollowUp } from '../../src/conversation-orientation.mjs';
import { CURATORIAL_PATHS, juxtapositionConversation, pathById } from '../../src/curatorial-relationships.mjs';
import { scriptedScenePlan } from '../../src/scene-performance.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const state={records:inventedRecords(),seed:'FICTION-01',lens:'family',edge:null,identityEdge:null,layerView:null,journey:[],
  mapMode:'conversation',matrixObjects:MATRIX_OBJECTS,matrixRecords:matrixToRecords(MATRIX_OBJECTS),matrixIndex:null,room:null,district:null,
  urls:new Set(),snapshots:new Map(),payload:null,
  background:'./assets/archive-landscape.jpg',scale:1,panX:0,panY:0,
  playing:false,epoch:0,view:null,conversation:null,episode:null,recordAccession:null,lookupBusy:false,hover:null,researchPath:null};
let playback=0,voiceAbort=null,currentAudio=null,lookupAbort=null,cancelDeviceSpeech=null;
const appearanceKey='archive-dreams-appearance';
function personaTone(){return document.documentElement.dataset.colorTheme==='light'?'ink':'white';}
function bindPersonaImage(image,card,variant='full',fixedTone=null){
  if(!card)return;
  image.dataset.personaId=card.id;
  image.dataset.personaVariant=variant;
  if(fixedTone)image.dataset.personaTone=fixedTone;
  else delete image.dataset.personaTone;
  image.classList.add('persona-symbol');
  image.alt=''; // The adjacent visible text identifies the perspective.
  const tone=fixedTone||personaTone();
  image.onerror=()=>{
    image.onerror=null;
    image.src=portraitFallbackUrl(card,{tone,variant});
  };
  image.src=portraitUrl(card,{tone,variant});
}
function refreshPersonaImages(){
  document.querySelectorAll('img[data-persona-id]').forEach(image=>{
    const card=CARD_BY_ID.get(image.dataset.personaId);
    if(card)bindPersonaImage(image,card,image.dataset.personaVariant||'full',image.dataset.personaTone||null);
  });
}
function applyAppearance(mode){
  const light=mode==='light';
  document.documentElement.dataset.colorTheme=light?'light':'dark';
  refreshPersonaImages();
  const toggle=$('appearance-toggle');
  if(toggle){
    const action=light?'Switch to dark appearance':'Switch to light appearance';
    toggle.setAttribute('aria-label',action);
    toggle.setAttribute('aria-pressed',String(light));
    toggle.title=action;
  }
}
try { applyAppearance(localStorage.getItem(appearanceKey)==='light'?'light':'dark'); }
catch { applyAppearance('dark'); }
$('appearance-toggle')?.addEventListener('click',()=>{
  const mode=document.documentElement.dataset.colorTheme==='light'?'dark':'light';
  applyAppearance(mode);
  try { localStorage.setItem(appearanceKey,mode); } catch { /* visual preference is still applied */ }
  syncDream();
});

// The archived transcript remains present and inspectable before, during and
// after any choreography. A silent scene preview is NOT narrated speech or AI
// "thinking": it runs only the five author-approved speaking roles.
let previewEpoch=0,previewTimers=[];
function cancelScriptedPreview(){
  previewEpoch++;
  for(const timer of previewTimers)clearTimeout(timer);
  previewTimers=[];
  document.querySelectorAll('#room-participants .room-participant.previewing, #conversation-content .turn.previewing')
    .forEach(element=>element.classList.remove('previewing'));
  const replay=$('scene-replay');
  if(replay){
    replay.textContent='↻';
    replay.removeAttribute('data-role');
    replay.setAttribute('aria-pressed','false');
  }
  if($('room-header'))$('room-header').removeAttribute('data-scene-preview');
  if(typeof stage!=='undefined'&&!state.playing)stage.setSpeaking('');
}
function markPreviewTurn(role,index){
  document.querySelectorAll('#room-participants .room-participant').forEach(
    card=>card.classList.toggle('previewing',card.dataset.speaker===role));
  document.querySelectorAll('#conversation-content .chat .turn').forEach(
    (turn,i)=>turn.classList.toggle('previewing',i===index));
  const replay=$('scene-replay');
  if(replay){
    replay.dataset.role=role;
    replay.textContent=role==='objectA'?'→':role==='objectB'?'←':'·';
  }
  if(role==='objectA'||role==='objectB')stage.setSpeaking(
    role==='objectA'?state.conversation?.source:state.conversation?.target);
  else stage.setSpeaking('');
}
function replayScriptedScene(){
  cancelScriptedPreview();
  if(state.playing||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const plan=scriptedScenePlan(state.episode);
  if(!plan.length||!state.conversation)return;
  const current=previewEpoch;
  $('room-header').dataset.scenePreview='scripted';
  $('scene-replay')?.setAttribute('aria-pressed','true');
  for(const cue of plan){
    previewTimers.push(setTimeout(()=>{
      if(current!==previewEpoch||state.playing)return;
      if(cue.kind==='turn')markPreviewTurn(cue.role,cue.index);
      else if(cue.kind==='complete')cancelScriptedPreview();
    },cue.at));
  }
}
// Scripted room entrance: staged theater, never an assertion that AI is thinking.
// The written transcript remains in the DOM from the first frame.
let entranceEpoch=0,entranceAnimations=[];
function cancelSceneEntrance(){
  cancelScriptedPreview();
  entranceEpoch++;
  for(const animation of entranceAnimations)animation.cancel();
  entranceAnimations=[];
}
function startSceneEntrance(){
  cancelSceneEntrance();
  if(state.episode?.mode!=='CURATED_SCRIPT'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const epoch=entranceEpoch;
  requestAnimationFrame(()=>{
    if(epoch!==entranceEpoch||document.body.classList.contains('show-timeline'))return;
    const animate=(element,frames,delay,duration)=>{
      if(!element?.animate)return;
      entranceAnimations.push(element.animate(frames,{duration,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'}));
    };
    animate($('room-question'),[{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],0,260);
    document.querySelectorAll('#room-participants .room-participant').forEach((element,i)=>
      animate(element,[{opacity:.55,transform:'translateY(8px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],90+i*100,340));
    document.querySelectorAll('#conversation-content .chat .turn').forEach((element,i)=>
      animate(element,[{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],220+i*100,240));
    animate(document.querySelector('#room-participants .object-cast-link'),
      [{opacity:.3,transform:'translate(-50%,-50%) scale(.85)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],160,430);
    // The selected scene performs a short, silent exchange. No transcription
    // is streamed, hidden, or recomputed; Listen remains explicit.
    replayScriptedScene();
  });
}
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
const message=(id,text)=>{const el=$(id);el.textContent=text;if(id==='voice-status')el.hidden=!text;};
function countIcon(draw){
  const icon=svg('svg',{viewBox:'0 0 24 24','aria-hidden':'true'});
  draw(icon);
  return icon;
}
function paintCounts(items){
  $('counts').replaceChildren(...items.map(([icon,value,label])=>{
    const chip=node('span',undefined,'count-chip');
    chip.title=label;chip.setAttribute('aria-label',value+' '+label);
    chip.append(icon,node('b',String(value)));
    return chip;
  }));
  const facts=$('sheet-facts');
  if(facts)facts.replaceChildren(...items.map(([,value,label])=>node('li',value+' '+label)));
}
function objectIcon(){return countIcon(icon=>{icon.append(svg('rect',{x:'4',y:'5',width:'16',height:'14',rx:'2',fill:'none',stroke:'currentColor','stroke-width':'1.6'}),svg('circle',{cx:'9',cy:'10',r:'1.3',fill:'currentColor'}),svg('path',{d:'M4 16.5 8.5 13l3 2.2 2.8-2 5.7 4',fill:'none',stroke:'currentColor','stroke-width':'1.6'}));});}
function pathIcon(){return countIcon(icon=>{icon.append(svg('circle',{cx:'7',cy:'12',r:'2',fill:'currentColor'}),svg('circle',{cx:'17',cy:'12',r:'2',fill:'currentColor'}),svg('path',{d:'M9 12h6',fill:'none',stroke:'currentColor','stroke-width':'1.6'}));});}
function storageIcon(){return countIcon(icon=>{icon.append(svg('path',{d:'M4 8l8-4 8 4-8 4-8-4zM4 8v8l8 4 8-4V8',fill:'none',stroke:'currentColor','stroke-width':'1.6'}));});}
function claimIcon(){return countIcon(icon=>{icon.append(svg('circle',{cx:'12',cy:'12',r:'7',fill:'none',stroke:'currentColor','stroke-width':'1.6'}),svg('path',{d:'M8.5 12.2 11 14.5 15.5 9.5',fill:'none',stroke:'currentColor','stroke-width':'1.6','stroke-linecap':'round'}));});}
const roomMode=()=>state.mapMode!=='conversation';
const viewingRecords=()=>roomMode()?state.matrixRecords:state.records;
const record=()=>viewingRecords().find(r=>r.accession===state.seed);
function roomPair(accession){
  if(!state.matrixIndex)state.matrixIndex=buildDiscoveryIndex(state.matrixRecords);
  if(!state.matrixIndex.objects.get(accession))return null;
  const neighbor=recommendNeighbors(state.matrixIndex,accession,state.lens,1)[0];
  if(!neighbor)return null;
  return {edge:{
    id:accession+'::'+neighbor.record.accession,source:accession,target:neighbor.record.accession,
    reasons:neighbor.reasons,classification:'shared_staff_metadata',historicalRelationshipEstablished:false,
  }};
}
function setMapMode(mode){
  stop();resetApproval();
  state.mapMode=mode;state.district=null;state.edge=null;
  for(const button of document.querySelectorAll('[data-map]'))button.setAttribute('aria-checked',String(button.dataset.map===mode));
  const chosen=document.querySelector('[data-map="'+mode+'"]');
  if($('map-name')&&chosen)$('map-name').textContent=chosen.textContent;
  closeSheet();
  if(mode==='conversation'){
    if(!state.records.some(item=>item.accession===state.seed))state.seed=bestSeed(state.records);
  }else{
    state.room=layoutRoom(state.matrixObjects,mode);
    if(!state.room.nodes.some(item=>item.accession===state.seed))state.seed=state.room.nodes[0]?.accession||state.seed;
  }
  render();
  if(mode==='conversation')setZoomT(34);else stage.fit();
}
const photo=r=>r?.researchOnly?'' :localImageUrl(r?.accession);
// These drawings are produced by the artist from public packet descriptions.
// They do not represent institutionally released object photography.
const PACKET_STUDIES=Object.freeze({
  '86.17.1':'trylon-perisphere.svg',
  'XX1990.1484':'sparton-radio.svg',
  'XM1999.108.8':'machine-age-catalogue.svg',
  '85.7.383a,b':'mappemonde-vase.svg',
  '85.4.72':'poster-in-1939.svg',
  '86.19.57':'program-tomorrow.svg',
  'XB1992.1640':'futurama-booklet.svg',
  '2012.6.1':'rca-television.svg'
});
function objectVisual(record){
  const image=photo(record);
  if(image)return {src:image,label:'Collection image'};
  const study=PACKET_STUDIES[record?.accession];
  return study?{src:'../assets/objects/'+study,label:'Artist diagram'}:{src:null,label:'Record only'};
}
function questionCountFor(accession){
  const pairs=new Set();
  for(const path of CURATORIAL_PATHS){
    if(path.source.accession===accession||path.target.accession===accession)
      pairs.add([path.source.accession,path.target.accession].sort().join('::'));
  }
  for(const pair of PRESENTATION_PAIRS){
    if(pair.source===accession||pair.target===accession)
      pairs.add([pair.source,pair.target].sort().join('::'));
  }
  return pairs.size;
}
function fit(){stage.fit();syncZoomUi();}
function setZoomT(t){stage.setZoomT(t);syncZoomUi();}
function zoom(amount){stage.zoom(amount);syncZoomUi();}
function syncZoomUi(){
  const input=$('zoom');
  state.scale=stage.scale();
  state.t=stage.zoomT();
  if(input)input.value=String(Math.round(state.t));
  const stop=nearestZoomStop(state.t);
  for(const button of document.querySelectorAll('[data-stop]')){
    const on=Number(button.dataset.stop)===stop.t;
    button.classList.toggle('on',on);
    button.setAttribute('aria-pressed',String(on));
  }
  if($('fit')){
    const on=stop.id==='world';
    $('fit').classList.toggle('on',on);
    $('fit').setAttribute('aria-pressed',String(on));
  }
  if($('zoom-note'))$('zoom-note').textContent=stop.note;
  if($('zoom-name'))$('zoom-name').textContent=stop.label;
}
function transportIcon(kind){
  const icon=svg('svg',{viewBox:'0 0 24 24','aria-hidden':'true'});
  if(kind==='stop')icon.append(svg('rect',{x:'6',y:'6',width:'12',height:'12',rx:'1.5',fill:'currentColor'}));
  else icon.append(svg('path',{d:'M8 6v12l10-6z',fill:'currentColor'}));
  return icon;
}
function setPlayDisabled(disabled){
  disabled=disabled||state.episode?.mode==='RESEARCH_PROMPT';
  const playing=state.playing;
  const play=$('play');
  play.disabled=playing?false:disabled;
  play.setAttribute('aria-label',playing?'Stop':'Play');
  play.setAttribute('aria-pressed',String(playing));
  play.replaceChildren(transportIcon(playing?'stop':'play'));
  const space=$('space-play');
  if(space){
    space.disabled=play.disabled;
    const label=space.querySelector('.space-tab-label');
    if(label)label.textContent=playing?'Stop':'Listen';
    space.setAttribute('aria-label',playing?'Stop conversation':'Play conversation');
    space.setAttribute('aria-pressed',String(playing));
  }
}
function setPanel(name){
  if(name==='record')cancelSceneEntrance();
  for(const p of ['conversation','record'])$(p+'-panel').hidden=p!==name;
  for(const b of document.querySelectorAll('[data-panel]'))b.setAttribute('aria-pressed',String(b.dataset.panel===name));
  document.querySelector('.evidence-rail')?.classList.toggle('show-record',name==='record');
  if($('voice-controls'))$('voice-controls').hidden=name!=='conversation'||!state.conversation;
  syncMobileNavigation();
}
function resetApproval(){ $('external-approved').checked=false; }
function stop(){
  cancelSceneEntrance();
  playback++;voiceAbort?.abort();voiceAbort=null;
  if(currentAudio){currentAudio.pause();currentAudio=null;}
  window.speechSynthesis?.cancel();cancelDeviceSpeech?.();cancelDeviceSpeech=null;state.playing=false;setPlayDisabled(!state.conversation);
  document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));
  markSpeaker('');
  const audioBar=$('voice-controls');
  audioBar?.classList.remove('playing');
  if(audioBar)audioBar.dataset.speaker='';
  if($('audio-speaker'))$('audio-speaker').textContent='Ready to listen';
  stage.setSpeaking('');
}
function changeSeed(id){stop();resetApproval();state.researchPath=null;state.seed=id;state.edge=null;
  state.recordAccession=null;
  if(state.payload)state.snapshots.set(id,reconcileLookup(state.payload,id,'UNKNOWN_LOCAL_CAPTURE_TIME'));
  render();setPanel('record');breathDream();}
function options(){
  const query=$('search').value.toLowerCase();
  const entries=state.records.filter(r=>(r.title+' '+r.accession).toLowerCase().includes(query));
  $('seed').replaceChildren(...entries.map(r=>{const o=node('option',r.title+' · '+r.accession);o.value=r.accession;return o;}));
  $('seed').value=state.seed;
  if(!$('seed').value&&entries.length){state.seed=entries[0].accession;$('seed').value=state.seed;state.edge=null;}
  paintChoices();
}
function paintChoices(){
  const current=viewingRecords().find(item=>item.accession===state.seed)||state.records.find(item=>item.accession===state.seed);
  if($('seed-name'))$('seed-name').textContent=current?.title||state.seed;
  if($('seed-portrait')&&current)$('seed-portrait').src=photo(current)||objectBadge(current);
  paintTheme();
}
function conversationCenters(){
  const records=(state.view?.nodes||[]).map(item=>item.record).filter(Boolean);
  if(records.length&&records.length<=8)return records;
  const ids=new Set([state.seed]);
  for(const edge of state.view?.edges||[]){ids.add(edge.source);ids.add(edge.target);}
  const picked=records.filter(item=>ids.has(item.accession));
  return picked.length?picked:records.slice(0,1);
}
function paintSeedChoices(){
  const box=$('seed-choices');if(!box)return;
  box.replaceChildren(...conversationCenters().map(item=>{
    const button=node('button');
    button.type='button';button.className='reading-choice';
    button.setAttribute('aria-pressed',String(item.accession===state.seed));
    button.title=item.title;button.setAttribute('aria-label',item.title);
    const image=node('img');image.alt='';image.src=photo(item)||objectBadge(item);
    button.append(image,node('span',item.title));
    button.addEventListener('click',()=>{
      state.journey=[];
      $('seed').value=item.accession;
      changeSeed(item.accession);
      setPanel('conversation');
      closeSheet();
    });
    return button;
  }));
}
function paintTheme(){
  const value=$('theme')?.value||'';
  if($('theme-name'))$('theme-name').textContent=value||'All';
  for(const button of document.querySelectorAll('#theme-choices [data-theme]'))button.setAttribute('aria-pressed',String(button.dataset.theme===value));
}
function categories(){
  const themes=[...new Set(state.records.flatMap(r=>(r.tags||[]).filter(t=>t.family==='theme').map(t=>t.value)))].sort();
  const all=node('option','All categories');all.value='';
  $('theme').replaceChildren(all,...themes.map(t=>{const o=node('option',t);o.value=t;return o;}));
  const box=$('theme-choices');if(!box)return;
  box.replaceChildren(...['',...themes].map(value=>{
    const button=node('button');
    button.type='button';button.className='reading-choice';button.dataset.theme=value;
    const swatch=node('i');swatch.style.background=value?tagColor(value):'#d7d7d7';
    button.append(swatch,node('span',value||'All categories'));
    button.addEventListener('click',()=>{
      $('theme').value=value;
      $('theme').dispatchEvent(new Event('change'));
      closeSheet();
    });
    return button;
  }));
  paintTheme();
}
function lensMatch(record){
  const lens=LENSES.find(item=>item.id===state.lens)||LENSES[0];
  return Object.entries(lens.focus||{}).some(([family,values])=>(record.tags||[]).some(tag=>tag.family===family&&values.includes(tag.value)));
}
function portraitFor(record){
  if(!lensMatch(record))return '';
  const card=CARD_BY_ID.get(state.lens);
  return card?portraitUrl(card,{tone:personaTone()}):'';
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
  renderStage();renderConversation();renderRecord();
}
function shownEdge(){
  if(!state.view)return null;
  if(state.hover?.kind==='object'||state.hover?.kind==='identity')return state.view.edges.find(e=>e.id===state.edge)||null;
  if(state.hover?.kind==='edge')return state.view.edges.find(e=>e.id===state.hover.id)||null;
  return state.view.edges.find(e=>e.id===state.edge)||null;
}
function researchPeople(){
  if(!state.researchPath)return [];
  return [state.researchPath.source,state.researchPath.target];
}
function person(accession){
  return researchPeople().find(r=>r.accession===accession)||viewingRecords().find(r=>r.accession===accession)||null;
}
function focusRecord(){
  if(state.recordAccession)return person(state.recordAccession)||record();
  if(state.hover?.kind==='object')return person(state.hover.accession)||record();
  if(state.researchPath)return state.researchPath.source;
  return record();
}
function addAvatar(defs,g,href,x,y,size,extra=''){
  const id='avatar-'+Math.random().toString(36).slice(2,9);
  const clip=svg('clipPath',{id});
  clip.append(svg('circle',{cx:x+size/2,cy:y+size/2,r:size/2}));
  defs.append(clip);
  const portrait=svg('image',{href,x,y,width:size,height:size,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#'+id+')',class:('avatar '+extra).trim()});
  if(href.includes('/archive-dreams/brand/personas/'))portrait.addEventListener('error',()=>{
    const card=CARD_BY_ID.get(state.lens);
    if(card)portrait.setAttribute('href',portraitFallbackUrl(card,{tone:personaTone()}));
  },{once:true});
  g.append(portrait);
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
  syncDream();
}
function showEdge(edge){
  if(!edge)return;
  stop();resetApproval();
  state.researchPath=null;
  state.edge=edge.id;
  state.identityEdge=null;
  state.recordAccession=null;
  render();
  setPanel('conversation');
  if(mobileLayout())setMobileView('space');
  breathDream();
  startSceneEntrance();
}
function onGraphSelect(id){
  if(roomMode()){stop();resetApproval();state.district=null;state.seed=id;render();setPanel('conversation');return;}
  const edge = state.view?.edges.find(item => item.target === id || item.source === id);
  if (edge && id !== state.seed) { showEdge(edge); return; }
  if (id !== state.seed) changeSeed(id);
}
function onGraphLink(sourceId, targetId){
  if(roomMode())return;
  const edge=state.view?.edges.find(item=>(item.source===sourceId&&item.target===targetId)||(item.source===targetId&&item.target===sourceId));
  if(edge)showEdge(edge);
}
function stagePlate(rec, kind, speaker){
  const fig=node('figure',undefined,'plate'+(kind?' '+kind:''));
  if(speaker)fig.dataset.speaker=speaker;
  const img=node('img');img.className='object-shot';img.alt='';
  const chosenCard=!photo(rec)&&lensMatch(rec)?CARD_BY_ID.get(state.lens):null;
  if(chosenCard){fig.classList.add('persona');bindPersonaImage(img,chosenCard);}
  else img.src=avatarFor(rec);
  fig.append(img,node('figcaption',rec.title));
  return fig;
}
function personaPlate(card,speaker){
  const fig=node('figure',undefined,'plate persona');
  fig.dataset.speaker=speaker;
  const face=node('img');face.className='object-shot';
  bindPersonaImage(face,card);
  fig.append(face,node('figcaption',card.id==='museum'?card.label+' · fictional':card.label));
  return fig;
}
function markSpeaker(role){
  state.speaker=role||'';
  const lensIsGuide=state.lens==='archivist';
  const active=!state.speaker||state.speaker==='objectA'||(lensIsGuide&&state.speaker==='archivist')?'lens':state.speaker;
  document.querySelectorAll('#zoom-stage [data-speaker]').forEach(plate=>{
    plate.classList.toggle('largest',plate.dataset.speaker===active);
  });
  document.querySelectorAll('#room-participants [data-speaker]').forEach(plate=>{
    const speaking=Boolean(role)&&plate.dataset.speaker===role;
    plate.classList.toggle('speaking',speaking);
    if(speaking)plate.setAttribute('aria-current','true');else plate.removeAttribute('aria-current');
  });
}
function renderStage(){
  const box=$('zoom-stage');if(!box||!state.view)return;
  box.replaceChildren();
  if(state.district){box.append(node('p',state.district.count+' objects · '+state.district.label,'muted'));return;}
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
    if(edge)people=[person(edge.source),person(edge.target)].filter(Boolean);
  }
  const reader=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  const guide=CARD_BY_ID.get('archivist');
  const plates=[];
  if(reader)plates.push(personaPlate(reader,'lens'));
  if(people[0])plates.push(stagePlate(people[0],'selected','objectA'));
  if(people[1])plates.push(stagePlate(people[1],'reply','objectB'));
  if(guide&&guide.id!==reader.id)plates.push(personaPlate(guide,'archivist'));
  if(plates.length>3)row.classList.add('quartet');
  row.append(...plates);
  box.append(row);
  markSpeaker(state.speaker);
}
function clearScene(){
  const tag=$('scene-tag');if(tag)tag.hidden=true;
  const concept=$('sheet-concept');if(concept)concept.hidden=true;
  const title=$('scene-title');
  if(title){title.hidden=true;title.textContent='';title.removeAttribute('title');title.removeAttribute('aria-label');}
}
function paintSceneLabel(label,color,note,arc,kind){
  const tag=$('scene-tag');
  tag.hidden=false;
  tag.textContent=label;tag.style.background=color;tag.style.color='#111';
  tag.title=note;tag.setAttribute('aria-label',note);
  const concept=$('sheet-concept');
  if(concept){concept.hidden=false;concept.textContent=label;concept.style.background=color;concept.style.color='#111';}
  const title=$('scene-title');
  if(title){
    title.hidden=!arc;title.textContent=arc||'';
    if(arc){title.title=kind;title.setAttribute('aria-label',arc+' · '+kind);}
  }
  const sheetNote=$('sheet-note');
  if(sheetNote)sheetNote.textContent=kind;
}
function paintScene(c,edge){
  const kind=c.aiAssisted?'AI-ASSISTED SCRIPT · EDITORIAL DRAFT':c.mode==='CURATED_EDGE_SCENE'?'ARTIST-AUTHORED SCENE · EDITORIAL DRAFT':
    c.edgeMode==='QUESTION_THIS_LINK'?'QUESTIONABLE MATCH · METADATA ONLY':'SOURCE-BOUNDED METADATA READING';
  const curated=c.mode==='CURATED_EDGE_SCENE'&&c.dramaticArc;
  const label=c.scriptBasis?.value||edge.reasons[0].value;
  const colorNote=label+' — this color is the shared category.';
  paintSceneLabel(label,tagColor(edge.reasons[0].value),curated?colorNote:kind+' · '+colorNote,curated?c.dramaticArc:'',kind);
}
function mobileLayout(){return window.matchMedia('(max-width: 800px)').matches;}
function syncMobileNavigation(){
  const view=document.body.classList.contains('show-timeline')?'feed':
    document.body.classList.contains('show-room')?'map':
    document.querySelector('.evidence-rail')?.classList.contains('show-record')?'record':'conversation';
  for(const [key,id] of [['feed','space-feed'],['conversation','space-conversation'],['map','space-room'],['record','space-record']]){
    const button=$(id);
    if(!button)continue;
    if(key===view)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  }
}
function setMobileView(view){
  document.body.classList.remove('show-timeline','show-space','show-room');
  document.body.classList.add('show-'+view);
  if(view==='timeline'){stop();paintTimeline();$('questions-back').focus();}
  if(view==='room')requestAnimationFrame(()=>stage.resize());
  syncMobileNavigation();
}
function placeZoomStage(){
  const zoom=$('zoom-stage');if(!zoom)return;
  if(mobileLayout())$('space-stage')?.append(zoom);
  else document.querySelector('.canvas')?.append(zoom);
}
// The mobile reading surface owns both the objects and dialogue. Desktop
// retains the independent, fixed-height scene header and transcript scroller.
const readingScroller=()=>document.querySelector('.rail-scroll');
function syncMobileRoomStage(){
  const header=$('room-header'),scroller=readingScroller();
  if(!header||!scroller)return;
  if(!mobileLayout()||header.hidden){
    header.classList.remove('is-compact');
    header.style.removeProperty('--room-image-height');
    scroller.style.removeProperty('--room-scroll-offset');
    return;
  }
  const extent=220,progress=Math.min(1,Math.max(0,scroller.scrollTop)/extent);
  const expanded=Math.min(320,Math.max(175,window.innerHeight*0.37));
  const compact=68;
  header.style.setProperty('--room-image-height',Math.round(expanded+(compact-expanded)*progress)+'px');
  // Retain the opening text's scroll position as the cards contract.
  scroller.style.setProperty('--room-scroll-offset',Math.round(extent*progress)+'px');
  header.classList.toggle('is-compact',progress>=.96);
}
function placeRoomHeader(){
  const header=$('room-header'),scroller=readingScroller(),stage=$('space-stage');
  if(!header||!scroller||!stage)return;
  if(mobileLayout()&&header.parentElement!==scroller)scroller.prepend(header);
  else if(!mobileLayout()&&header.parentElement===scroller)stage.before(header);
  syncMobileRoomStage();
}
function syncMobileLayout(){
  placeZoomStage();
  placeRoomHeader();
  if(!mobileLayout()){
    if($('mobile-perspective-sheet')?.open)$('mobile-perspective-sheet').close();
    document.body.classList.remove('show-timeline','show-space','show-room');return;
  }
  if(!document.body.classList.contains('show-timeline')&&!document.body.classList.contains('show-space')&&!document.body.classList.contains('show-room'))document.body.classList.add('show-space');
  if(document.body.classList.contains('show-room'))requestAnimationFrame(()=>stage.resize());
  syncMobileNavigation();
}
function followObject(accession){
  if(state.journey.length>=8)state.journey.shift();
  state.journey.push(state.seed);
  changeSeed(accession);setPanel('conversation');
  if(mobileLayout())setMobileView('space');
}
function edgeCategory(edge){return edge.reasons?.[0]?.value||'';}
function paintListeners(){
  const row=$('listener-row');if(!row)return;
  row.replaceChildren();
  const source=record();
  for(const edge of state.view?.edges||[]){
    const target=viewingRecords().find(item=>item.accession===edge.target);
    if(!source||!target)continue;
    const button=node('button',undefined,'listener');
    button.type='button';
    button.append(node('strong',target.title),node('span',edgeCategory(edge)));
    button.addEventListener('click',()=>followObject(target.accession));
    row.append(button);
  }
}
function questionCard(episode,objects){
  const button=node('button',undefined,'path-post');
  button.type='button';
  const current=episode.id===state.episode?.id;
  if(current)button.setAttribute('aria-current','true');
  const face=node('span',undefined,'question-card-face');
  if(current){
    const meta=node('span',undefined,'question-card-meta');
    meta.append(node('span','Current room','current-room'));
    face.append(meta);
  }
  face.append(node('strong',episode.question));
  const cast=node('span',undefined,'question-card-cast');
  const portraits=node('span',undefined,'question-card-portraits');
  portraits.setAttribute('aria-hidden','true');
  for(const object of objects){
    const image=node('img');
    image.alt='';image.loading='lazy';image.src=photo(object)||objectBadge(object);
    portraits.append(image);
  }
  cast.append(portraits,node('span',episode.participants.map(person=>person.shortName).join(' × ')));
  face.append(cast);
  const preview=node('span',undefined,'question-card-preview');
  const first=episode.turns[0];
  const speaker=episode.participants.find(person=>person.role===first?.role);
  const connectionTerm=episode.relationship.term;
  const unanswered=connectionTerm
    ?'Both records contain “'+connectionTerm+'”. Does that make a meaningful connection?'
    :'What could examining both records reveal?';
  preview.append(node('span',first?(speaker?.shortName||first.speaker):'Open question','preview-speaker'),
    node('span',first?'“'+first.text+'”':unanswered,'preview-line'));
  button.append(face,preview);
  return button;
}
let relatedQuestions=false;
let relatedAnchor=null;
function openObjectQuestions(accession){
  relatedQuestions=true;
  relatedAnchor=accession;
  setMobileView('timeline');
}
function paintTimeline(){
  const list=$('timeline-list');if(!list)return;
  list.replaceChildren();
  if(!document.body.classList.contains('show-timeline'))return;
  const focus=relatedAnchor && (person(relatedAnchor)||state.records.find(record=>record.accession===relatedAnchor));
  $('timeline-title').textContent=relatedQuestions?(focus?'More conversations with '+(focus.title.length>50?focus.title.slice(0,47)+'…':focus.title):'Follow these objects'):'Choose a question';
  $('all-directory-questions').hidden=!relatedQuestions;
  const records=new Map(state.records.map(record=>[record.accession,record]));
  const seeds=new Set([state.seed,...PRESENTATION_PAIRS.flatMap(pair=>[pair.source,pair.target])]);
  const seen=new Set(), scenes=[], prompts=[];
  for(const accession of seeds){
    const source=records.get(accession);
    if(!source)continue;
    for(const edge of societyView(state.records,accession,state.lens).edges){
      const key=[edge.source,edge.target].sort().join('::');
      if(seen.has(key))continue;
      seen.add(key);
      const target=records.get(edge.target);
      const episode=conversationEpisode({source,target,conversation:conversationFor(source,target,edge,state.lens)});
      const entry={episode,objects:[source,target],open:()=>{
        state.seed=accession;
        state.mapMode='conversation';
        $('theme').value='';
        $('atlas-mode').checked=false;
        $('seed').value=accession;
        showEdge(edge);
      }};
      (episode.mode==='CURATED_SCRIPT'?scenes:prompts).push(entry);
    }
  }
  const comparisons=CURATORIAL_PATHS.map(path=>({
    episode:conversationEpisode({source:path.source,target:path.target,conversation:juxtapositionConversation(path)}),
    objects:[path.source,path.target],open:()=>openResearchPath(path.id)
  }));
  const currentIds=new Set(relatedAnchor?[relatedAnchor]:(state.episode?.participants.map(p=>p.accession)||[]));
  for(const [label,group] of [['Conversations',scenes],['Proposed pairings',comparisons],['Open questions',prompts]]){
    const entries=relatedQuestions?group.filter(({episode})=>episode.id!==state.episode?.id && episode.participants.some(p=>currentIds.has(p.accession))):group;
    if(!entries.length)continue;
    const section=node('section');
    section.append(node('h2',label+' · '+entries.length,'directory-heading'));
    for(const {episode,objects,open} of entries){
      const button=questionCard(episode,objects);
      button.addEventListener('click',()=>{
        setMobileView('space');
        open();
        setPanel('conversation');
        document.querySelector('.rail-scroll').scrollTop=0;
        $('room-question').focus();
      });
      section.append(button);
    }
    list.append(section);
  }
  if(!list.childElementCount)list.append(node('p','These objects have no further questions in this view.'));
}
// Contextual navigation stays in the room; writing method lives on About.
function addRelatedQuestionsAction(box){
  const onward=node('button','More conversations ↗','more-questions-link');
  onward.type='button';
  onward.setAttribute('aria-label','More questions with these objects');
  onward.addEventListener('click',()=>{relatedAnchor=null;relatedQuestions=true;setMobileView('timeline');});
  box.append(onward);
}
function openEpisodeRecord(accession){
  // Inspecting evidence interrupts the spectacle, including voice playback.
  if(state.playing)stop();
  state.recordAccession=accession;
  renderRecord();setPanel('record');closeConversationSheet();
  document.querySelector('.rail-scroll').scrollTop=0;
}
function renderRoomHeader(source,target,c){
  const episode=conversationEpisode({source,target,conversation:c});
  if(state.episode?.id!==episode.id){
    state.recordAccession=null;
    document.querySelector('.rail-scroll').scrollTop=0;
  }
  state.episode=episode;
  const header=$('room-header');header.hidden=false;header.dataset.episode=episode.id;header.dataset.mode=episode.mode;
  $('room-question').textContent=episode.question;
  $('room-kind').textContent=episode.label==='Authored scene'?'':episode.label;
  $('room-status-line').hidden=!$('room-kind').textContent;
  // Show the relationship that led to this room, rather than a generic
  // description of its format. Research-proposal detail stays in Evidence.
  const connection=connectionCaption({episode,proposal:state.researchPath?.proposal});
  $('room-description').textContent=connection;
  $('room-description').title=state.researchPath?.proposal||connection;
  $('room-rationale').textContent='Why these two? ↗';
  const cast=$('room-participants');
  cast.replaceChildren(...episode.participants.map((p,i)=>{
    const r=i?target:source,visual=objectVisual(r);
    const card=node('article',undefined,'room-participant');
    card.dataset.speaker=p.role;
    const inspect=node('button',undefined,'object-inspect');inspect.type='button';
    inspect.setAttribute('aria-label','Inspect collection record: '+p.title+' · '+p.accession);
    const media=node('span',undefined,'object-portrait-media'+(visual.label==='Artist diagram'?' is-diagram':''));
    media.setAttribute('aria-hidden','true');
    const placeholder=()=>{media.replaceChildren(node('span',p.shortName.slice(0,55),'object-portrait-placeholder'));media.classList.add('is-placeholder');};
    if(visual.src){
      const img=node('img');img.src=visual.src;img.alt='';img.loading='lazy';img.decoding='async';
      img.addEventListener('error',placeholder,{once:true});media.append(img);
    }else placeholder();
    // The card presents the artwork itself; accession and image provenance
    // remain available in the record/evidence views and accessible button name.
    const metadata=node('span',undefined,'object-portrait-meta');
    const arrow=node('span','↗','object-open-arrow');
    arrow.setAttribute('aria-hidden','true');
    metadata.append(node('strong',p.shortName),arrow);
    inspect.append(media,metadata);
    inspect.addEventListener('click',()=>openEpisodeRecord(p.accession));
    card.append(inspect);
    const total=questionCountFor(p.accession),remaining=Math.max(0,total-1);
    if(remaining){
      const other=node('button',remaining+' other '+(remaining===1?'conversation':'conversations')+' ↗','object-more');
      other.type='button';
      other.setAttribute('aria-label','Explore other conversations with '+p.title);
      other.addEventListener('click',()=>openObjectQuestions(p.accession));
      card.append(other);
    }
    return card;
  }));
  // The connection itself is a compact replay affordance: preserves the
  // two large object cards and doesn't add an extra row to a 320px screen.
  const replay=node('button','↻','object-cast-link');
  replay.id='scene-replay';replay.type='button';
  replay.title='Replay the scripted exchange (silent)';
  replay.setAttribute('aria-label','Replay scripted exchange without audio');
  replay.setAttribute('aria-pressed','false');
  replay.disabled=episode.mode!=='CURATED_SCRIPT';
  replay.addEventListener('click',()=>{if(state.playing)stop();replayScriptedScene();});
  cast.append(replay);
  syncMobileRoomStage();
  const evidence=$('episode-evidence');
  evidence.replaceChildren(node('h2','Why these two?'),node('p',episode.rationale),
    node('p','The voices are artist-authored interpretations, not historical speech or live autonomous AI. Shared tags do not establish contact, influence, or shared storage.'));
  for(const p of episode.participants){
    const button=node('button',p.title+' · '+p.accession,'evidence-record');button.type='button';
    button.addEventListener('click',()=>openEpisodeRecord(p.accession));evidence.append(button);
  }
  if(state.researchPath){
    // Curatorial paths keep their research basis in Evidence, not under the dialogue.
    if(state.researchPath.proposal)evidence.append(node('p',state.researchPath.proposal));
    if(state.researchPath.limits)evidence.append(node('p',state.researchPath.limits));
    const sources=state.researchPath.sourceLinks||[];
    for(const {label,url} of sources){
      if(!url)continue;
      const link=node('a',label,'evidence-record');link.href=url;link.target='_blank';link.rel='noopener noreferrer';evidence.append(link);
    }
  }
  const lens=LENSES.find(item=>item.id===state.lens);
  evidence.append(node('p',explainEncounter({source,target,conversation:c,lensLabel:lens?.label}).frame),
    node('p','Source review and image permissions are separate from this imagined exchange.','muted'));
}
function paintResearchScene(c){
  paintSceneLabel('Curatorial juxtaposition','#e8d5a3','Curatorial juxtaposition. Not a catalog match or a documented meeting.',c.dramaticArc,'RESEARCH PREVIEW · NOT A CATALOG MATCH');
}
function renderJuxtaposition(box){
  const path=state.researchPath;
  const c=juxtapositionConversation(path);
  state.conversation=c;
  paintResearchScene(c);
  const source=path.source,target=path.target;
  renderRoomHeader(source,target,c);
  const guide=CARD_BY_ID.get('archivist');
  const faces={
    objectA:{name:state.episode.participants[0].shortName,src:photo(source)||objectBadge(source),side:'a'},
    objectB:{name:state.episode.participants[1].shortName,src:photo(target)||objectBadge(target),side:'b'},
    archivist:{name:'Archivist · fictional research voice',src:'',persona:guide,side:'guide'}
  };
  const chat=node('div',undefined,'chat');
  chat.style.setProperty('--link','#e8d5a3');
  for(const turn of c.turns){
    const face=faces[turn.role]||faces.archivist;
    const bubble=node('article',undefined,'bubble turn side-'+face.side);bubble.dataset.role=turn.role;
    const img=node('img');img.className='avatar';img.alt='';
    if(face.persona)bindPersonaImage(img,face.persona);
    else img.src=face.src;
    const say=node('div',undefined,'say');say.append(node('strong',face.name),node('p',turn.text));
    bubble.append(img,say);chat.append(bubble);
  }
  box.append(chat);
  addRelatedQuestionsAction(box);
  $('voice-controls').hidden=$('conversation-panel').hidden;
  setPlayDisabled(state.playing);
  if($('audio-elapsed'))$('audio-elapsed').textContent='Turn 1 of '+c.turns.length;
}
function renderConversation(){
  const edge=shownEdge(),box=$('conversation-content');box.replaceChildren();
  state.conversation=null;
  $('room-header').hidden=true;
  syncMobileRoomStage();
  clearScene();
  if(edge?.relationshipType==='curatorial_juxtaposition'&&state.researchPath){renderJuxtaposition(box);return;}
  if(state.hover?.kind==='identity'){
    const identity=state.layerView?.relationships.find(item=>item.id===state.hover.id);
    if(identity){box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','A shared tag or identifier is not a historical relationship.','muted'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  }
  if(state.identityEdge&&state.identityEdge.id===state.edge&&state.hover?.kind!=='edge'){
    const identity=state.identityEdge;
    box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','Hidden layers remove both the line and its hit target. This edge is not a historical relationship.','muted'));
    $('voice-controls').hidden=true;setPlayDisabled(true);return;
  }
  if(!edge){state.episode=null;box.append(node('h2','No shared category in this view.'),node('p','Try another object, category or perspective. An absent edge does not mean the objects have no relationship.'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  const source=person(edge.source),target=person(edge.target);
  if(!source||!target){box.append(node('h2','No shared category in this view.'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  const c=conversationFor(source,target,edge,state.lens,{source:state.snapshots.get(state.seed),target:state.snapshots.get(target.accession)});state.conversation=c;
  paintScene(c,edge);
  renderRoomHeader(source,target,c);
  const chat=node('div',undefined,'chat');
  chat.style.setProperty('--link',tagColor(edge.reasons[0].value));
  const reader=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  const guide=CARD_BY_ID.get('archivist');
  const faces={
    objectA:{name:state.episode.participants[0].shortName,src:photo(source)||objectBadge(source),side:'a'},
    objectB:{name:state.episode.participants[1].shortName,src:photo(target)||objectBadge(target),side:'b'},
    archivist:{name:'Archivist · fictional research voice',src:'',persona:guide,side:'guide'}
  };
  for(const turn of state.episode.turns){
    const face=faces[turn.role]||faces.archivist;
    const bubble=node('article',undefined,'bubble turn side-'+face.side);bubble.dataset.role=turn.role;
    const img=node('img');img.className='avatar';img.alt='';
    if(face.persona)bindPersonaImage(img,face.persona);
    else img.src=face.src;
    const say=node('div',undefined,'say');
    const line=node('span',undefined,'speaker-line');
    line.append(node('strong',face.name));
    if(turn.role==='objectA'&&c.mode!=='CURATED_EDGE_SCENE')line.append(promptMenu());
    say.append(line,node('p',turn.text));
    bubble.append(img,say);chat.append(bubble);
  }
  box.append(chat);
  if(state.episode.mode==='RESEARCH_PROMPT'){
    state.conversation=null;
    box.append(node('p','Compare these records','research-prompt-title'),
      node('p','This pair has no edited dialogue. Start with the shared tag, inspect each record, and decide whether the comparison holds.','research-prompt-copy'));
    for(const p of state.episode.participants){
      const button=node('button','Inspect '+p.shortName,'evidence-record');button.type='button';
      button.addEventListener('click',()=>openEpisodeRecord(p.accession));box.append(button);
    }
  }
  if(c.mode!=='CURATED_EDGE_SCENE'&&c.dramaticArc)box.append(node('p',c.dramaticArc,'notice'));
  if(c.nextPrompt)box.append(node('p',visitorFollowUp(c),'notice'));
  // A narrative edge can become a new starting object. Make this an explicit
  // visitor action; graph connectivity is never inferred from the dialogue.
  const actions=node('div',undefined,'edge-path-actions');
  const follow=node('button','Follow this object');
  follow.type='button';follow.dataset.followObject=target.accession;
  follow.setAttribute('aria-label','Continue the investigation with '+target.title);
  follow.addEventListener('click',()=>followObject(target.accession));
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
  addRelatedQuestionsAction(box);
  $('voice-controls').hidden=$('conversation-panel').hidden||!state.conversation;setPlayDisabled(!state.conversation);
  if($('audio-elapsed'))$('audio-elapsed').textContent='Turn 1 of '+c.turns.length;
}
function pair(list,label,value){list.append(node('dt',label),node('dd',value||'Not supplied'));}
function renderDistrict(){
  const district=state.district,box=$('conversation-content');
  box.replaceChildren();state.conversation=null;
  clearScene();
  box.append(node('span',state.room.layer.label.toUpperCase(),'evidence-type'),node('h2',district.label),node('p',district.count+(district.count===1?' object shares this label.':' objects share this label.')),node('p','A shared staff tag is not proof these objects met.','muted'));
  $('voice-controls').hidden=true;setPlayDisabled(true);
}
function renderRecord(){
  const box=$('record-content');
  if(state.district){
    box.replaceChildren(node('h2',state.district.label),node('p',state.district.count+' objects share this label.'),node('p','A shared staff tag is not proof these objects met.','muted'));
    $('lookup').disabled=true;return;
  }
  const r=focusRecord();
  if(!r){box.replaceChildren();return;}
  box.replaceChildren();
  if(state.episode){
    const picker=node('div',undefined,'record-object-picker');
    picker.setAttribute('role','group');picker.setAttribute('aria-label','Choose an object record');
    for(const p of state.episode.participants){
      const button=node('button',p.shortName);button.type='button';button.setAttribute('aria-pressed',String(p.accession===r.accession));
      button.addEventListener('click',()=>openEpisodeRecord(p.accession));picker.append(button);
    }
    box.append(picker);
  }
  const frame=node('div',undefined,'record-frame');
  if(photo(r)){const img=node('img');img.src=photo(r);img.alt='Locally supplied image matched to '+r.accession;frame.append(img);}
  const overlay=node('div',undefined,'record-overlay');
  if(r.researchOnly)overlay.append(node('p','Published checklist record. No approved photograph and no Lakehouse match.','muted'));
  if(r.source!=='lakehouse')overlay.append(node('span',r.source==='invented'?'INVENTED EXAMPLE':r.source==='public-packet'?'PUBLIC PACKET · IDENTITY ONLY':r.source==='research-preview'?'PUBLISHED CHECKLIST · RESEARCH PREVIEW':r.source==='presentation'?'PUBLIC PRESENTATION RECORD':r.source==='matrix'?'PHOTOGRAPHED MATRIX':'LOCAL CSV · SOURCE INPUT','evidence-type'));
  if(r.source==='public-packet')overlay.append(node('p','This packet identifies an accession and title only. No direct historical relationship, source-linked image, or staff-tag neighbor has been established for it in this view.','muted'));
  overlay.append(node('h2',r.title));
  const list=node('dl');
  pair(list,'Accession',r.accession);pair(list,'Creator',r.creator);pair(list,'Date',r.date);
  pair(list,'Categories',(r.tags||[]).filter(t=>t.family==='theme').map(t=>t.value).join(' · '));
  if(r.catalogSubject)pair(list,'Catalog subject',r.catalogSubject);
  if(r.geography)pair(list,'Geographic origin',r.geography);
  if(r.catalogDescription)pair(list,'Description',r.catalogDescription);
  pair(list,'Image source',photo(r)?'Local file · permission and credit remain with the source':'Illustrative card · no collection photo loaded');
  overlay.append(list);
  frame.append(overlay);
  box.append(frame);
  $('lookup').disabled=r.source==='invented'||state.lookupBusy;renderSnapshot();
}
function renderSnapshot(){
  const s=state.snapshots.get(state.seed),box=$('snapshot-content');if(!box)return;box.replaceChildren();
  if(!s)box.append(node('p','No Lakehouse evidence loaded for this record.','muted'));
  else{
    box.append(node('strong',s.status),node('p','Captured '+s.retrievedAt),node('p','Adapter: '+s.schemaStatus+'. Exact identifier matching does not establish historical relationships.','muted'));
    if(s.sourceUrl){const a=node('a','Public lookup request ↗');a.href=s.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';box.append(a);}
    for(const match of s.matches){const dl=node('dl');for(const [key,field]of Object.entries(match.fields)){
      const value=field.status==='PRESENT'?Array.isArray(field.value)?field.value.join(' · '):String(field.value):field.status;
      pair(dl,key,value);if(field.pointer)dl.append(node('dd','Catalog field '+field.pointer,'muted'));
    }box.append(dl);}
    box.append(node('p','Storage/box mapping: not established by this adapter.','muted'));
  }
  const quotes=[];
  for(const turn of state.conversation?.turns||[]){
    for(const citation of turn.citations||[])quotes.push((turn.speaker||'Voice')+' quotes “'+citation.quote+'”. Catalog field '+citation.pointer+'. Captured '+citation.retrievedAt+'.');
  }
  if(quotes.length){
    box.append(node('p','Quoted in the conversation','muted'));
    for(const line of quotes)box.append(node('p',line));
  }
}
function paintLegend(){
  const bar=$('room-legend');if(!bar)return;
  if(!roomMode()||!state.room){bar.hidden=true;bar.replaceChildren();return;}
  bar.hidden=false;bar.replaceChildren();
  for(const district of state.room.districts){
    const button=node('button',district.label,'legend-chip');
    button.type='button';button.setAttribute('aria-pressed',String(state.district?.id===district.id));
    button.addEventListener('click',()=>{stop();resetApproval();state.district=district;render();setPanel('conversation');});
    bar.append(button);
  }
}
function renderRoom(){
  const lens=LENSES.find(l=>l.id===state.lens);
  message('lens-question',lens.question);
  const pair=state.district?null:roomPair(state.seed);
  state.view={
    nodes:state.room.nodes.map(item=>({record:state.matrixRecords.find(r=>r.accession===item.accession),x:item.x,y:item.y})).filter(item=>item.record),
    edges:pair?[pair.edge]:[],
    landmarks:{personas:[],categories:[]},
  };
  state.edge=state.view.edges[0]?.id||null;
  state.layerView={relationships:[]};
  const current=record();
  message('atlas-title',state.district?state.district.label+' · '+state.room.layer.label:(current?current.title+' · '+current.accession:state.room.layer.label));
  const nodes=state.room.nodes.map(item=>({
    id:item.accession,label:item.title,image:localImageUrl(item.accession)||'',color:item.color,
    neighbor:Boolean(pair&&item.accession===pair.edge.target),
  }));
  const links=pair?[{source:pair.edge.source,target:pair.edge.target,label:pair.edge.reasons?.[0]?.value||'',color:tagColor(pair.edge.reasons?.[0]?.value||'shared')}]:[];
  const graph=pair?focusedPairGraph(nodes,links,pair.edge.source,pair.edge.target):focusedPairGraph(nodes,links);
  $('stage').dataset.theme='';
  $('layer-notice').hidden=true;
  stage.setGraph(graph.nodes,graph.links);
  if(pair)stage.focusPair(pair.edge.source,pair.edge.target);
  paintCounts([[objectIcon(),state.room.nodes.length,state.room.nodes.length===1?'object':'objects']]);
  renderStage();
  if(state.district)renderDistrict();else renderConversation();
  renderRecord();
  updateVisitorGuide();
  paintLegend();
  paintSeedChoices();
  paintListeners();
  paintTimeline();
}
function paintResearchLabel(){
  const label=$('research-edge');
  if(!label)return;
  const on=Boolean(state.researchPath)&&!roomMode();
  label.hidden=!on;
  if(on)label.textContent='Curatorial juxtaposition';
  const stageHost=$('stage');
  if(stageHost)stageHost.dataset.relationship=on?'curatorial_juxtaposition':'';
}
function researchNodes(){
  const path=state.researchPath;
  return [path.source,path.target].map((item,index)=>({
    id:item.accession,
    label:item.title,
    image:photo(item)||'',
    color:'#f4f4f4',
    neighbor:index===1,
    schematic:!photo(item),
    focused:true,
  }));
}
function renderResearch(){
  const path=state.researchPath;
  state.district=null;
  state.identityEdge=null;
  state.view={
    nodes:[{record:path.source},{record:path.target}],
    edges:[path.edge],
    landmarks:{personas:[],categories:[]},
  };
  state.edge=path.edge.id;
  state.layerView={relationships:[]};
  message('lens-question',path.arc);
  message('atlas-title',path.arc);
  const graph=focusedPairGraph(researchNodes(),[{
    source:path.source.accession,target:path.target.accession,label:'Curatorial juxtaposition',color:'#e8d5a3'
  }],path.source.accession,path.target.accession);
  $('stage').dataset.theme='';
  $('layer-notice').hidden=true;
  stage.setGraph(graph.nodes,graph.links);
  stage.focusPair(path.source.accession,path.target.accession);
  paintResearchLabel();
  paintCounts([
    [objectIcon(),2,'research records'],
    [pathIcon(),1,'curatorial juxtaposition'],
    [storageIcon(),0,'identity or storage lines'],
    [claimIcon(),0,'historical claims inferred']
  ]);
  renderStage();renderConversation();renderRecord();
  message('visitor-source','RESEARCH PREVIEW · NOT A WOLFSONIAN ENDORSEMENT');
  message('visitor-object',path.source.title+' · '+path.target.title);
  message('visitor-connection',path.proposal);
  paintLegend();paintSeedChoices();paintListeners();paintTimeline();
}
function openResearchPath(id){
  const path=pathById(id);
  if(!path){state.researchPath=null;render();return;}
  stop();resetApproval();
  state.mapMode='conversation';
  state.researchPath=path;
  if($('atlas-mode')?.checked)$('atlas-mode').checked=false;
  closeSheet();
  render();
  setMobileView('space');
  breathDream();
  startSceneEntrance();
}
function render(){
  state.hover=null;
  paintChoices();
  paintPaths();
  if(roomMode()){renderRoom();paintResearchLabel();return;}
  if(state.researchPath){renderResearch();return;}
  paintResearchLabel();
  state.district=null;
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
  paintCounts([
    [objectIcon(),state.view.nodes.length,'visible objects'],
    [pathIcon(),state.view.edges.length,'conversation paths'],
    [storageIcon(),identityCount,'identity or storage lines'],
    [claimIcon(),0,'historical claims inferred']
  ]);
  renderStage();renderConversation();renderRecord();updateVisitorGuide();paintLegend();paintSeedChoices();
  paintListeners();
  paintTimeline();
}
function updateVisitorGuide(){
  const info=visitorGuide(record(),state.district?null:shownEdge(),{visibleCount:state.view?.nodes.length||0});
  message('visitor-source',info.kind+' · '+info.badge);
  message('visitor-object',info.title+(info.accession?' · '+info.accession:''));
  message('visitor-connection',info.line);
  const current=state.researchPath?.proposal;
  message('arrival-connection',current
    ? 'Artist-proposed comparison: '+current+' This is a question for research, not a documented historical meeting.'
    : info.line);
}
async function service(path,options={}){
  const token=$('access-token').value;
  const response=await fetch('/api/archive-society/'+path,{...options,credentials:'omit',headers:{...options.headers,Authorization:'Bearer '+token}});
  if(!response.ok){let error;try{error=await response.json();}catch{}throw new Error(error?.message||'Server unavailable ('+response.status+').');}
  return response;
}
function updateSpeakingAudio(turn,index,count){
  const bar=$('voice-controls');
  const person=state.episode?.participants?.find(participant=>participant.role===turn.role);
  const speaker=person?.shortName||(turn.role==='archivist'?'Archivist':turn.speaker||'Voice');
  if(bar){bar.dataset.speaker=turn.role||'';bar.classList.add('playing');}
  if($('audio-speaker'))$('audio-speaker').textContent=speaker+' speaking';
  if($('audio-elapsed'))$('audio-elapsed').textContent='Turn '+(index+1)+' of '+count;
}
async function play(){
  if(!state.conversation)return;stop();wakeDream();const session=playback;
  const conversation=state.conversation,mode=$('voice-mode').value;
  if(mode==='elevenlabs'&&!$('external-approved').checked){message('voice-status','Review the displayed transcript and confirm external-processing approval first.');return;}
  state.playing=true;setPlayDisabled(true);document.querySelectorAll('.conversation-edge.selected').forEach(e=>e.classList.add('speaking'));
  try{
    let localVoice;
    if(mode==='device'){
      if(!window.speechSynthesis)throw new Error('No device speech service. The written transcript remains available.');
      localVoice=window.speechSynthesis.getVoices().find(v=>v.localService);
      if(!localVoice){await new Promise(r=>setTimeout(r,500));localVoice=window.speechSynthesis.getVoices().find(v=>v.localService);}
      if(!localVoice)throw new Error('No local device voice is installed. Use the written transcript or configure ElevenLabs.');
    }
    message('voice-status','');
    for(const [i,turn]of conversation.turns.entries()){
      if(session!==playback)return;
      updateSpeakingAudio(turn,i,conversation.turns.length);
      stage.setSpeaking(turn.role==='objectA'?conversation.source:turn.role==='objectB'?conversation.target:'');
      markSpeaker(turn.role);
      document.querySelectorAll('#conversation-content .turn').forEach((el,index)=>el.classList.toggle('speaking',index===i));
      document.querySelector('#conversation-content .turn.speaking')?.scrollIntoView({block:'nearest'});
      if(mode==='device'){
        await speakOnDevice(turn);
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
          // audio failure. Leave this status in place: device speech in a
          // headless browser can finish immediately and the loop used to clear it.
          if(/not enabled|disabled|ELEVENLABS_DISABLED/i.test(provider)){message('voice-status',provider);return;}
          message('voice-status',provider);
          try{await speakOnDevice(turn,localVoice);}catch(deviceError){if(session===playback)message('voice-status',provider+' '+deviceError.message);}
        }
      }
    }
    if(session===playback && !/not enabled|disabled|ELEVENLABS_DISABLED/i.test($('voice-status').textContent))message('voice-status','');
  }catch(error){if(session===playback)message('voice-status',error.message);}
  finally{if(session===playback){state.playing=false;setPlayDisabled(false);document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));const bar=$('voice-controls');bar?.classList.remove('playing');if(bar)bar.dataset.speaker='';if($('audio-speaker'))$('audio-speaker').textContent='Ready to listen';stage.setSpeaking('');markSpeaker('');armIdle();}}
}
function speakOnDevice(turn){
  return new Promise((resolve,reject)=>{
    if(!window.speechSynthesis){reject(new Error('No device speech service. The written transcript remains available.'));return;}
    cancelDeviceSpeech=resolve;
    const cast=deviceCast(turn.role,window.speechSynthesis.getVoices());
    const utterance=new SpeechSynthesisUtterance(turn.text);
    if(cast.voice)utterance.voice=cast.voice;
    utterance.rate=cast.rate;
    utterance.pitch=cast.pitch;
    utterance.onend=()=>{cancelDeviceSpeech=null;resolve();};
    utterance.onerror=()=>{cancelDeviceSpeech=null;reject(new Error('Device speech stopped or unavailable.'));};
    window.speechSynthesis.speak(utterance);
  });
}
function invalidateData(){stop();resetApproval();lookupAbort?.abort();state.epoch++;state.edge=null;state.journey=[];state.snapshots.clear();state.payload=null;state.lookupBusy=false;}
function saveConversation(){
  if(!state.conversation)return;
  const payload={...state.conversation,exportedAt:new Date().toISOString(),source:record().source,notice:'Local research export. Review permissions before sharing. No photos, service token or provider credentials included.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=node('a');a.href=url;a.download='archive-conversation.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('lens').replaceChildren(...LENSES.map(p=>{const o=node('option',p.label);o.value=p.id;return o;}));
$('lens').addEventListener('change',()=>{stop();resetApproval();state.lens=$('lens').value;render();paintReading();});
function paintReading(){
  const card=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  bindPersonaImage($('reading-portrait'),card,'compact');
  $('reading-name').textContent=card.id==='museum'?card.label+' · fictional':card.label;
  for(const id of ['room','feed']){
    if($(id+'-perspective-name'))$(id+'-perspective-name').textContent=card.id==='museum'?card.label+' · fictional':card.label;
    const toggle=$(id+'-perspective-toggle');
    if(toggle)toggle.setAttribute('aria-label','Choose perspective, currently '+card.label+(card.id==='museum'?' (fictional, not museum staff)':''));
  }
  for(const button of document.querySelectorAll('[data-lens]'))button.setAttribute('aria-pressed',String(button.dataset.lens===state.lens));
}
function closePromptSheet(){
  const sheet=$('prompt-sheet');if(!sheet)return;
  sheet.hidden=true;
}
function openPromptSheet(){
  const card=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  $('prompt-kicker').textContent=card.subheading;
  $('prompt-title').textContent=card.label;
  $('prompt-hook').textContent=card.hook;
  $('prompt-description').textContent=card.description;
  const attended=card.priorities.length?card.priorities:['Any explicitly available staff-assigned metadata.'];
  $('prompt-priorities').replaceChildren(...attended.map(item=>node('li',item)));
  $('prompt-limits').textContent=card.limits;
  $('prompt-text').textContent=card.prompt;
  const archivist=CARD_BY_ID.get('archivist');
  const other=$('archivist-block');
  if(other){
    other.hidden=card.id==='archivist';
    if(archivist)$('archivist-prompt').textContent=archivist.prompt;
  }
  closeSheet();
  $('prompt-sheet').hidden=false;
  $('prompt-close')?.focus();
}
function promptMenu(){
  const more=node('span',undefined,'speaker-more');
  const dots=node('button','···','more-dots');
  dots.type='button';
  dots.setAttribute('aria-label','Perspective options');
  dots.setAttribute('aria-expanded','false');
  dots.setAttribute('aria-haspopup','menu');
  const menu=node('div',undefined,'speaker-menu');
  menu.hidden=true;menu.setAttribute('role','menu');
  const item=node('button','Reveal prompt');
  item.type='button';item.setAttribute('role','menuitem');
  item.addEventListener('click',event=>{
    event.stopPropagation();
    menu.hidden=true;dots.setAttribute('aria-expanded','false');
    openPromptSheet();
  });
  dots.addEventListener('click',event=>{
    event.stopPropagation();
    const open=menu.hidden;
    document.querySelectorAll('.speaker-menu').forEach(other=>{if(other!==menu)other.hidden=true;});
    menu.hidden=!open;dots.setAttribute('aria-expanded',String(open));
  });
  menu.append(item);
  more.append(dots,menu);
  return more;
}
$('reading-popover').replaceChildren(...LENSES.map(lens=>{
  const card=CARD_BY_ID.get(lens.id);
  const button=node('button');
  button.type='button';button.className='reading-choice';button.dataset.lens=lens.id;
  const img=node('img');bindPersonaImage(img,card,'compact');
  const label=lens.id==='museum'?lens.label+' · fictional':lens.label;
  button.append(img,node('span',label));
  button.addEventListener('click',()=>{$('lens').value=lens.id;$('lens').dispatchEvent(new Event('change'));closeSheet();});
  return button;
}));
const mobilePerspectiveSheet=$('mobile-perspective-sheet');
let mobilePerspectiveOpener=null;
function closeMobilePerspectives(){if(mobilePerspectiveSheet?.open)mobilePerspectiveSheet.close();}
function openMobilePerspectives(opener){
  if(!mobileLayout()||!mobilePerspectiveSheet)return;
  mobilePerspectiveOpener=opener;
  closeSheet();
  mobilePerspectiveSheet.showModal();
  mobilePerspectiveSheet.querySelector('[data-lens="'+state.lens+'"]')?.focus();
}
for(const id of ['room','feed']){
  const button=$(id+'-perspective-toggle');
  button?.addEventListener('click',()=>openMobilePerspectives(button));
}
$('mobile-perspective-close')?.addEventListener('click',closeMobilePerspectives);
mobilePerspectiveSheet?.addEventListener('click',event=>{if(event.target===mobilePerspectiveSheet)closeMobilePerspectives();});
mobilePerspectiveSheet?.addEventListener('close',()=>{mobilePerspectiveOpener?.focus({preventScroll:true});mobilePerspectiveOpener=null;});
$('mobile-perspective-choices')?.replaceChildren(...LENSES.map(lens=>{
  const card=CARD_BY_ID.get(lens.id);
  const button=node('button',undefined,'mobile-perspective-choice');
  button.type='button';button.dataset.lens=lens.id;button.setAttribute('aria-pressed',String(lens.id===state.lens));
  const portrait=node('img');bindPersonaImage(portrait,card,'full','white');
  const copy=node('span',undefined,'mobile-perspective-copy');
  copy.append(node('strong',lens.id==='museum'?lens.label+' · fictional':lens.label),
    node('small',lens.id==='museum'?'Artist-authored viewpoint; not museum staff.':lens.question));
  const check=node('span','✓','mobile-perspective-selected');check.setAttribute('aria-hidden','true');
  button.append(portrait,copy,check);
  button.addEventListener('click',()=>{
    closeMobilePerspectives();
    $('lens').value=lens.id;
    $('lens').dispatchEvent(new Event('change'));
  });
  return button;
}));
document.querySelector('.finder').addEventListener('submit',event=>event.preventDefault());
function paintPaths(){
  const box=$('path-choices');if(!box)return;
  box.replaceChildren(node('p','Research preview. Not a Wolfsonian endorsement.','path-note'));
  const back=node('button','Making the Engine');
  back.type='button';
  back.setAttribute('aria-pressed',String(!state.researchPath));
  back.addEventListener('click',()=>{state.researchPath=null;closeSheet();render();});
  box.append(back);
  for(const path of CURATORIAL_PATHS){
    const button=node('button',path.arc);
    button.type='button';
    button.dataset.path=path.id;
    button.setAttribute('aria-pressed',String(state.researchPath?.id===path.id));
    button.addEventListener('click',()=>openResearchPath(path.id));
    box.append(button);
  }
  if($('paths-name'))$('paths-name').textContent=state.researchPath?'Preview':'Research';
}
const PANELS={map:'map-popover',reading:'reading-popover',seed:'seed-popover',theme:'theme-popover',paths:'paths-popover',zoom:'zoom-popover'};
function resetMore(){
  const layers=document.querySelector('[data-more="layers"]'),zoom=document.querySelector('[data-more="zoom"]');
  if(layers)layers.hidden=false;
  if(zoom)zoom.hidden=true;
}
function placePanel(name){
  const button=document.querySelector('[data-sheet="'+name+'"]');
  const panel=$(PANELS[name]);
  const width=panel.getBoundingClientRect().width;
  const rect=button.getBoundingClientRect();
  let left=rect.left;
  if(left+width>window.innerWidth-12)left=Math.max(12,window.innerWidth-12-width);
  panel.style.left=Math.round(left)+'px';
  panel.style.bottom=Math.round(window.innerHeight-rect.top+8)+'px';
}
function closeSheet(){
  for(const id of Object.values(PANELS)){const panel=$(id);if(panel)panel.hidden=true;}
  for(const button of document.querySelectorAll('[data-sheet]'))button.setAttribute('aria-expanded','false');
  resetMore();
  closeConversationSheet();
  closePromptSheet();
}
function closeConversationSheet(){
  const sheet=$('conversation-sheet');if(!sheet)return;
  sheet.hidden=true;
  $('conversation-head')?.setAttribute('aria-expanded','false');
}
function openSheet(name){
  const panel=$(PANELS[name]);
  const open=panel.hidden;
  closeSheet();
  if(!open)return;
  panel.hidden=false;
  document.querySelector('[data-sheet="'+name+'"]').setAttribute('aria-expanded','true');
  placePanel(name);
}
for(const button of document.querySelectorAll('[data-sheet]'))button.addEventListener('click',()=>openSheet(button.dataset.sheet));
$('zoom-open')?.addEventListener('click',()=>{document.querySelector('[data-more="layers"]').hidden=true;document.querySelector('[data-more="zoom"]').hidden=false;placePanel('more');});
$('sheet-back')?.addEventListener('click',()=>{resetMore();placePanel('more');});
document.addEventListener('click',event=>{
  if(!event.target.closest('.speaker-more')){
    document.querySelectorAll('.speaker-menu').forEach(menu=>{menu.hidden=true;});
    document.querySelectorAll('.more-dots').forEach(button=>button.setAttribute('aria-expanded','false'));
  }
  if(event.target.closest('.tool-popover,.reading-popover,[data-sheet],.rail-head,.conversation-sheet,.prompt-sheet,.speaker-more,#space-bar,#room-back'))return;
  closeSheet();
});
$('conversation-head')?.addEventListener('click',event=>{
  event.stopPropagation();
  const sheet=$('conversation-sheet');
  const willOpen=sheet.hidden;
  closeSheet();
  sheet.hidden=!willOpen;
  $('conversation-head').setAttribute('aria-expanded',String(willOpen));
  if(willOpen)$('sheet-close')?.focus();
});
$('prompt-close')?.addEventListener('click',event=>{
  event.stopPropagation();
  closePromptSheet();
});
$('sheet-close')?.addEventListener('click',event=>{
  event.stopPropagation();
  closeConversationSheet();
});
$('space-play')?.addEventListener('click',()=>$('play').click());
$('room-rationale')?.addEventListener('click',event=>{event.stopPropagation();$('conversation-head').click();});
$('space-room')?.addEventListener('click',()=>{
  state.mobileFrom=document.body.classList.contains('show-timeline')?'timeline':'space';
  setMobileView('room');
});
$('room-back')?.addEventListener('click',()=>setMobileView(state.mobileFrom||'space'));
$('record-return')?.addEventListener('click',()=>{setPanel('conversation');$('room-question').focus();});
function browseAll(){relatedQuestions=false;relatedAnchor=null;setMobileView('timeline');}
$('space-feed')?.addEventListener('click',browseAll);
$('space-conversation')?.addEventListener('click',()=>{
  setPanel('conversation');
  setMobileView('space');
  $('room-question')?.focus({preventScroll:true});
});
$('space-record')?.addEventListener('click',()=>{
  setPanel('record');
  setMobileView('space');
});
$('space-leave')?.addEventListener('click',browseAll);
$('all-directory-questions').addEventListener('click',browseAll);
$('questions-back')?.addEventListener('click',()=>setMobileView('space'));
const mobileMedia=window.matchMedia('(max-width: 800px)');
mobileMedia.addEventListener('change',syncMobileLayout);
window.addEventListener('resize',syncMobileLayout);
readingScroller()?.addEventListener('scroll',syncMobileRoomStage,{passive:true});
let stageApi=null;
const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
let dreamReason='awake';
let dreamTimer=0;
let idleTimer=0;
const ARRIVAL_MS=7000;
const BREATH_MS=4500;
const IDLE_MS=24000;
function staffLandscape(){return typeof state.background==='string'&&state.background.startsWith('blob:');}
function syncDream(){
  if(!stageApi)return;
  const host=$('stage');
  if(staffLandscape()){
    stageApi.setLandscape(state.background,Number($('veil')?.value||68));
    if(host){host.dataset.dream='landscape';host.dataset.dreamMotion='still';}
    return;
  }
  stageApi.clearLandscape();
  const reduced=motionQuery.matches;
  const dreaming=dreamReason!=='awake';
  stageApi.setDream({amount:dreaming?1:0,reduced,paper:document.documentElement.dataset.colorTheme==='light'});
  if(host){host.dataset.dream=dreamReason;host.dataset.dreamMotion=dreaming?(reduced?'still':'drift'):'awake';}
}
function armIdle(){
  clearTimeout(idleTimer);
  if(state.playing)return;
  idleTimer=setTimeout(()=>{
    if(state.playing||dreamReason!=='awake')return;
    dreamReason='idle';
    syncDream();
  },IDLE_MS);
}
function wakeDream(){
  const was=dreamReason;
  dreamReason='awake';
  clearTimeout(dreamTimer);
  if(was!=='awake')syncDream();
  armIdle();
}
function startDream(reason,ms){
  dreamReason=reason;
  clearTimeout(dreamTimer);
  clearTimeout(idleTimer);
  syncDream();
  dreamTimer=setTimeout(wakeDream,ms);
}
function breathDream(){startDream('room',BREATH_MS);}
motionQuery.addEventListener?.('change',()=>syncDream());
document.addEventListener('pointermove',()=>{
  if(dreamReason==='idle')wakeDream();
  else if(dreamReason==='awake')armIdle();
},{passive:true});
const stage=mountForceStage($('stage'),{onSelect:id=>onGraphSelect(id),onLink:(source,target)=>onGraphLink(source,target),onDrag:wakeDream,background:'#111111',dream:true});
stageApi=stage;
syncMobileLayout();
paintReading();
$('seed').addEventListener('change',()=>{state.journey=[];changeSeed($('seed').value);});
$('search').addEventListener('input',()=>{stop();resetApproval();options();render();});
for(const id of ['layer-accession','layer-box','layer-box-sim'])$(id).addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();});
$('atlas-mode').addEventListener('change',()=>{stop();resetApproval();state.researchPath=null;state.edge=null;state.identityEdge=null;render();stage.fit();});
$('theme').addEventListener('change',()=>{stop();resetApproval();state.researchPath=null;state.edge=null;state.identityEdge=null;render();});
$('veil').addEventListener('input',renderGraph);
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{setPanel(b.dataset.panel);if(mobileLayout())setMobileView('space');}));
$('voice-mode').addEventListener('change',()=>{stop();resetApproval();$('approval-box').hidden=$('voice-mode').value!=='elevenlabs';});
$('play').addEventListener('click',()=>{if(state.playing){stop();message('voice-status','Playback stopped.');return;}play();});$('stop').addEventListener('click',()=>{stop();message('voice-status','Playback stopped.');});$('export').addEventListener('click',saveConversation);
const sourceNote=$('source-note'), sourceInfo=$('source-info');
function closeSourceNote(){if(sourceNote)sourceNote.hidden=true;}
sourceInfo?.addEventListener('click',()=>{window.location.href='../about/';});
function closeAdmin(){
  const admin=$('admin');if(!admin)return;
  admin.hidden=true;
  $('admin-toggle')?.setAttribute('aria-expanded','false');
}
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeSourceNote();closeConversationSheet();closePromptSheet();closeAdmin();}});
$('restore').addEventListener('click',()=>{invalidateData();state.records=inventedRecords();state.seed=state.records[0].accession;$('search').value='';$('atlas-mode').checked=false;categories();options();fit();render();message('import-status','Invented example restored.');});
$('csv-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw new Error('CSV exceeds the 5 MiB demo limit.');const parsed=parseMatrixCsv(await file.text());invalidateData();state.records=parsed.records.map(r=>({...r,source:'local-csv'}));state.seed=state.records[0].accession;$('search').value='';categories();options();fit();render();message('import-status',state.records.length+' CSV objects loaded locally. No upload.');}catch(error){message('import-status',error.message);}finally{e.target.value='';}
});
$('background-file').addEventListener('change',e=>{const f=e.target.files[0];if(f&&/^image\/(png|jpeg|webp)$/.test(f.type)&&f.size<=10*1024*1024){const url=URL.createObjectURL(f);state.urls.add(url);state.background=url;renderGraph();}e.target.value='';});
$('snapshot-file').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;
  try{if(f.size>512*1024)throw new Error('Use a complete lookup JSON file smaller than 512 KiB.');const payload=JSON.parse(await f.text());const snapshot=reconcileLookup(payload,state.seed,'UNKNOWN_LOCAL_CAPTURE_TIME');stop();resetApproval();state.payload=payload;state.snapshots.set(state.seed,snapshot);renderConversation();renderSnapshot();}catch(error){message('snapshot-content',error.message);}finally{e.target.value='';}
});
$('lookup').addEventListener('click',async()=>{
  const accession=state.seed,epoch=state.epoch;lookupAbort?.abort();lookupAbort=new AbortController();state.lookupBusy=true;$('lookup').disabled=true;
  message('snapshot-content','Requesting one bounded lookup…');
  try{const response=await service('lakehouse?accession='+encodeURIComponent(accession),{signal:lookupAbort.signal});const snapshot=await response.json();if(state.epoch===epoch){stop();resetApproval();state.snapshots.set(accession,snapshot);renderConversation();renderSnapshot();}}
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
function closeZoomPopover(){
  const panel=$('zoom-popover');if(!panel)return;
  panel.hidden=true;
  $('zoom-toggle')?.setAttribute('aria-expanded','false');
}
$('zoom-in')?.addEventListener('click',()=>zoom(1.2));$('zoom-out')?.addEventListener('click',()=>zoom(1/1.2));
$('fit')?.addEventListener('click',()=>{fit();closeZoomPopover();});
$('zoom')?.addEventListener('input',()=>setZoomT(Number($('zoom').value)));
for(const button of document.querySelectorAll('[data-stop]'))button.addEventListener('click',()=>{setZoomT(Number(button.dataset.stop));closeZoomPopover();});
for(const button of document.querySelectorAll('[data-map]'))button.addEventListener('click',()=>setMapMode(button.dataset.map));
$('present').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('voice-status','Full screen unavailable on this device.');}});
$('admin-toggle')?.addEventListener('click',()=>{
  const admin=$('admin');
  const willOpen=admin.hidden;
  if(willOpen){closeConversationSheet();closePromptSheet();}
  admin.hidden=!willOpen;
  $('admin-toggle').setAttribute('aria-expanded',String(willOpen));
  if(willOpen)$('admin-close')?.focus();
});
$('admin-close')?.addEventListener('click',()=>closeAdmin());
$('access-token').addEventListener('input',()=>sessionStorage.setItem('archive-demo-token',$('access-token').value));
if(sessionStorage.getItem('archive-demo-token'))$('access-token').value=sessionStorage.getItem('archive-demo-token');
window.addEventListener('beforeunload',()=>{stop();});
const START_ACCESSION='85.4.64.43';
function bestSeed(records){
  if(records.some(item=>item.accession===START_ACCESSION))return START_ACCESSION;
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
    if(!response.ok){state.records=state.matrixRecords;state.seed=bestSeed(state.records);return;}
    const packet=await response.json();
    const graph=conversationRecords(packet);
    if(graph.strong<2)return;
    state.records=graph.records;
    state.matrixObjects=applyLakehouseFields(MATRIX_OBJECTS,packet);
    state.matrixRecords=matrixToRecords(state.matrixObjects);
    state.matrixIndex=null;
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
categories();options();render();setZoomT(34);
const requestedPath=new URLSearchParams(location.search).get('path');
if(requestedPath&&pathById(requestedPath))openResearchPath(requestedPath);
else startDream('arrival',ARRIVAL_MS);
if(requested&&!state.records.some(item=>item.accession===requested))message('import-status','Requested accession is not in the loaded set. No identity was assumed.');
