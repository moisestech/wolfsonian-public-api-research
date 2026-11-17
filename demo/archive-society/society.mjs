import { buildDiscoveryIndex, parseMatrixCsv, recommendNeighbors } from '../../src/discovery-graph.mjs';
import { inventedRecords, societyView, conversationFor, LENSES, WORLD, categoryIconUrl, district, deviceCast } from '../../src/archive-society.mjs';
import { CARD_BY_ID, portraitUrl } from '../../src/discovery-personas.mjs';
import { applyLayers, buildAtlasGraph, recordsToAtlasInput } from '../../src/atlas-graph.mjs';
import { reconcileLookup } from '../../src/archive-evidence.mjs';
import { applyLakehouseFields, conversationRecords, lookupSnapshots } from '../../src/lakehouse-matches.mjs';
import { MATRIX_OBJECTS, layoutRoom, matrixToRecords } from '../../src/matrix-room.mjs';
import { localImageUrl } from '../../src/local-images.mjs';
import { OPENING_ACCESSION } from '../../src/presentation-pairs.mjs';
import { withPublicAnchorFallback } from '../../src/object-lens-core.mjs';
import { focusedPairGraph } from '../../src/force-graph-data.mjs';
import { mountForceStage } from '../force-stage.mjs';
import { nearestZoomStop } from '../../src/zoom-stops.mjs';
import { visitorGuide } from '../../src/visitor-guide.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const state={records:inventedRecords(),seed:'FICTION-01',lens:'family',edge:null,identityEdge:null,layerView:null,journey:[],
  mapMode:'conversation',matrixObjects:MATRIX_OBJECTS,matrixRecords:matrixToRecords(MATRIX_OBJECTS),matrixIndex:null,room:null,district:null,
  urls:new Set(),snapshots:new Map(),payload:null,
  background:'./assets/archive-landscape.jpg',scale:1,panX:0,panY:0,
  playing:false,epoch:0,view:null,conversation:null,lookupBusy:false,hover:null};
