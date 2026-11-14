import { buildDiscoveryIndex, parseMatrixCsv, recommendNeighbors, PERSONAS, FAMILIES } from '../../src/discovery-graph.mjs';

// These objects are invented to demonstrate the interface. They are NOT Wolfsonian records.
const examples = [
  ['EXAMPLE-A', 'Imagined express railway poster', ['Travel / Transportation','Technology','Advertising'], ['Trains','Speed'], 'Montage', 'Germany'],
  ['EXAMPLE-B', 'Imagined coastal holiday poster', ['Travel / Transportation','Leisure / Entertainment','Advertising'], ['Ships','Water'], 'Silhouette', 'France'],
  ['EXAMPLE-C', 'Imagined electrical safety notice', ['Safety / Health','Technology','Domestic life'], ['Hands','Electric bolts'], 'Symbolism', 'France'],
  ['EXAMPLE-D', 'Imagined workers union appeal', ['Labor','Industry','Politics'], ['Workers','Hands'], 'Monumental perspective', 'United Kingdom'],
  ['EXAMPLE-E', 'Imagined international air show poster', ['Travel / Transportation','Technology','Expositions and fairs'], ['Aircraft','Speed'], 'Montage', 'Italy'],
  ['EXAMPLE-F', 'Imagined futuristic housing exhibition', ['Architecture','Cities','Technology'], ['Buildings','Machines'], 'Art Deco', 'United States'],
  ['EXAMPLE-G', 'Imagined household appliance advertisement', ['Domestic life','Advertising','Technology'], ['Hands','Machines'], 'Art Deco', 'United States'],
  ['EXAMPLE-H', 'Imagined civic remembrance broadside', ['Commemoration','War / Military','Politics'], ['National symbols','Monuments'], 'Symbolism', 'France'],
  ['EXAMPLE-I', 'Imagined world travel map', ['Travel / Transportation','Luxury','Advertising'], ['Maps / Globes','Aircraft'], 'Information graphics', 'United States'],
  ['EXAMPLE-J', 'Imagined building workers poster', ['Labor','Architecture','Industry'], ['Workers','Buildings'], 'Monumental perspective', 'Netherlands'],
  ['EXAMPLE-K', 'Imagined public health advertisement', ['Safety / Health','Advertising','Domestic life'], ['Children','Hands'], 'Silhouette', 'United States'],
  ['EXAMPLE-L', 'Imagined industry exhibition', ['Expositions and fairs','Industry','Technology'], ['Factories','Gears'], 'Art Deco', 'Italy']
];
const tag=(family,value,column)=>({
  id:family+':'+value.toLowerCase().replace(/\s+/g,' ').trim(),
  family,value,sourceColumns:[column]
});
const sampleRecords=examples.map(([accession,title,themes,motifs,style,geography])=>({
  accession,title, creator:'Fictional',date:'not historical',objectType:'imagined graphic',
  interpretiveText:'Demonstration-only object invented for this interface. No museum record or image.',
  imageFilename:'',
  tags:[
    ...themes.map((value,i)=>tag('theme',value,'Thematic Category '+(i+1))),
    ...motifs.map((value,i)=>tag('motif',value,'Symbols/Motifs '+(i+1))),
    tag('style',style,'Visual Strategy/Style'),
    tag('geography',geography,'Geography')
  ]
}));
const $=id=>document.getElementById(id);
const elements={
  file:$('csv-import'), reset:$('restore-demo'), dataStatus:$('data-status'),
  search:$('object-search'), select:$('object-select'), lens:$('lens-select'),
  lensCard:$('lens-card'), stats:$('graph-count'), network:$('network'),
  detail:$('connection-details'), neighbors:$('neighbors')
};
const model={records:sampleRecords,index:buildDiscoveryIndex(sampleRecords),seed:sampleRecords[0].accession,lens:'open',selected:null,real:false,search:''};
const NS='http://www.w3.org/2000/svg';
const svg=(tag,attrs={},text)=>{
  const element=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
  if(text!==undefined)element.textContent=text;
  return element;
};
const html=(tag,text,className)=>{
  const element=document.createElement(tag);
  if(text!==undefined)element.textContent=text;
  if(className)element.className=className;
  return element;
};
const crop=(value,n=32)=>value.length>n?value.slice(0,n-1)+'…':value;

