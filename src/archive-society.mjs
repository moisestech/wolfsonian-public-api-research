import { buildDiscoveryIndex, recommendNeighbors, PERSONAS } from './discovery-graph.mjs';

export const WORLD = Object.freeze({ width: 2000, height: 1125 });
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export const LENSES = PERSONAS.filter(p => ['family','worker','archivist','futurist','tourist'].includes(p.id));
const sample = [
  ['radio','Imagined domestic radio',['Domestic life','Technology','Advertising'],['Machines','Hands']],
  ['stove','Imagined kitchen appliance',['Domestic life','Industry','Labor'],['Machines','Workers']],
  ['repair','Imagined repair manual',['Technology','Labor','Safety / Health'],['Hands','Machines']],
  ['broadcast','Imagined broadcasting poster',['Technology','Advertising','Leisure / Entertainment'],['Machines','Electric bolts']],
  ['factory','Imagined assembly workshop',['Industry','Labor','Technology'],['Workers','Factories']],
  ['home','Imagined electrical home',['Domestic life','Electricity','Advertising'],['Light bulbs','Hands']],
  ['fair','Imagined exposition pavilion',['Expositions and fairs','Technology','Advertising'],['Buildings','Machines']],
  ['rail','Imagined express railway',['Travel / Transportation','Advertising','Technology'],['Speed','Trains']],
  ['city','Imagined city plan',['Cities','Architecture','Technology'],['Buildings','Maps / Globes']],
  ['care','Imagined public safety notice',['Safety / Health','Labor','Domestic life'],['Hands','Workers']],
  ['market','Imagined department-store display',['Advertising','Trade / Commerce','Domestic life'],['Machines','Signs']],
  ['archive','Imagined collecting guide',['Commemoration','Trade / Commerce','Technology'],['Numbers','Machines']]
];
const qualifiers=['evening','workshop','poster','manual','window','counter','platform','gallery','notice','cabinet'];
function inventedRecord(accession,title,objectType,themes,motifs){
  return {
    accession, title, source:'invented',
    creator:'Invented demonstration record', date:'', objectType, imageFilename:'',
    interpretiveText:'Artist-authored example. Not a Wolfsonian collection object.',
    tags:[
      ...themes.map((value,j)=>({id:'theme:'+value.toLowerCase(),family:'theme',value,sourceColumns:['Thematic Category '+(j+1)]})),
      ...motifs.map((value,j)=>({id:'motif:'+value.toLowerCase(),family:'motif',value,sourceColumns:['Symbols/Motifs '+(j+1)]}))
    ]
  };
}
export function inventedRecords() {
  const core=sample.map(([id,title,themes,motifs],i)=>inventedRecord('FICTION-'+String(i+1).padStart(2,'0'),title,id,themes,motifs));
  const extra=[];
  for(let n=core.length;core.length+extra.length<100;n++){
    const [id,title,themes,motifs]=sample[n%sample.length];
    const qualifier=qualifiers[n%qualifiers.length];
    extra.push(inventedRecord(
      'FICTION-'+String(n+1).padStart(2,'0'),
      'Imagined '+qualifier+' reading of '+title.replace(/^Imagined /,''),
      id,[themes[n%themes.length]],[motifs[(n+1)%motifs.length]]
    ));
  }
  return [...core,...extra];
}
const categoryMarks={
  'Domestic life':'M4 18 16 6 28 18V28H4Z',
  'Technology':'M8 24 18 6 16 16h8L12 30l2-10H8Z',
  'Advertising':'M6 14h8v12H6zM16 12c6 0 8-4 8-8v20c0-4-2-8-8-8Z',
  'Industry':'M6 26 14 8 22 26M22 8 14 26',
  'Labor':'M8 22h16M10 22v-6h12v6M12 10h8v4h-8Z',
  'Safety / Health':'M14 6h4v8h8v4h-8v8h-4v-8H6v-4h8Z',
  'Leisure / Entertainment':'M6 24 16 8 26 24H6Z',
  'Electricity':'M14 4 8 18h8l-2 10 10-16h-8Z',
  'Expositions and fairs':'M4 14 16 4 28 14M8 14v12h16V14',
  'Travel / Transportation':'M6 12h20v12H6zM10 12V8h12v4',
  'Cities':'M6 26V12h6v14M14 26V6h8v20M24 26V16h4v10',
  'Architecture':'M4 26V14h24v12M10 26v-6h4v6M18 26v-6h4v6',
  'Trade / Commerce':'M6 8h20v16H6zM6 14h20M12 18h8',
  'Commemoration':'M16 6a10 10 0 1 0 .1 0zM16 10v7l5 3'
};
export function categoryIconUrl(label){
  const d=categoryMarks[label]||'M8 8h16v16H8Z';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#dce6de"/><path d="${d}" fill="none" stroke="#326d68" stroke-width="2" stroke-linejoin="round"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function district(record) {
  const themes=(record.tags||[]).filter(t=>t.family==='theme').map(t=>t.value);
  for (const [name,terms] of [
    ['Domestic life',['Domestic life']],['Work & care',['Labor','Industry']],
    ['Public persuasion',['Advertising','Propaganda','Politics']],
    ['Movement',['Travel / Transportation','Expositions and fairs']],
    ['Built worlds',['Cities','Architecture']],['Technology',['Technology','Electricity']]
  ]) if(terms.some(t=>themes.includes(t))) return name;
  return 'Other readings';
}
function layoutAtlas(chosen){
  const groups=new Map();
  for(const record of chosen){
    const name=district(record);
    const list=groups.get(name)||[];
    list.push(record);
    groups.set(name,list);
  }
  const names=[...groups.keys()].sort((a,b)=>a.localeCompare(b));
  const nodes=[];
  names.forEach((name,di)=>{
    const items=groups.get(name).sort((a,b)=>a.accession.localeCompare(b.accession));
    const col=di%3,row=Math.floor(di/3),ox=360+col*2400,oy=640+row*1800;
    const inner=Math.max(1,Math.ceil(Math.sqrt(items.length)));
    items.forEach((record,i)=>nodes.push({
      record,district:name,
      x:ox+(i%inner)*380+120,
      y:oy+Math.floor(i/inner)*300+140
    }));
  });
  return nodes;
}
export function fieldLandmarks(nodes){
  if(!nodes.length)return {personas:[],categories:[]};
  const minX=Math.min(...nodes.map(n=>n.x)),maxX=Math.max(...nodes.map(n=>n.x));
  const personas=LENSES.map((lens,i)=>({
    id:'persona:'+lens.id,kind:'persona',lens:lens.id,label:lens.label,
    x:minX+((maxX-minX)*i)/Math.max(1,LENSES.length-1),y:150
  }));
  const grouped=new Map();
  for(const node of nodes){
    for(const tag of (node.record.tags||[]).filter(t=>t.family==='theme')){
      const list=grouped.get(tag.value)||[];
      list.push(node);
      grouped.set(tag.value,list);
    }
  }
  const categories=[...grouped.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([label,members],index)=>{
    const x=members.reduce((sum,node)=>sum+node.x,0)/members.length;
    const y=Math.min(...members.map(node=>node.y))-90-(index%3)*18;
    return {id:'category:'+label,kind:'category',label,x,y};
  });
  return {personas,categories};
}
export function societyView(records, accession, lens='family', {atlas=false, theme='', query=''}={}) {
  const index=buildDiscoveryIndex(records), seed=index.objects.get(accession);
  if(!seed) return {nodes:[],edges:[]};
  const matches=r=>(!theme||(r.tags||[]).some(t=>t.family==='theme'&&t.value===theme)) &&
    (!query||(r.title+' '+r.accession).toLowerCase().includes(query.toLowerCase()));
  const ranked=recommendNeighbors(index,accession,lens,36).filter(n=>matches(n.record));
  const picked=[],seenTypes=new Set([seed.objectType]);
  for(const neighbor of ranked){
    const type=neighbor.record.objectType||neighbor.record.accession;
    if(seenTypes.has(type))continue;
    seenTypes.add(type);picked.push(neighbor);
    if(picked.length===6)break;
  }
  for(const neighbor of ranked){if(picked.length===6)break;if(!picked.includes(neighbor))picked.push(neighbor);}
  const neighbors=picked;
  let chosen=[seed,...neighbors.map(n=>n.record)];
  if(atlas) {
    const rest=records.filter(r=>r.accession!==accession&&matches(r)).sort((a,b)=>district(a).localeCompare(district(b))||a.accession.localeCompare(b.accession));
    chosen=[seed,...rest].slice(0,100);
  }
  const slots=[[1000,535],[440,355],[1510,350],[690,185],[1280,160],[610,875],[1460,840]];
  const nodes=atlas?layoutAtlas(chosen):chosen.map((record,i)=>({
    record, district:district(record), x:slots[i][0], y:slots[i][1]
  }));
  const visible=new Set(nodes.map(n=>n.record.accession));
  const edges=neighbors.filter(n=>visible.has(n.record.accession)).map(n=>({
    id:accession+'::'+n.record.accession, source:accession,target:n.record.accession,
    reasons:n.reasons, classification:'shared_staff_metadata',
    historicalRelationshipEstablished:false
  }));
  return {nodes,edges,landmarks:atlas?fieldLandmarks(nodes):{personas:[],categories:[]}};
}
export function conversationFor(source,target,edge,lensId='family',snapshots={}) {
  if(!source||!target||!edge?.reasons?.length) throw new Error('Select a metadata edge first.');
  const lens=LENSES.find(l=>l.id===lensId)||LENSES[0], reason=edge.reasons[0];
  const term=clean(reason.value), a=clean(source.title), b=clean(target.title);
  const fact=snapshot=>{
    if(snapshot?.status!=='EXACT_PRIMARY_ACCESSION'||snapshot.matches?.length!==1)return null;
    const match=snapshot.matches[0];if(match.identityConflict)return null;
    const field=match.fields.date;
    if(field?.status!=='PRESENT'||!['string','number'].includes(typeof field.value))return null;
    return {quote:clean(field.value).slice(0,120),pointer:field.pointer,sourceUrl:snapshot.sourceUrl||null,retrievedAt:snapshot.retrievedAt};
  };
  const aFact=fact(snapshots.source),bFact=fact(snapshots.target);
  const aPrefix=aFact?'My matched Lakehouse record has a Date field reading “'+aFact.quote+'”. ':'';
  const bPrefix=bFact?'My matched Lakehouse record has a Date field reading “'+bFact.quote+'”. ':'';
  return {
    id:edge.id+'::'+lens.id, authored:true, mode:'scripted_interpretation',
    source:source.accession,target:target.accession,lens:lens.id,
    classification:'shared_staff_metadata',historicalRelationshipEstablished:false,
    evidence:edge.reasons.map(r=>({...r})),
    turns:[
      {role:'objectA',speaker:a,text:aPrefix+'Our records meet at the category “'+term+'”. What does that word invite a visitor to notice?',citations:aFact?[aFact]:[]},
      {role:'objectB',speaker:b,text:bPrefix+'A shared label gives us a place to start, but does not show that our histories crossed. '+lens.question,citations:bFact?[bFact]:[]},
      {role:'archivist',speaker:'Archivist · fictional reading protocol',text:'The connection comes from '+reason.sourceColumns.join(' / ')+' and '+reason.targetColumns.join(' / ')+'. Which document or human account could support, complicate or reject this reading?'}
    ],
    resourceLayer:aFact||bFact?'catalog_field_quotes':'no_matched_catalog_field',
    limits:lens.limits
  };
}
const base=name=>clean(name).replace(/\\/g,'/').split('/').pop().toLowerCase();
export function photoKeys(record) {
  return [...new Set([base(record.imageFilename),base(record.accession)].filter(Boolean).flatMap(v=>[v,v.replace(/\.[a-z]{2,5}$/i,'')]))];
}
export function imageKeys(filename) {
  const value=base(filename);return [value,value.replace(/\.(png|jpe?g|webp)$/i,'')];
}
