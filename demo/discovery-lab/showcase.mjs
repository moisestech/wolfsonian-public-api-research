import { buildDiscoveryIndex, parseMatrixCsv, recommendNeighbors, FAMILIES } from '../../src/discovery-graph.mjs';
import { CARDS, CARD_BY_ID, portraitUrl } from '../../src/discovery-personas.mjs';
import { makeDialogue, replyToQuestion } from '../../src/discovery-dialogue.mjs';

// Deliberately INVENTED source examples: never present these as museum objects.
const EXAMPLES = [
 ['FICTION-01','Imagined express railway advertisement',['Travel / Transportation','Technology','Advertising'],['Trains','Speed'],'Montage','Germany'],
 ['FICTION-02','Imagined coastal holiday poster',['Travel / Transportation','Advertising','Leisure / Entertainment'],['Ships','Water'],'Silhouette','France'],
 ['FICTION-03','Imagined household safety notice',['Safety / Health','Technology','Domestic life'],['Hands','Electric bolts'],'Symbolism','France'],
 ['FICTION-04','Imagined union organizing poster',['Labor','Industry','Politics'],['Workers','Hands'],'Monumental perspective','United Kingdom'],
 ['FICTION-05','Imagined international air exhibition',['Travel / Transportation','Technology','Expositions and fairs'],['Aircraft','Speed'],'Montage','Italy'],
 ['FICTION-06','Imagined architectural future',['Architecture','Cities','Technology'],['Buildings','Machines'],'Art Deco','United States'],
 ['FICTION-07','Imagined domestic appliance advertisement',['Domestic life','Advertising','Technology'],['Hands','Machines'],'Art Deco','United States'],
 ['FICTION-08','Imagined civic remembrance broadside',['Commemoration','War / Military','Politics'],['National symbols','Monuments'],'Symbolism','France'],
 ['FICTION-09','Imagined world travel map',['Travel / Transportation','Luxury','Advertising'],['Maps / Globes','Aircraft'],'Information graphics','United States'],
 ['FICTION-10','Imagined building workers poster',['Labor','Architecture','Industry'],['Workers','Buildings'],'Monumental perspective','The Netherlands'],
 ['FICTION-11','Imagined public health poster',['Safety / Health','Advertising','Domestic life'],['Children','Hands'],'Silhouette','United States'],
 ['FICTION-12','Imagined industrial progress exhibition',['Expositions and fairs','Industry','Technology'],['Factories','Gears'],'Art Deco','Italy']
];
const tag=(family,value,column)=>({id:family+':'+value.toLowerCase(),family,value,sourceColumns:[column]});
const sampleRecords=EXAMPLES.map(([accession,title,themes,motifs,style,geography])=>({
 accession,title,creator:'Fictional example',date:'not a historical date',objectType:'conceptual poster',interpretiveText:'Entirely invented example for demonstrating metadata exploration. Not a Wolfsonian object.',imageFilename:'',
 tags:[...themes.map((v,i)=>tag('theme',v,'Thematic Category '+(i+1))),
      ...motifs.map((v,i)=>tag('motif',v,'Symbols/Motifs '+(i+1))),
      tag('style',style,'Visual Strategy/Style'),tag('geography',geography,'Geography')]
}));
const $=id=>document.getElementById(id);
const E={
  source:$('source-panel'),sourceOpen:$('open-source'),sourceClose:$('close-source'),csv:$('csv-import'),images:$('image-import'),restore:$('restore-demo'),status:$('data-status'),chip:$('data-chip'),
  everyday:$('show-everyday'),archive:$('show-archive'),personaList:$('persona-list'),personaFeature:$('persona-feature'),promptOpen:$('reveal-prompt'),
  graph:$('network'),surface:$('graph-surface'),title:$('stage-title'),tags:$('show-tags'),graphCount:$('graph-count'),empty:$('graph-empty'),
  search:$('object-search'),select:$('object-select'),connection:$('connection-panel'),object:$('object-panel'),voice:$('voice-panel'),
  dialogue:$('dialogue'),play:$('play-voice'),stop:$('stop-voice'),question:$('object-question'),ask:$('ask-object'),answer:$('object-answer'),
  modal:$('prompt-modal'),promptBackdrop:$('prompt-backdrop'),promptClose:$('close-prompt'),promptTitle:$('prompt-title'),promptDescription:$('prompt-description'),promptText:$('prompt-text'),promptCopy:$('copy-prompt'),present:$('present')
};
const model={
  records:sampleRecords,index:buildDiscoveryIndex(sampleRecords),seed:sampleRecords[0].accession,
  real:false,lens:'family',group:'everyday',selected:null,tab:'connection',search:'',
  photos:new Map(),photoCount:0,previous:[],showTags:true,scale:1,panX:0,panY:0
};
const NS='http://www.w3.org/2000/svg';
const svg=(name,attrs={},text)=>{
  const el=document.createElementNS(NS,name);
  for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
  if(text!==undefined)el.textContent=String(text);
  return el;
};
const element=(name,text,cls)=>{
  const el=document.createElement(name);
  if(text!==undefined)el.textContent=String(text);
  if(cls)el.className=cls;
  return el;
};
const clip=(value,max)=>{const s=String(value||'');return s.length>max?s.slice(0,max-1)+'…':s;};
const record=()=>model.index.objects.get(model.seed);
const card=()=>CARD_BY_ID.get(model.lens)||CARDS[0];
const candidates=()=>recommendNeighbors(model.index,model.seed,model.lens,6);
const activeMatch=()=>candidates().find(x=>x.record.accession===model.selected)||null;
const topFamily=match=>match?.reasons?.[0]?.family||'theme';
const colorByFamily={theme:'#58C2B5',motif:'#E4A172',style:'#C0A4E4',geography:'#9AAEB9'};
const fixedPoints=[[228,140],[540,116],[852,140],[228,514],[540,537],[852,514]];
function fillSvg(el,arr){el.replaceChildren(...arr);}
function renderPersonaRail(){
  E.personaList.replaceChildren();
  const cards=CARDS.filter(p=>p.group===model.group || (model.group==='archive' && p.id==='worker'));
  for(const p of cards){
    const btn=element('button',undefined,'persona-item'+(model.lens===p.id?' active':''));
    btn.type='button';btn.style.setProperty('--persona-color',p.color);
    btn.setAttribute('aria-pressed',String(model.lens===p.id));
    btn.setAttribute('aria-label','Select '+p.label+' interpretive lens');
    const image=element('img');image.src=portraitUrl(p);image.alt='Conceptual illustrated portrait: '+p.label;image.decoding='async';
    const copy=element('span');copy.append(element('strong',p.label),element('small',p.subheading));
    btn.append(image,copy);
    btn.addEventListener('click',()=>{stopSpeech();model.lens=p.id;model.selected=null;renderPersonaRail();renderStage();renderInspector();});
    E.personaList.append(btn);
  }
  E.everyday.classList.toggle('active',model.group==='everyday');
  E.archive.classList.toggle('active',model.group==='archive');
  E.everyday.setAttribute('aria-pressed',String(model.group==='everyday'));
  E.archive.setAttribute('aria-pressed',String(model.group==='archive'));
  const persona=card();
  E.personaFeature.replaceChildren();
  const bar=element('div',undefined,'color-bar');bar.style.backgroundColor=persona.color;
  E.personaFeature.append(bar,element('h3',persona.hook),element('p',persona.description));
}
function renderObjectOptions(){
  const q=model.search.toLowerCase();
  const filtered=model.records.filter(r=>(r.title+' '+r.accession).toLowerCase().includes(q)).sort((a,b)=>a.title.localeCompare(b.title));
  E.select.replaceChildren();
  for(const r of filtered){
    const option=element('option',clip(r.title,55)+' — '+r.accession);option.value=r.accession;
    E.select.append(option);
  }
  if(!filtered.some(r=>r.accession===model.seed)&&filtered.length)model.seed=filtered[0].accession;
  E.select.disabled=!filtered.length;
  if(filtered.length)E.select.value=model.seed;
}
function setRecords(records,real){
  stopSpeech();model.records=records;model.index=buildDiscoveryIndex(records);
  model.seed=records[0].accession;model.selected=null;model.real=real;model.search='';E.search.value='';
  model.panX=0;model.panY=0;model.scale=1;
  E.chip.textContent=real?'LOCAL SOURCE · '+records.length+' RECORDS':'INVENTED DEMO · '+records.length;
  E.status.textContent=real
    ?'Loaded '+records.length+' object rows locally. No CSV contents have been sent to any service.'
    :'Invented demonstration records loaded. No actual museum objects are bundled.';
  renderObjectOptions();renderStage();renderInspector();
}
function openSource(yes){
  E.source.hidden=!yes;E.sourceOpen.setAttribute('aria-expanded',String(yes));
  if(yes)E.sourceClose.focus();else E.sourceOpen.focus();
}
function switchTab(tab){
  model.tab=tab;
  for(const btn of document.querySelectorAll('[data-detail]')){
    const active=btn.dataset.detail===tab;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
  }
  E.connection.hidden=tab!=='connection';E.object.hidden=tab!=='object';E.voice.hidden=tab!=='voice';
  renderInspector();
}
function changeSeed(accession){
  if(!model.index.objects.has(accession))return;
  if(model.seed!==accession)model.previous.push(model.seed);
  model.seed=accession;model.selected=null;model.panX=0;model.panY=0;model.scale=1;
  stopSpeech();model.search='';E.search.value='';
  renderObjectOptions();renderStage();renderInspector();
}
function selectEdge(accession){
  model.selected=accession;switchTab('connection');renderStage();renderInspector();
}
function addLine(g,x1,y1,x2,y2,attrs={}){
  const l=svg('path',{d:'M '+x1+' '+y1+' L '+x2+' '+y2,...attrs});g.append(l);return l;
}
function hashId(value){let h=0;for(const c of String(value)){h=(h*31+c.charCodeAt(0))>>>0;}return h.toString(36);}
function visual(record,x,y,w,h,group){
  const px=x+10,py=y+10,bw=w>220?80:67,bh=h-20;
  const id='pic-'+hashId(record.accession);
  const defs=svg('defs');
  const cp=svg('clipPath',{id});cp.append(svg('rect',{x:px,y:py,width:bw,height:bh,rx:8}));defs.append(cp);group.append(defs);
  group.append(svg('rect',{x:px,y:py,width:bw,height:bh,rx:8,class:'node-img-frame'}));
  const imgName=(record.imageFilename||'').toLowerCase().trim();
  const src=model.photos.get(imgName);
  if(src){
    const img=svg('image',{x:px,y:py,width:bw,height:bh,href:src,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#'+id+')',class:'node-thumbnail'});
    group.append(img);
  }else{
    // Intentionally abstract original poster composition, not a documentary facsimile.
    const seed=parseInt(hashId(record.accession),36)||12;
    const colors=['#63BDB6','#DEA67B','#98B4D8','#BEA7CD','#89AA9C'];
    group.append(svg('rect',{x:px,y:py,width:bw,height:bh,rx:8,fill:colors[seed%colors.length],opacity:.75}));
    group.append(svg('circle',{cx:px+bw*.69,cy:py+bh*.31,r:bh*.22,fill:'#162C40',opacity:.8}));
    group.append(svg('path',{d:'M '+(px-3)+' '+(py+bh*.88)+' L '+(px+bw*.24)+' '+(py+bh*.37)+' L '+(px+bw*.54)+' '+(py+bh*.78)+' L '+(px+bw+4)+' '+(py+bh*.4)+' L '+(px+bw)+' '+(py+bh)+' L '+px+' '+(py+bh)+' Z',fill:'#203C52',opacity:.7}));
    group.append(svg('text',{x:px+bw/2,y:py+bh-8,'text-anchor':'middle','font-size':10,'font-weight':800,fill:'#fff','letter-spacing':'.05em'},'ILLUSTRATIVE'));
  }
}
function nodeTitle(group,r,x,y,w,h){
  const bodyX=x+(w>220?101:87),maxChars=w>220?17:14;
  let text=r.title||'Untitled';
  let words=text.split(/\s+/),lines=[],line='';
  for(const word of words){
    if((line+' '+word).trim().length>maxChars && line){lines.push(line);line=word;}else line=(line+' '+word).trim();
  }
  if(line)lines.push(line);
  const shown=lines.slice(0,3);
  if(lines.length>3)shown[2]=clip(shown[2],maxChars-1);
  for(let i=0;i<shown.length;i++){
    group.append(svg('text',{x:bodyX,y:y+42+i*19,class:'node-title'},shown[i]));
  }
  group.append(svg('text',{x:bodyX,y:y+h-11,class:'node-id'},clip(r.accession,16)));
  group.append(svg('text',{x:bodyX,y:y+20,class:'node-type'},model.real?'COLLECTION RECORD':'INVENTED EXAMPLE'));
}
function renderNode(group,r,x,y,isCenter,isSelected){
  const w=isCenter?240:210,h=isCenter?128:114;
  const left=x-w/2,top=y-h/2;
  const node=svg('g',{class:'object-node'+(isCenter?' is-center':'')+(isSelected?' is-selected':''),role:'button',tabindex:0,'aria-label':'Explore object '+r.title,'data-object':r.accession});
  node.append(svg('rect',{x:left,y:top,width:w,height:h,rx:14,class:'node-bg'}));
  visual(r,left,top,w,h,node);
  nodeTitle(node,r,left,top,w,h);
  const action=()=>changeSeed(r.accession);
  node.addEventListener('click',e=>{e.stopPropagation();action();});
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});
  group.append(node);
}
function chip(group,label,x,y,family,accession){
  const trimmed=clip(label,25),w=Math.max(90,Math.min(220,trimmed.length*8.4+25));
  const g=svg('g',{class:'edge-chip',role:'button',tabindex:0,'aria-label':'Inspect shared '+family+' tag '+label});
  g.append(svg('rect',{x:x-w/2,y:y-17,width:w,height:34,rx:17}));
  g.append(svg('circle',{cx:x-w/2+14,cy:y,r:5,fill:colorByFamily[family]}));
  g.append(svg('text',{x:x+5,y:y+5,'text-anchor':'middle'},trimmed));
  const act=e=>{e.stopPropagation();selectEdge(accession);};
  g.addEventListener('click',act);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act(e);}});
  group.append(g);
}
function renderStage(){
  E.graph.replaceChildren();
  const root=svg('g',{id:'stage-world',transform:'translate('+model.panX+' '+model.panY+') translate(540 325) scale('+model.scale+') translate(-540 -325)'});
  E.graph.append(root);
  const selected=record();
  if(!selected){E.empty.hidden=false;return;}
  E.empty.hidden=true;
  const related=candidates();
  for(let i=0;i<related.length;i++){
    const item=related[i],point=fixedPoints[i],family=topFamily(item);
    const x=point[0],y=point[1],midX=(540+x)/2,midY=(325+y)/2;
    const curve='M 540 325 Q '+(midX+(x<540?-15:15))+' '+(midY+(y<325?-15:15))+' '+x+' '+y;
    const g=svg('g',{class:'edge-group'}),active=model.selected===item.record.accession;
    g.append(svg('path',{d:curve,class:'edge edge--'+family+(active?' is-selected':'')}));
    const hit=svg('path',{d:curve,class:'edge-hit',role:'button',tabindex:0,'aria-label':'Inspect metadata connection from '+selected.title+' to '+item.record.title});
    hit.addEventListener('click',e=>{e.stopPropagation();selectEdge(item.record.accession);});
    hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectEdge(item.record.accession);}});
    g.append(hit);root.append(g);
    if(model.showTags){
      const reason=item.reasons[0];
      chip(root,reason.value,midX+(x<540?-16:16),midY+(y<325?-4:4),reason.family,item.record.accession);
    }
  }
  for(let i=0;i<related.length;i++){
    const point=fixedPoints[i],item=related[i];
    renderNode(root,item.record,point[0],point[1],false,model.selected===item.record.accession);
  }
  renderNode(root,selected,540,325,true,false);
  E.title.textContent=clip(selected.title,55);
  E.graphCount.textContent=model.index.size+' '+(model.real?'locally loaded museum records':'invented example records')+' · '+related.length+' visible metadata pathways · 0 historical claims inferred';
}
function safeP(label,text,cls){const p=element('p',text,cls);if(label)p.prepend(element('strong',label+' '));return p;}
function reasonsPanel(match){
  const wrap=element('div');
  if(!match){
    wrap.append(element('h3','Start with an object','big-label'),
      safeP('','Select a connecting line, a category label, or a neighboring object to examine an association.','passage'));
    if(candidates().length)wrap.append(safeP('','The top suggested pathway is highlighted when you click a connection.'));
    return wrap;
  }
  wrap.append(element('p','METADATA ASSOCIATION · NOT DOCUMENTED HISTORY','meta'));
  wrap.append(element('h3',match.record.title,'big-label'));
  wrap.append(safeP('','This connection exists because both records use some of the same staff-assigned category terms.','evidence'));
  for(const reason of match.reasons){
    const div=element('div',undefined,'reason');
    div.append(element('strong',FAMILIES[reason.family].label+' · '+reason.value),
      element('small','From '+reason.sourceColumns.join(', ')+' → '+reason.targetColumns.join(', ')+'. Shared among '+reason.candidateCount+' local records.'));
    wrap.append(div);
  }
  wrap.append(safeP('','A matching tag is a route through a collection, not proof these objects directly influenced or encountered each other.','passage'));
  const btn=element('button','Listen to their imagined conversation →','inspector-cta');
  btn.addEventListener('click',()=>switchTab('voice'));wrap.append(btn);
  return wrap;
}
function renderObjectPanel(){
  const box=E.object;box.replaceChildren();
  const r=record();if(!r)return;
  box.append(element('p','SELECTED SOURCE RECORD','meta'),
    element('h3',r.title,'big-label'));
  box.append(safeP('Accession:',r.accession),safeP('Creator:',r.creator||'Not supplied'),
    safeP('Date:',r.date||'Not supplied'),safeP('Object type:',r.objectType||'Not supplied'));
  const meta=element('div',undefined,'evidence');
  meta.append(element('strong','Identity is not physical location'),
    safeP('Catalog ID:',r.accession),
    safeP('Box number:','Not present in this supplied CSV. Lakehouse is a separate system; no box pairing inferred.'));
  box.append(meta);
  const tags=element('div',undefined,'chip-row');
  for(const t of r.tags)tags.append(element('span',t.value,'chip'));
  box.append(element('h3','Indexing vocabulary'),tags);
  box.append(element('h3','Interpretive description'));
  box.append(safeP('',r.interpretiveText||'No interpretive text supplied in this working record.'));
  box.append(safeP('Image file:',r.imageFilename||'Not supplied'));
  if(r.imageFilename && !model.photos.has(r.imageFilename.toLowerCase().trim()))box.append(element('p','Original image not loaded; illustration in graph is NOT a photograph of the item.','passage'));
}
function renderDialogue(){
  E.dialogue.replaceChildren();
  const source=record(),match=activeMatch()||candidates()[0];
  if(!source||!match){E.dialogue.append(element('p','Choose a connected object first.'));E.play.disabled=true;return;}
  E.play.disabled=!('speechSynthesis' in window);
  const script=makeDialogue(source,match.record,match,card());
  for(const entry of script){
    const div=element('div',undefined,'passage');
    div.append(element('strong',entry.actor+' · '+entry.role),element('p',entry.text));
    E.dialogue.append(div);
  }
}
function renderInspector(){
  E.connection.replaceChildren(reasonsPanel(activeMatch()||candidates()[0]||null));
  renderObjectPanel();
  if(model.tab==='voice'){renderDialogue();E.answer.textContent='';}
}
function stopSpeech(){if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function playSpeech(){
  stopSpeech();
  if(!('speechSynthesis' in window))return;
  const src=record(),match=activeMatch()||candidates()[0];
  if(!src||!match)return;
  const lines=makeDialogue(src,match.record,match,card());
  for(let i=0;i<lines.length;i++){
    const utterance=new SpeechSynthesisUtterance(lines[i].text);
    utterance.rate=.95;utterance.pitch=[.93,1.08,1][i];utterance.lang='en-US';
    window.speechSynthesis.speak(utterance);
  }
}
function openPrompt(){
  const p=card();
  E.promptTitle.textContent=p.label+' · '+p.subheading;
  E.promptDescription.textContent=p.description+' The following is a proposed, inspectable archetype specification.';
  E.promptText.textContent=p.prompt;
  E.modal.hidden=false;E.promptClose.focus();
}
function closePrompt(){E.modal.hidden=true;E.promptOpen.focus();}
function scaleBy(delta){model.scale=Math.min(1.8,Math.max(.7,model.scale*delta));renderStage();}
function initialize(){
  E.everyday.addEventListener('click',()=>{model.group='everyday';if(card().group!==model.group)model.lens='family';renderPersonaRail();renderStage();renderInspector();});
  E.archive.addEventListener('click',()=>{model.group='archive';if(card().group!==model.group)model.lens='archivist';renderPersonaRail();renderStage();renderInspector();});
  E.promptOpen.addEventListener('click',openPrompt);
  E.promptClose.addEventListener('click',closePrompt);
  E.promptBackdrop.addEventListener('click',closePrompt);
  E.promptCopy.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(card().prompt);E.promptCopy.textContent='Copied';}
    catch{E.promptCopy.textContent='Copy unavailable';}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!E.modal.hidden)closePrompt();
    else if(e.key==='Escape'&&!E.source.hidden)openSource(false);
  });
  E.sourceOpen.addEventListener('click',()=>openSource(E.source.hidden));
  E.sourceClose.addEventListener('click',()=>openSource(false));
  E.restore.addEventListener('click',()=>{
    for(const url of model.photos.values())URL.revokeObjectURL(url);
    model.photos.clear();model.photoCount=0;E.csv.value='';E.images.value='';
    setRecords(sampleRecords,false);openSource(false);
  });
  E.csv.addEventListener('change',async()=>{
    const file=E.csv.files?.[0];if(!file)return;
    try{
      if(!file.name.toLowerCase().endsWith('.csv'))throw Error('Export the specific worksheet as .csv first.');
      if(file.size>8*1024*1024)throw Error('Local CSV exceeds the 8 MB limit.');
      const result=parseMatrixCsv(await file.text());
      setRecords(result.records,true);
    }catch(err){E.status.textContent='Import not applied: '+err.message;E.csv.value='';}
  });
  E.images.addEventListener('change',()=>{
    let count=0;
    for(const file of Array.from(E.images.files||[])){
      const type=file.type.toLowerCase();
      if(!/^(image\/png|image\/jpeg|image\/webp|image\/svg\+xml)$/.test(type))continue;
      const name=file.name.toLowerCase().trim();
      if(model.photos.has(name))URL.revokeObjectURL(model.photos.get(name));
      model.photos.set(name,URL.createObjectURL(file));count++;
    }
    model.photoCount+=count;
    E.status.textContent=count+' local images linked by filename. These images are not uploaded; ensure reproduction permission.';
    renderStage();renderObjectPanel();
  });
  E.search.addEventListener('input',()=>{model.search=E.search.value;renderObjectOptions();renderStage();renderInspector();});
  E.select.addEventListener('change',()=>changeSeed(E.select.value));
  for(const btn of document.querySelectorAll('[data-detail]'))btn.addEventListener('click',()=>switchTab(btn.dataset.detail));
  E.tags.addEventListener('change',()=>{model.showTags=E.tags.checked;renderStage();});
  $('zoom-in').addEventListener('click',()=>scaleBy(1.17));
  $('zoom-out').addEventListener('click',()=>scaleBy(1/1.17));
  $('reset-view').addEventListener('click',()=>{model.panX=0;model.panY=0;model.scale=1;renderStage();});
  let drag=null;
  E.graph.addEventListener('pointerdown',e=>{
    if(e.target.closest('.object-node,.edge-hit,.edge-chip'))return;
    drag={x:e.clientX,y:e.clientY,panX:model.panX,panY:model.panY};
    E.graph.setPointerCapture(e.pointerId);
  });
  E.graph.addEventListener('pointermove',e=>{
    if(!drag)return;
    const rect=E.graph.getBoundingClientRect();
    model.panX=drag.panX+(e.clientX-drag.x)*1080/rect.width;
    model.panY=drag.panY+(e.clientY-drag.y)*650/rect.height;
    const g=$('stage-world');if(g)g.setAttribute('transform','translate('+model.panX+' '+model.panY+') translate(540 325) scale('+model.scale+') translate(-540 -325)');
  });
  E.graph.addEventListener('pointerup',()=>{drag=null;});
  E.graph.addEventListener('pointercancel',()=>{drag=null;});
  E.graph.addEventListener('wheel',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    e.preventDefault();scaleBy(e.deltaY<0?1.06:1/1.06);
  },{passive:false});
  E.play.addEventListener('click',playSpeech);
  E.stop.addEventListener('click',stopSpeech);
  E.ask.addEventListener('click',()=>{E.answer.textContent=replyToQuestion(E.question.value,record(),card());});
  E.present.addEventListener('click',async()=>{
    if(document.fullscreenElement){await document.exitFullscreen();E.present.textContent='Present full-screen';}
    else if(document.documentElement.requestFullscreen){try{await document.documentElement.requestFullscreen();E.present.textContent='Exit full-screen';}catch{E.present.textContent='Full-screen unavailable';}}
  });
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)E.present.textContent='Present full-screen';});
  renderPersonaRail();renderObjectOptions();renderStage();switchTab('connection');
}
initialize();