function setRecords(records,real){
  model.records=records;model.index=buildDiscoveryIndex(records);
  model.seed=records[0].accession;model.selected=null;model.real=real;model.search='';
  elements.search.value='';
  elements.dataStatus.textContent=real
    ? `Loaded ${records.length} object records from a local CSV. No upload was made.`
    : 'Using invented examples, not museum records.';
  refreshObjects();
  render();
}
function refreshObjects(){
  const rows=[...model.records].sort((a,b)=>a.title.localeCompare(b.title));
  const query=model.search.toLowerCase().trim();
  const filtered=rows.filter(r=>!query || (r.title+' '+r.accession).toLowerCase().includes(query));
  elements.select.replaceChildren();
  for(const record of filtered){
    const option=html('option',crop(record.title,48)+' — '+record.accession);
    option.value=record.accession;
    elements.select.append(option);
  }
  if(!filtered.some(r=>r.accession===model.seed) && filtered[0]) model.seed=filtered[0].accession;
  if(filtered.length)elements.select.value=model.seed;
  elements.select.disabled=filtered.length===0;
}
function neighbors(){return recommendNeighbors(model.index,model.seed,model.lens,6);}
function source(){return model.index.objects.get(model.seed);}
function makeNode(x,y,label,id,central=false,focused=false){
  const g=svg('g',{class:'node'+(central?' node--center':'')+(focused?' node--focused':''),role:'button',tabindex:'0','aria-label':`Explore ${label}`});
  g.append(svg('circle',{cx:x,cy:y,r:central?46:34}));
  const words=label.split(/\s+/);
  const lines=[];let current='';
  for(const word of words){
    if((current+' '+word).trim().length>22 && current){lines.push(current);current=word;}
    else current=(current+' '+word).trim();
  }
  if(current)lines.push(current);
  const shown=lines.slice(0,2).map((line,i)=>i===1&&lines.length>2?crop(line,22):line);
  shown.forEach((line,i)=>g.append(svg('text',{x,y:y+(central?63:49)+i*15,'text-anchor':'middle','font-size':central?15:13},line)));
  const navigate=()=>{
    model.seed=id;model.selected=null;model.search='';elements.search.value='';
    refreshObjects();render();
  };
  g.addEventListener('click',navigate);
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate();}});
  return g;
}
function inspect(target){
  model.selected=target;
  renderDetails();
  renderNeighbors();
  renderGraph(neighbors());
}
function renderGraph(matches){
  const graph=elements.network;
  graph.replaceChildren();
  const center={x:400,y:270};
  const selected=source();
  if(!selected)return;
  const points=matches.map((match,i)=>({
    ...match,x:center.x+Math.cos((i/matches.length)*Math.PI*2-Math.PI/2)*270,
    y:center.y+Math.sin((i/matches.length)*Math.PI*2-Math.PI/2)*166
  }));
  for(const point of points){
    const top=point.reasons[0];
    const line=svg('path',{
      d:`M ${center.x} ${center.y} Q ${(center.x+point.x)/2+10} ${(center.y+point.y)/2-8} ${point.x} ${point.y}`,
      class:'connection connection--'+(top?.family||'theme')+(model.selected===point.record.accession?' is-selected':''),
      role:'button',tabindex:'0',
      'aria-label':`Inspect connection to ${point.record.title}`
    });
    const examine=()=>inspect(point.record.accession);
    line.addEventListener('click',examine);
    line.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();examine();}});
    line.append(svg('title',{},`Explore shared metadata with ${point.record.title}`));
    graph.append(line);
  }
  for(const point of points)graph.append(makeNode(point.x,point.y,point.record.title,point.record.accession,false,model.selected===point.record.accession));
  graph.append(makeNode(center.x,center.y,selected.title,selected.accession,true,false));
}
function renderNeighbors(){
  elements.neighbors.replaceChildren();
  for(const item of neighbors()){
    const li=html('li');
    const button=html('button',crop(item.record.title,57),'neighbor');
    button.type='button';
    button.setAttribute('aria-pressed',String(model.selected===item.record.accession));
    button.addEventListener('click',()=>inspect(item.record.accession));
    li.append(button,html('small',item.reasons.slice(0,2).map(r=>r.value).join(' + ')));
    elements.neighbors.append(li);
  }
}
function renderDetails(){
  const box=elements.detail;
  box.replaceChildren();
  const sourceRecord=source();
  if(!sourceRecord)return;
  const match=neighbors().find(n=>n.record.accession===model.selected);
  if(!match){
    box.append(html('p','Select a line or a suggested path. Every suggestion will show the exact category or motif that generated it.'));
    box.append(html('p',`Starting from: ${sourceRecord.title} — ${sourceRecord.accession}`,'source-note'));
    return;
  }
  box.append(html('p','STAFF-ASSIGNED TAG OVERLAP · NOT A HISTORICAL LINK','status'));
  box.append(html('h3',match.record.title));
  box.append(html('p',`${sourceRecord.accession} → ${match.record.accession}`,'source-note'));
  const list=html('dl');
  for(const reason of match.reasons){
    const dt=html('dt',`${FAMILIES[reason.family].label}: ${reason.value}`);
    const dd=html('dd',`Source: ${reason.sourceColumns.join(' / ')} · Neighbor: ${reason.targetColumns.join(' / ')} · found on ${reason.candidateCount} local record(s)`);
    list.append(dt,dd);
  }
  box.append(list);
  box.append(html('p',`Lens ranking score: ${match.score} (for navigation only, not evidence confidence).`,'source-note'));
  box.append(html('p','Whether these objects share a maker, history, meaning, or direct influence has NOT been established by the overlap.','caution'));
  if(model.real && match.record.interpretiveText){
    const note=html('details');
    note.append(html('summary','View supplied interpretive text'));
    note.append(html('p',match.record.interpretiveText));
    box.append(note);
  }
}
function render(){
  const persona=PERSONAS.find(p=>p.id===model.lens);
  elements.lensCard.replaceChildren(
    html('strong',persona.question),
    html('p',`Artist-authored lens; prioritizes: ${Object.values(persona.focus).flat().join(', ')||'all shared metadata'}.`),
    html('p',`What it cannot establish: ${persona.limits}`,'caution')
  );
  const matches=neighbors();
  elements.stats.textContent=`${model.index.size} ${model.real?'local source records':'invented example records'} · ${matches.length} visible suggested paths · 0 proven historical links from tags alone`;
  renderGraph(matches);renderNeighbors();renderDetails();
}
for(const lens of PERSONAS){
  const option=html('option',lens.label);option.value=lens.id;
  elements.lens.append(option);
}
elements.lens.value=model.lens;
elements.lens.addEventListener('change',()=>{
  model.lens=elements.lens.value;model.selected=null;render();
});
elements.select.addEventListener('change',()=>{
  model.seed=elements.select.value;model.selected=null;render();
});
elements.search.addEventListener('input',()=>{
  model.search=elements.search.value;refreshObjects();model.selected=null;render();
});
elements.reset.addEventListener('click',()=>{
  elements.file.value='';setRecords(sampleRecords,false);
});
elements.file.addEventListener('change',async()=>{
  const file=elements.file.files?.[0];
  if(!file)return;
  try{
    if(!file.name.toLowerCase().endsWith('.csv'))throw new Error('Please export the matrix tab as CSV. Excel files are not read by this prototype.');
    if(file.size>8*1024*1024)throw new Error('File exceeds the 8 MB local-import limit.');
    const parsed=parseMatrixCsv(await file.text());
    setRecords(parsed.records,true);
  }catch(error){
    elements.dataStatus.textContent='Import not applied: '+error.message;
    elements.file.value='';
  }
});
setRecords(sampleRecords,false);