let playback=0,voiceAbort=null,currentAudio=null,lookupAbort=null,cancelDeviceSpeech=null;
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
const photo=r=>localImageUrl(r?.accession);
function fit(){stage.fit();syncZoomUi();}
function setZoomT(t){stage.setZoomT(t);syncZoomUi();}
function zoom(amount){stage.zoom(amount);syncZoomUi();}
function syncZoomUi(){
  const input=$('zoom');if(!input)return;
  state.scale=stage.scale();
  state.t=stage.zoomT();
  input.value=String(Math.round(state.t));
  const stop=nearestZoomStop(state.t);
  for(const button of document.querySelectorAll('[data-stop]'))button.classList.toggle('on',Number(button.dataset.stop)===stop.t);
  $('fit').classList.toggle('on',stop.id==='world');
  if($('zoom-note'))$('zoom-note').textContent=stop.note;
}
function setPlayDisabled(disabled){$('play').disabled=disabled;if($('space-play'))$('space-play').disabled=disabled;}
function setPanel(name){
  for(const p of ['conversation','record'])$(p+'-panel').hidden=p!==name;
  for(const b of document.querySelectorAll('[data-panel]'))b.setAttribute('aria-pressed',String(b.dataset.panel===name));
  document.querySelector('.evidence-rail')?.classList.toggle('show-record',name==='record');
  if($('voice-controls'))$('voice-controls').hidden=name!=='conversation'||!state.conversation;
}
function resetApproval(){ $('external-approved').checked=false; }
function stop(){
  playback++;voiceAbort?.abort();voiceAbort=null;
  if(currentAudio){currentAudio.pause();currentAudio=null;}
  window.speechSynthesis?.cancel();cancelDeviceSpeech?.();cancelDeviceSpeech=null;state.playing=false;setPlayDisabled(!state.conversation);
  document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));
  markSpeaker('');
  $('voice-controls')?.classList.remove('playing');
  stage.setSpeaking('');
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
  renderStage();renderConversation();renderRecord();
}
function shownEdge(){
  if(!state.view)return null;
  if(state.hover?.kind==='object'||state.hover?.kind==='identity')return state.view.edges.find(e=>e.id===state.edge)||null;
  if(state.hover?.kind==='edge')return state.view.edges.find(e=>e.id===state.hover.id)||null;
  return state.view.edges.find(e=>e.id===state.edge)||null;
}
function focusRecord(){
  if(state.hover?.kind==='object')return viewingRecords().find(r=>r.accession===state.hover.accession)||record();
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
  if(roomMode()){stop();resetApproval();state.district=null;state.seed=id;render();setPanel('conversation');return;}
  const edge = state.view?.edges.find(item => item.target === id || item.source === id);
  if (edge && id !== state.seed) {
    stop(); resetApproval(); state.edge = edge.id; state.identityEdge = null;
    render(); setPanel('conversation');
    return;
  }
  if (id !== state.seed) changeSeed(id);
}
function stagePlate(rec, kind, speaker){
  const fig=node('figure',undefined,'plate'+(kind?' '+kind:''));
  if(speaker)fig.dataset.speaker=speaker;
  const img=node('img');img.className='object-shot';img.src=avatarFor(rec);img.alt='';
  fig.append(img,node('figcaption',rec.title));
  return fig;
}
function markSpeaker(role){
  state.speaker=role||'';
  const active=state.speaker||'objectA';
  document.querySelectorAll('#zoom-stage [data-speaker]').forEach(plate=>{
    plate.classList.toggle('largest',plate.dataset.speaker===active);
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
    if(edge)people=[state.records.find(r=>r.accession===edge.source),state.records.find(r=>r.accession===edge.target)].filter(Boolean);
  }
  if(people[0])row.append(stagePlate(people[0],'selected','objectA'));
  if(people[1])row.append(stagePlate(people[1],'reply','objectB'));
  const guide=CARD_BY_ID.get('archivist')||CARD_BY_ID.get(state.lens);
  const reader=node('figure',undefined,'plate persona');
  reader.dataset.speaker='archivist';
  const face=node('img');face.src=portraitUrl(guide);face.alt='';
  reader.append(face,node('figcaption',guide.label));
  row.append(reader);
  box.append(row);
  markSpeaker(state.speaker);
}
function clearScene(){
  const nav=$('scene-nav');if(nav)nav.hidden=true;
  const tag=$('scene-tag');if(tag)tag.hidden=true;
}
function paintScene(c,edge){
  const nav=$('scene-nav');if(!nav)return;
  const kind=c.mode==='CURATED_EDGE_SCENE'?'ARTIST-AUTHORED SCENE · EDITORIAL DRAFT':
    c.edgeMode==='QUESTION_THIS_LINK'?'QUESTIONABLE MATCH · METADATA ONLY':'SOURCE-BOUNDED METADATA READING';
  const curated=c.mode==='CURATED_EDGE_SCENE'&&c.dramaticArc;
  const title=$('scene-title');
  title.hidden=!curated;title.textContent=curated?c.dramaticArc:'';
  if(curated){title.title=kind;title.setAttribute('aria-label',c.dramaticArc+' · '+kind);}
  else{title.removeAttribute('title');title.removeAttribute('aria-label');}
  nav.hidden=!curated;
  const label=c.scriptBasis?.value||edge.reasons[0].value;
  const tag=$('scene-tag');
  tag.hidden=false;
  tag.textContent=label;tag.style.background=tagColor(edge.reasons[0].value);tag.style.color='#111';
  const colorNote=label+' — this color is the shared category.';
  const note=curated?colorNote:kind+' · '+colorNote;
  tag.title=note;tag.setAttribute('aria-label',note);
  const sheetTitle=$('sheet-title');
  if(sheetTitle){sheetTitle.hidden=!curated;sheetTitle.textContent=curated?c.dramaticArc:'';}
  const sheetNote=$('sheet-note');
  if(sheetNote)sheetNote.textContent=kind;
}
function mobileLayout(){return window.matchMedia('(max-width: 800px)').matches;}
function setMobileView(view){
  if(!mobileLayout())return;
  document.body.classList.remove('show-timeline','show-space','show-room');
  document.body.classList.add('show-'+view);
  if(view==='room')requestAnimationFrame(()=>stage.resize());
}
function placeZoomStage(){
  const zoom=$('zoom-stage');if(!zoom)return;
  if(mobileLayout())$('space-stage')?.append(zoom);
  else document.querySelector('.canvas')?.append(zoom);
}
function syncMobileLayout(){
  placeZoomStage();
  if(!mobileLayout()){document.body.classList.remove('show-timeline','show-space','show-room');return;}
  if(!document.body.classList.contains('show-timeline')&&!document.body.classList.contains('show-space')&&!document.body.classList.contains('show-room'))document.body.classList.add('show-timeline');
  if(document.body.classList.contains('show-room'))requestAnimationFrame(()=>stage.resize());
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
function paintTimeline(){
  const list=$('timeline-list');if(!list)return;
  list.replaceChildren();
  const source=record();
  const title=$('timeline-title');
  if(title)title.textContent=source?source.title+' · '+source.accession:'';
  const edges=state.view?.edges||[];
  if(!edges.length){list.append(node('p','No shared category in this view.'));return;}
  for(const edge of edges){
    const target=viewingRecords().find(item=>item.accession===edge.target);
    if(!source||!target||!edge.reasons?.length)continue;
    const scene=conversationFor(source,target,edge,state.lens,{source:state.snapshots.get(state.seed),target:state.snapshots.get(target.accession)});
    const button=node('button',undefined,'path-post');
    button.type='button';
    button.append(node('span',edgeCategory(edge),'path-category'),node('strong',source.title+' · '+target.title));
    if(scene.dramaticArc)button.append(node('span',scene.dramaticArc,'path-arc'));
    if(scene.limits)button.append(node('span',scene.limits,'path-limit'));
    button.addEventListener('click',()=>{state.edge=edge.id;render();setMobileView('space');});
    list.append(button);
  }
}
function renderConversation(){
  const edge=shownEdge(),box=$('conversation-content');box.replaceChildren();
  state.conversation=null;
  clearScene();
  if(state.hover?.kind==='identity'){
    const identity=state.layerView?.relationships.find(item=>item.id===state.hover.id);
    if(identity){box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','A shared tag or identifier is not a historical relationship.','muted'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  }
  if(state.identityEdge&&state.identityEdge.id===state.edge&&state.hover?.kind!=='edge'){
    const identity=state.identityEdge;
    box.append(node('span','SCRIPTED · '+identity.validationState,'evidence-type'),node('h2',identity.type.replaceAll('_',' ')),node('p',identity.basis),node('p','Hidden layers remove both the line and its hit target. This edge is not a historical relationship.','muted'));
    $('voice-controls').hidden=true;setPlayDisabled(true);return;
  }
  if(!edge){box.append(node('h2','No shared category in this view.'),node('p','Try another object, category or perspective. An absent edge does not mean the objects have no relationship.'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  const source=record(),target=viewingRecords().find(r=>r.accession===edge.target);
  if(!source||!target){box.append(node('h2','No shared category in this view.'));$('voice-controls').hidden=true;setPlayDisabled(true);return;}
  const c=conversationFor(source,target,edge,state.lens,{source:state.snapshots.get(state.seed),target:state.snapshots.get(target.accession)});state.conversation=c;
  paintScene(c,edge);
  const chat=node('div',undefined,'chat');
  chat.style.setProperty('--link',tagColor(edge.reasons[0].value));
  const reader=CARD_BY_ID.get(state.lens)||CARD_BY_ID.get('family');
  const guide=CARD_BY_ID.get('archivist');
  const faces={
    objectA:{name:reader.label,src:portraitUrl(reader),side:'a'},
    objectB:{name:target.title,src:avatarFor(target),side:'b'},
    archivist:{name:'Archivist',src:guide?portraitUrl(guide):'',side:'guide'}
  };
  for(const turn of c.turns){
    const face=faces[turn.role]||faces.archivist;
    const bubble=node('article',undefined,'bubble turn side-'+face.side);bubble.dataset.role=turn.role;
    const img=node('img');img.className='avatar';img.alt='';img.src=face.src;
    const say=node('div',undefined,'say');say.append(node('strong',face.name),node('p',turn.text));
    for(const citation of turn.citations||[])say.append(node('small','Catalog field '+citation.pointer+' · '+citation.retrievedAt,'muted'));
    bubble.append(img,say);chat.append(bubble);
  }
  box.append(chat);
  if(c.mode!=='CURATED_EDGE_SCENE'&&c.dramaticArc)box.append(node('p',c.dramaticArc,'notice'));
  if(c.nextPrompt)box.append(node('p',c.nextPrompt,'notice'));
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
  const details=node('details');details.append(node('summary','Inspect the reason for this edge'));
  for(const reason of c.evidence){const e=node('div',undefined,'reason');e.append(node('strong',reason.family+' / '+reason.value),node('small',reason.sourceColumns.join(' + ')+' → '+reason.targetColumns.join(' + ')),node('small','Shared by '+reason.candidateCount+' records in this local index.'));details.append(e);}
  details.append(node('p',c.limits,'muted'),node('p','A shared tag is not a historical relationship.','muted'));box.append(details);$('voice-controls').hidden=$('conversation-panel').hidden;setPlayDisabled(state.playing);
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
  const frame=node('div',undefined,'record-frame');
  if(photo(r)){const img=node('img');img.src=photo(r);img.alt='Locally supplied image matched to '+r.accession;frame.append(img);}
  const toggle=node('button','','record-toggle');
  toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Show the record');
  const icon=svg('svg',{viewBox:'0 0 24 24','aria-hidden':'true'});
  icon.append(svg('path',{d:'M6 7h12M6 12h12M6 17h8',fill:'none',stroke:'currentColor','stroke-width':'1.6'}));
  toggle.append(icon);
  const overlay=node('div',undefined,'record-overlay');overlay.hidden=true;
  if(r.source!=='lakehouse')overlay.append(node('span',r.source==='invented'?'INVENTED EXAMPLE':r.source==='public-packet'?'PUBLIC PACKET · IDENTITY ONLY':r.source==='matrix'?'PHOTOGRAPHED MATRIX':'LOCAL CSV · SOURCE INPUT','evidence-type'));
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
  toggle.addEventListener('click',()=>{
    overlay.hidden=!overlay.hidden;
    const open=!overlay.hidden;
    toggle.setAttribute('aria-label',open?'Hide the record':'Show the record');
    toggle.setAttribute('aria-expanded',String(open));
  });
  frame.append(toggle,overlay);
  box.append(frame);
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
function render(){
  state.hover=null;
  paintChoices();
  if(roomMode()){renderRoom();return;}
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
      $('voice-controls')?.classList.add('playing');
      if($('audio-elapsed'))$('audio-elapsed').textContent='Turn '+(i+1)+' of '+conversation.turns.length;
      stage.setSpeaking(turn.role==='objectA'?conversation.source:turn.role==='objectB'?conversation.target:'');
      markSpeaker(turn.role);
      document.querySelectorAll('#conversation-content .turn').forEach((el,index)=>el.classList.toggle('speaking',index===i));
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
  finally{if(session===playback){state.playing=false;setPlayDisabled(false);document.querySelectorAll('.conversation-edge.speaking, #conversation-content .turn.speaking').forEach(e=>e.classList.remove('speaking'));$('voice-controls')?.classList.remove('playing');stage.setSpeaking('');markSpeaker('');}}
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
  button.addEventListener('click',()=>{$('lens').value=lens.id;$('lens').dispatchEvent(new Event('change'));closeSheet();});
  return button;
}));
document.querySelector('.finder').addEventListener('submit',event=>event.preventDefault());
const PANELS={map:'map-popover',reading:'reading-popover',seed:'seed-popover',theme:'theme-popover',more:'more-popover'};
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
$('zoom-open').addEventListener('click',()=>{document.querySelector('[data-more="layers"]').hidden=true;document.querySelector('[data-more="zoom"]').hidden=false;placePanel('more');});
$('sheet-back').addEventListener('click',()=>{resetMore();placePanel('more');});
document.addEventListener('click',event=>{
  if(event.target.closest('.tool-popover,.reading-popover,[data-sheet],.rail-head,.conversation-sheet,#space-bar,#room-back'))return;
  closeSheet();
});
$('conversation-head')?.addEventListener('click',event=>{
  event.stopPropagation();
  const sheet=$('conversation-sheet');
  const willOpen=sheet.hidden;
  closeSheet();
  sheet.hidden=!willOpen;
  $('conversation-head').setAttribute('aria-expanded',String(willOpen));
});
$('space-play')?.addEventListener('click',()=>$('play').click());
$('space-stop')?.addEventListener('click',()=>$('stop').click());
$('space-evidence')?.addEventListener('click',event=>{
  event.stopPropagation();
  if(document.body.classList.contains('show-timeline'))setMobileView('space');
  $('conversation-head').click();
});
$('space-room')?.addEventListener('click',()=>{
  state.mobileFrom=document.body.classList.contains('show-timeline')?'timeline':'space';
  setMobileView('room');
});
$('room-back')?.addEventListener('click',()=>setMobileView(state.mobileFrom||'space'));
$('space-leave')?.addEventListener('click',()=>setMobileView('timeline'));
const mobileMedia=window.matchMedia('(max-width: 800px)');
mobileMedia.addEventListener('change',syncMobileLayout);
window.addEventListener('resize',syncMobileLayout);
const stage=mountForceStage($('stage'),{onSelect:id=>onGraphSelect(id),background:'#111111'});
syncMobileLayout();
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
const sourceNote=$('source-note'), sourceInfo=$('source-info');
function placeSourceNote(){
  const icon=sourceInfo.getBoundingClientRect();
  const width=Math.min(320,window.innerWidth-24);
  sourceNote.style.top=Math.round(icon.bottom+8)+'px';
  sourceNote.style.left=Math.max(12,Math.min(Math.round(icon.right-width),window.innerWidth-width-12))+'px';
  sourceNote.style.width=width+'px';
}
function closeSourceNote(){sourceNote.hidden=true;sourceInfo.setAttribute('aria-expanded','false');}
sourceInfo.addEventListener('click',()=>{
  const open=sourceNote.hidden;
  if(open)placeSourceNote();
  sourceNote.hidden=!open;
  sourceInfo.setAttribute('aria-expanded',String(open));
});
document.addEventListener('click',event=>{
  if(sourceNote.hidden||sourceInfo.contains(event.target)||sourceNote.contains(event.target))return;
  closeSourceNote();
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSourceNote();});
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
for(const button of document.querySelectorAll('[data-map]'))button.addEventListener('click',()=>setMapMode(button.dataset.map));
$('present').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('voice-status','Full screen unavailable on this device.');}});
$('admin-toggle').addEventListener('click',()=>{const open=$('admin').hidden;$('admin').hidden=!open;$('admin-toggle').setAttribute('aria-expanded',String(open));});
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
    if(!response.ok)return;
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
if(requested&&!state.records.some(item=>item.accession===requested))message('import-status','Requested accession is not in the loaded set. No identity was assumed.');
