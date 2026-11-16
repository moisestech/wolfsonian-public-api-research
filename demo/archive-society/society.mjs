import { parseMatrixCsv } from '../../src/discovery-graph.mjs';
import { inventedRecords, societyView, conversationFor, LENSES, photoKeys, imageKeys, WORLD, categoryIconUrl, district } from '../../src/archive-society.mjs';
import { CARD_BY_ID, portraitUrl } from '../../src/discovery-personas.mjs';
import { applyLayers, buildAtlasGraph, recordsToAtlasInput } from '../../src/atlas-graph.mjs';
import { reconcileLookup } from '../../src/archive-evidence.mjs';

const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
const state={records:inventedRecords(),seed:'FICTION-01',lens:'family',edge:null,identityEdge:null,layerView:null,
  photos:new Map(),urls:new Set(),snapshots:new Map(),payload:null,
  background:'./assets/archive-landscape.jpg',scale:1,panX:0,panY:0,
  playing:false,epoch:0,view:null,conversation:null,lookupBusy:false,hover:null,imageTarget:null};
let playback=0,voiceAbort=null,currentAudio=null,lookupAbort=null,cancelDeviceSpeech=null;
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function svg(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;}
const message=(id,text)=>{$(id).textContent=text;};
const record=()=>state.records.find(r=>r.accession===state.seed);
const photo=r=>photoKeys(r).map(k=>state.photos.get(k)).find(Boolean);
function frameAt(x,y,scale){state.scale=scale;state.panX=-(x-1000)*state.scale;state.panY=-(y-562.5)*state.scale;transform();}
function frameNodes(){
  const marks=[...(state.view?.landmarks?.personas||[]),...(state.view?.landmarks?.categories||[])];
  const all=[...(state.view?.nodes||[]),...marks];
  if(!all.length){state.fit=1;state.scale=1;state.panX=0;state.panY=0;transform();return;}
  const minX=Math.min(...all.map(p=>p.x)),maxX=Math.max(...all.map(p=>p.x));
  const minY=Math.min(...all.map(p=>p.y)),maxY=Math.max(...all.map(p=>p.y));
  const worldW=Math.max(1,maxX-minX+440),worldH=Math.max(1,maxY-minY+440);
  const scale=Math.max(.12,Math.min(1.4,Math.min(2000/worldW,1125/worldH)));
  state.fit=scale;
  frameAt((minX+maxX)/2,(minY+maxY)/2,scale);
}
function fit(){if(state.view?.nodes?.length)frameNodes();else{state.fit=1;state.scale=1;state.panX=0;state.panY=0;transform();}}
function transform(){const e=$('world');if(e)e.setAttribute('transform','translate('+state.panX+' '+state.panY+') translate(1000 562.5) scale('+state.scale+') translate(-1000 -562.5)');syncZoomUi();}
function setZoomT(t){
  if(!state.fit)state.fit=state.scale||1;
  const prev=state.scale||state.fit;
  const wx=1000-state.panX/prev,wy=562.5-state.panY/prev;
  state.t=Math.min(100,Math.max(0,t));
  const max=2.8,base=Math.max(state.fit,.12);
  state.scale=Math.min(max,base*Math.pow(max/base,state.t/100));
  state.panX=-(wx-1000)*state.scale;state.panY=-(wy-562.5)*state.scale;
  transform();
}
function zoom(amount){
  if(!state.fit)state.fit=state.scale||1;
  const next=Math.max(.12,Math.min(2.8,state.scale*amount));
  const base=Math.max(state.fit,.12);
  const t=100*Math.log(next/base)/Math.log(2.8/base);
  setZoomT(Number.isFinite(t)?t:0);
}
function syncZoomUi(){
  const input=$('zoom');if(!input)return;
  if(!state.fit)state.fit=state.scale||1;
  const base=Math.max(state.fit,.12);
  const t=100*Math.log(Math.max(state.scale,base)/base)/Math.log(2.8/base);
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
  return 'hsl('+((hash>>>0)%360)+' 68% 64%)';
}
function objectBadge(record){
  const letter=(record.title||'?').replace(/[<>&"]/g,'').slice(0,1).toUpperCase()||'?';
  const markup='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="'+tagColor(district(record))+'"/><text x="32" y="42" text-anchor="middle" font-size="28" font-family="system-ui,sans-serif" fill="#142523">'+letter+'</text></svg>';
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
  const s=svg('g',{id:'world'}),defs=svg('defs');
  const xs=state.view.nodes.map(item=>item.x),ys=state.view.nodes.map(item=>item.y);
  const spanX=Math.max(WORLD.width,...xs,0)+480,spanY=Math.max(WORLD.height,...ys,0)+480;
  const cols=Math.ceil(spanX/WORLD.width),rows=Math.ceil(spanY/WORLD.height);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)s.append(svg('image',{href:state.background,x:col*WORLD.width,y:row*WORLD.height,width:WORLD.width,height:WORLD.height,preserveAspectRatio:'xMidYMid meet',opacity:'0.34'}));
  s.append(svg('rect',{x:0,y:0,width:cols*WORLD.width,height:rows*WORLD.height,fill:'#10231c',opacity:Number($('veil').value)/100}));
  const byId=new Map(state.view.nodes.map(n=>[n.record.accession,n]));
  const themeFilter=$('theme').value;
  if($('atlas-mode').checked){
    const cats=new Map((state.view.landmarks?.categories||[]).map(mark=>[mark.label,mark]));
    for(const item of state.view.nodes){
      const labels=(item.record.tags||[]).filter(tag=>tag.family==='theme').map(tag=>tag.value);
      const shown=themeFilter?labels.filter(label=>label===themeFilter):labels.slice(0,1);
      for(const label of shown){
        const mark=cats.get(label);
        if(!mark)continue;
        const line=svg('line',{x1:mark.x+18,y1:mark.y+18,x2:item.x,y2:item.y,class:themeFilter?'category-edge':'membership-edge'});
        line.style.stroke=tagColor(label);
        s.append(line);
      }
    }
  }
  for(const edge of state.view.edges){
    const a=byId.get(edge.source),b=byId.get(edge.target),mx=(a.x+b.x)/2,my=(a.y+b.y)/2-45;
    const d='M '+a.x+' '+a.y+' Q '+mx+' '+(my-90)+' '+b.x+' '+b.y;
    const color=tagColor(edge.reasons[0].value);
    const g=svg('g',{class:'conversation-edge'+(edge.id===state.edge?' selected':''),role:'button',tabindex:0,'aria-label':'Hear conversation: '+b.record.title+'; shared '+edge.reasons[0].value,'data-edge':edge.id});
    g.style.setProperty('--edge',color);
    g.append(svg('path',{d,class:'edge-halo'}),svg('path',{d,class:'edge-line'}),svg('path',{d,class:'hit'}));
    g.append(svg('circle',{cx:a.x,cy:a.y,r:9,class:'edge-end'}),svg('circle',{cx:b.x,cy:b.y,r:9,class:'edge-end'}));
    const label=edge.reasons[0].value,width=Math.min(350,Math.max(150,label.length*9));
    g.append(svg('rect',{x:mx-width/2,y:my-62,width,height:36,rx:18,class:'chip'}),svg('text',{x:mx,y:my-38,'text-anchor':'middle'},label));
    const select=()=>{stop();resetApproval();state.edge=edge.id;state.identityEdge=null;render();setPanel('conversation');};
    bindHover(g,{kind:'edge',id:edge.id});
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});s.append(g);
  }
  const layers=applyLayers(buildAtlasGraph(recordsToAtlasInput(state.view.nodes.map(n=>n.record)),{useSyntheticBoxes:$('layer-box-sim').checked}),{accession:$('layer-accession').checked,box:$('layer-box').checked});
  state.layerView=layers;
  const notice=$('layer-notice');
  if($('layer-box').checked&&layers.boxNotice){notice.hidden=false;notice.textContent=layers.boxNotice;}else notice.hidden=true;
  layers.relationships.forEach((edge,index)=>{
    const origin=state.view.nodes.find(n=>n.record.accession===edge.source.replace(/^object:/,''));
    if(!origin)return;
    const x=origin.x+150,y=origin.y-70-(index%3)*28;
    const d='M '+origin.x+' '+origin.y+' L '+x+' '+y;
    const g=svg('g',{class:'identity-edge'+(edge.layer==='box'?' box':'')+(edge.id===state.edge?' selected':''),role:'button',tabindex:0,'data-edge':edge.id,'aria-label':edge.type+' '+edge.basis});
    g.append(svg('path',{d,class:'edge-line'}),svg('path',{d,class:'hit'}));
    g.append(svg('text',{x,y,class:'identity-label'},edge.layer==='box'?'BOX · '+edge.validationState:edge.validationState+' · '+edge.target.replace('accession:','')));
    const select=()=>{stop();resetApproval();state.edge=edge.id;state.identityEdge=edge;render();setPanel('conversation');};
    bindHover(g,{kind:'identity',id:edge.id});
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});
    s.append(g);
  });
  const theme=$('theme').value;
  if($('atlas-mode').checked){
    const labels=new Map();
    for(const item of state.view.nodes){
      const at=labels.get(item.district);
      if(!at||item.y<at.y)labels.set(item.district,{x:item.x,y:item.y});
    }
    for(const [name,at] of labels)s.append(svg('text',{x:at.x-70,y:at.y-108,class:'district-label'},name));
  }
  state.view.nodes.forEach((item,i)=>{
    const {record:r,x,y}=item;
    const open=()=>changeSeed(r.accession);
    if($('atlas-mode').checked&&r.accession!==state.seed){
      const w=150,h=78,g=svg('g',{class:'object-card compact'+(lensMatch(r)?' emphasized':' quiet'),transform:'translate('+(x-w/2)+' '+(y-h/2)+')',role:'button',tabindex:0,'aria-label':r.title+' · '+r.accession,'data-accession':r.accession});
      g.append(svg('rect',{x:0,y:0,width:w,height:h,rx:8,class:'card'}));
      const local=photo(r),mark=portraitFor(r);
      if(local)addAvatar(defs,g,local,8,16,42,'thumbnail');
      else if(mark)addAvatar(defs,g,mark,8,14,44,'persona-mark');
      else addAvatar(defs,g,objectBadge(r),8,14,44);
      g.append(svg('text',{x:52,y:32,class:'marker-title'},r.title.length>18?r.title.slice(0,17)+'…':r.title));
      g.append(svg('text',{x:52,y:54,class:'accession'},r.accession));
      bindHover(g,{kind:'object',accession:r.accession});
      g.addEventListener('click',open);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});
      s.append(g);return;
    }
    const w=238,h=173;
    const g=svg('g',{class:'object-card'+(r.accession===state.seed?' selected':'')+(lensMatch(r)?' emphasized':' quiet'),transform:'translate('+(x-w/2)+' '+(y-h/2)+')',role:'button',tabindex:0,'aria-label':r.title+' · '+r.accession,'data-accession':r.accession});
    g.append(svg('rect',{x:0,y:0,width:w,height:h,rx:10,class:'card'}));
    const url=photo(r),mark=portraitFor(r),clipId='photo-clip-'+i,clip=svg('clipPath',{id:clipId});
    clip.append(svg('rect',{x:9,y:9,width:220,height:83,rx:5}));defs.append(clip);
    if(url)g.append(svg('image',{href:url,x:9,y:9,width:220,height:83,preserveAspectRatio:'xMidYMid meet','clip-path':'url(#'+clipId+')',class:'thumbnail'}));
    else if(mark)g.append(svg('image',{href:mark,x:9,y:9,width:220,height:83,preserveAspectRatio:'xMidYMid meet','clip-path':'url(#'+clipId+')',class:'persona-mark'}));
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
    addAvatar(defs,g,avatarFor(r),186,10,42,lensMatch(r)?'persona-mark':'');
    wrapTitle(r.title).forEach((line,j)=>g.append(svg('text',{x:13,y:113+j*21,class:'object-title',textLength:Math.min(212,line.length*10.3),lengthAdjust:'spacingAndGlyphs'},line)));
    g.append(svg('text',{x:13,y:160,class:'accession'},r.accession.length>28?r.accession.slice(0,27)+'…':r.accession));
    bindHover(g,{kind:'object',accession:r.accession});
    g.addEventListener('click',open);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();open();}});
    s.append(g);
  });
  for(const mark of state.view.landmarks?.personas||[]){
    const g=svg('g',{class:'landmark persona'+(mark.lens===state.lens?' selected':''),transform:'translate('+(mark.x-28)+' '+(mark.y-36)+')',role:'button',tabindex:0,'aria-label':'Read as '+mark.label});
    const card=CARD_BY_ID.get(mark.lens);
    if(card)g.append(svg('image',{href:portraitUrl(card),x:0,y:0,width:56,height:66,class:'persona-mark'}));
    g.append(svg('text',{x:28,y:82,'text-anchor':'middle',class:'landmark-label'},mark.label));
    const select=()=>{stop();resetApproval();state.lens=mark.lens;$('lens').value=mark.lens;state.edge=null;render();};
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});
    s.append(g);
  }
  for(const mark of state.view.landmarks?.categories||[]){
    const g=svg('g',{class:'landmark category'+(theme===mark.label?' selected':''),transform:'translate('+(mark.x-18)+' '+(mark.y-18)+')',role:'button',tabindex:0,'aria-label':'Category '+mark.label});
    g.append(svg('image',{href:categoryIconUrl(mark.label),x:0,y:0,width:36,height:36,class:'category-mark'}));
    g.append(svg('text',{x:18,y:54,'text-anchor':'middle',class:'landmark-label'},mark.label));
    const select=()=>{stop();resetApproval();$('theme').value=mark.label;state.edge=null;state.identityEdge=null;render();frameAt(mark.x,mark.y,1.15);};
    g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});
    s.append(g);
  }
  $('network').replaceChildren(defs,s);transform();
}
function stagePlate(rec){
  const fig=node('figure',undefined,'plate');
  const img=node('img');img.src=avatarFor(rec);img.alt='';
  const add=node('button','Add image');add.type='button';add.className='add-image';
  add.addEventListener('click',()=>{state.imageTarget=rec.accession;$('add-image').click();});
  fig.append(img,node('figcaption',rec.title+' · '+rec.accession),add);
  return fig;
}
function renderStage(){
  const box=$('zoom-stage');if(!box||!state.view)return;
  box.replaceChildren();
  const row=node('div',undefined,'zoom-pair');
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
function renderConversation(){
  const edge=shownEdge(),box=$('conversation-content');box.replaceChildren();
  state.conversation=null;
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
  const chat=node('div',undefined,'chat');
  const topic=node('p',edge.reasons[0].value,'chat-topic');topic.style.background=tagColor(edge.reasons[0].value);chat.append(topic);
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
    const say=node('div',undefined,'say');say.append(node('strong',face.name),node('p',turn.text));
    for(const citation of turn.citations||[])say.append(node('small','Catalog field '+citation.pointer+' · '+citation.retrievedAt,'muted'));
    bubble.append(img,say);chat.append(bubble);
  }
  box.append(chat);
  const details=node('details');details.append(node('summary','Inspect the reason for this edge'));
  for(const reason of c.evidence){const e=node('div',undefined,'reason');e.append(node('strong',reason.family+' / '+reason.value),node('small',reason.sourceColumns.join(' + ')+' → '+reason.targetColumns.join(' + ')),node('small','Shared by '+reason.candidateCount+' records in this local index.'));details.append(e);}
  details.append(node('p',c.limits,'muted'));box.append(details);$('voice-controls').hidden=false;$('play').disabled=state.playing;
}
function pair(list,label,value){list.append(node('dt',label),node('dd',value||'Not supplied'));}
function renderRecord(){
  const r=focusRecord(),box=$('record-content');box.replaceChildren(node('span',r.source==='invented'?'INVENTED EXAMPLE':'LOCAL CSV · SOURCE INPUT','evidence-type'),node('h2',r.title));
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
  state.hover=null;
  state.view=societyView(state.records,state.seed,state.lens,{atlas:$('atlas-mode').checked,theme:$('theme').value});
  const lens=LENSES.find(l=>l.id===state.lens);
  message('lens-question',lens.question);message('atlas-title',record().title);
  message('source-status',record().source==='invented'?'Invented demonstration':'Local CSV · browser only');
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
paintReading();
$('seed').addEventListener('change',()=>changeSeed($('seed').value));
$('search').addEventListener('input',()=>{stop();resetApproval();options();render();});
for(const id of ['layer-accession','layer-box','layer-box-sim'])$(id).addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();});
$('atlas-mode').addEventListener('change',()=>{stop();resetApproval();state.edge=null;state.identityEdge=null;render();if($('atlas-mode').checked)frameNodes();else{state.fit=1;state.scale=1;state.panX=0;state.panY=0;transform();}});
$('theme').addEventListener('change',()=>{
  stop();resetApproval();state.edge=null;state.identityEdge=null;render();
  const theme=$('theme').value,mark=state.view.landmarks?.categories?.find(item=>item.label===theme);
  if($('atlas-mode').checked&&mark)frameAt(mark.x,mark.y,1.15);
});
$('veil').addEventListener('input',renderGraph);
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>setPanel(b.dataset.panel)));
$('voice-mode').addEventListener('change',()=>{stop();resetApproval();$('approval-box').hidden=$('voice-mode').value!=='elevenlabs';});
$('play').addEventListener('click',play);$('stop').addEventListener('click',()=>{stop();message('voice-status','Playback stopped.');});$('export').addEventListener('click',saveConversation);
$('restore').addEventListener('click',()=>{invalidateData();clearPhotos();state.records=inventedRecords();state.seed=state.records[0].accession;$('search').value='';$('atlas-mode').checked=false;categories();options();fit();render();message('import-status','Invented example restored. Local images and snapshots cleared.');});
$('csv-file').addEventListener('change',async e=>{
  const file=e.target.files[0];if(!file)return;
  try{if(file.size>5*1024*1024)throw new Error('CSV exceeds the 5 MiB demo limit.');const parsed=parseMatrixCsv(await file.text());invalidateData();state.records=parsed.records.map(r=>({...r,source:'local-csv'}));state.seed=state.records[0].accession;$('search').value='';categories();options();fit();render();message('import-status',state.records.length+' CSV objects loaded locally. No upload.');}catch(error){message('import-status',error.message);}finally{e.target.value='';}
});
$('add-image').addEventListener('change',e=>{
  const file=e.target.files[0],accession=state.imageTarget;e.target.value='';
  if(!file||!accession||!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>10*1024*1024)return;
  const url=URL.createObjectURL(file),rec=state.records.find(r=>r.accession===accession);
  state.urls.add(url);
  for(const key of new Set([...imageKeys(file.name),...imageKeys(accession),...(rec?photoKeys(rec):[])]))state.photos.set(key,url);
  render();
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
$('zoom').addEventListener('input',()=>setZoomT(Number($('zoom').value)));
for(const button of document.querySelectorAll('[data-stop]'))button.addEventListener('click',()=>setZoomT(Number(button.dataset.stop)));
$('present').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('voice-status','Full screen unavailable on this device.');}});
$('admin-toggle').addEventListener('click',()=>{const open=$('admin').hidden;$('admin').hidden=!open;$('admin-toggle').setAttribute('aria-expanded',String(open));});
let drag=null;
$('network').addEventListener('pointerdown',e=>{if(e.target.closest('.object-card,.conversation-edge,.identity-edge,.landmark'))return;drag={x:e.clientX,y:e.clientY,px:state.panX,py:state.panY};$('network').setPointerCapture(e.pointerId);});
$('network').addEventListener('pointermove',e=>{if(!drag)return;const r=$('network').getBoundingClientRect();state.panX=drag.px+(e.clientX-drag.x)*2000/r.width;state.panY=drag.py+(e.clientY-drag.y)*1125/r.height;transform();});
for(const event of ['pointerup','pointercancel'])$('network').addEventListener(event,()=>{drag=null;});
$('network').addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();zoom(e.deltaY<0?1.07:1/1.07);},{passive:false});
window.addEventListener('beforeunload',()=>{stop();clearPhotos();});
const requested=new URLSearchParams(location.search).get('accession');
if(requested&&state.records.some(record=>record.accession===requested))state.seed=requested;
categories();options();render();
if(requested&&!state.records.some(record=>record.accession===requested))message('import-status','Requested accession is not in the loaded set. No identity was assumed.');
