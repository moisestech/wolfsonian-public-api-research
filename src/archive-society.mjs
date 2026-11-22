import { buildDiscoveryIndex, recommendNeighbors, PERSONAS } from './discovery-graph.mjs';
import { sceneForConfirmedEdge } from './curated-edge-scenes.mjs';
import { sceneVoiceBrief, listenerReflection } from './conversation-voices.mjs';

export const WORLD = Object.freeze({ width: 2000, height: 1125 });
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
// Visitor-feedback preview: expose all eleven named, artist-authored perspectives.
// 'open' is a broad search mode, not a speaking persona or Cloudinary icon.
export const LENSES = PERSONAS.filter(p => p.id !== 'open');
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
  'Commemoration':'M16 6a10 10 0 1 0 .1 0zM16 10v7l5 3',
  Machines:'M9 16a5 5 0 1 0 .1 0zM19 20a4 4 0 1 0 .1 0zM14 16h5',
  Hands:'M11 20v-6a2 2 0 0 1 4 0v6M15 14V8a2 2 0 0 1 4 0v10M19 12V9a2 2 0 0 1 4 0v11M12 20c0 4 2 6 6 6s5-2 5-6',
  Workers:'M16 8a3 3 0 1 0 .1 0zM10 26l4-8h4l4 8M12 18h8',
  Factories:'M4 26V16l6-4v4l6-4v4l6-4v14Z',
  Water:'M4 14c3 3 5 3 8 0s5-3 8 0 5 3 8 0M4 20c3 3 5 3 8 0s5-3 8 0 5 3 8 0',
  Trees:'M16 26v-6M8 20 16 8l8 12Z',
  Flags:'M8 6v20M8 6h14l-3 4 3 4H8',
  Women:'M16 9a3 3 0 1 0 .1 0zM10 26c1-6 4-8 6-8s5 2 6 8',
  'Political symbols':'M16 6l3 7h7l-5 4 2 7-7-4-7 4 2-7-5-4h7Z',
  'Mythological figures':'M8 22c4-10 12-10 16 0M12 14h8',
  'War / Military':'M6 22 16 8l10 14H6zM16 14v8'
};
const MARK_HUE={
  Machines:220,Technology:188,Water:158,Trees:128,Labor:96,Factories:64,Flags:32,
  Women:350,'Political symbols':318,'Mythological figures':278,'War / Military':248
};
const ABSTRACT_MARKS=[
  'M16 6a10 10 0 1 0 .1 0z',
  'M16 6 26 16 16 26 6 16Z',
  'M8 10h16M8 16h16M8 22h16',
  'M6 22 16 8l10 14Z',
  'M8 16c0-6 4-10 8-10s8 4 8 10-4 8-8 8',
  'M10 8h12v6H10zM8 18h16v6H8z'
];
function markHash(label){
  let hash=2166136261;
  for(const char of String(label))hash=Math.imul(hash^char.charCodeAt(0),16777619);
  return hash>>>0;
}
function markSvg(path,hue){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="hsl(${hue},48%,62%)"/><path d="${path}" fill="none" stroke="hsl(${hue},40%,18%)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function categoryIconUrl(label){
  const d=categoryMarks[label]||'M8 8h16v16H8Z';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#dce6de"/><path d="${d}" fill="none" stroke="#326d68" stroke-width="2" stroke-linejoin="round"/></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function objectMarkUrl(record){
  const tags=record?.tags||[];
  const labels=[
    ...tags.filter(tag=>tag.family==='motif').map(tag=>tag.value),
    ...tags.filter(tag=>tag.family==='theme').map(tag=>tag.value)
  ];
  const label=labels.find(value=>categoryMarks[value]);
  if(label){
    const hue=Object.prototype.hasOwnProperty.call(MARK_HUE,label)?MARK_HUE[label]:markHash(label)%360;
    return markSvg(categoryMarks[label],hue);
  }
  const seed=String(record?.accession||record?.title||'object');
  const hash=markHash(seed);
  return markSvg(ABSTRACT_MARKS[hash%ABSTRACT_MARKS.length],hash%360);
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
const spokenTitle=value=>{
  const text=clean(value);
  const english=text.match(/\[([^\]]{3,90})\]/);
  return english?clean(english[1]):text;
};
export function conversationFor(source,target,edge,lensId='family',snapshots={}) {
  if(!source||!target||!edge?.reasons?.length) throw new Error('Select a metadata edge first.');
  const voiceBrief=sceneVoiceBrief(source,target,lensId);

  const curated=sceneForConfirmedEdge(source.accession,target.accession,edge.reasons);
  if(curated) {
    return {
      id:edge.id+'::'+lensId,
      sceneId:curated.id,
      aiAssisted:Boolean(curated.languageRevision)||curated.turns[0].kind==='AI_ASSISTED_INTERPRETATION',
      languageRevision:curated.languageRevision||null,
      authored:true,
      voiceBrief,
      listenerReflection:listenerReflection(source,target,lensId,curated.arc),
      mode:'CURATED_EDGE_SCENE',
      editorialStatus:curated.status,
      edgeMode:curated.mode,
      scriptBasis:{family:curated.requires.family,value:curated.requires.value},
      dramaticArc:curated.arc,
      nextPrompt:curated.next,
      source:source.accession,target:target.accession,lens:lensId,
      classification:'shared_staff_metadata',historicalRelationshipEstablished:false,
      evidence:edge.reasons.map(reason=>({...reason})),
      turns:curated.turns.map(turn=>({
        role:turn.role,
        speaker:turn.role==='archivist'?'Archivist · fictional reading protocol':
          turn.role==='objectA'?source.title:target.title,
        text:turn.text,
        citations:[],
        kind:turn.kind
      })),
      resourceLayer:'metadata_tag_only',
      limits:'Scripted hypothetical exchange. Shared metadata is not a documented relationship. '+curated.editorialNote
    };
  }
  const lens=LENSES.find(l=>l.id===lensId)||LENSES[0], reason=edge.reasons[0];
  const term=clean(reason.value), a=spokenTitle(source.title), b=spokenTitle(target.title);
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
  const hasTheme=edge.reasons.some(r=>r.family==='theme');
  const hasMotif=edge.reasons.some(r=>r.family==='motif');
  const onlyMotif=hasMotif&&!hasTheme;
  const edgeMode=onlyMotif?'QUESTION_THIS_LINK':hasTheme&&hasMotif?'COMPARE_MULTIPLE_LABELS':'THEMATIC_COMPARISON';
  // Five short beats instead of three consecutive mini-lectures:
  // an observation, objection, repair, evidence check, and visitor-facing question.
  // This is generated editorial theatre, never an object memory or a source fact.
  const aLine=onlyMotif
    ? 'The index places us under the motif “'+term+'”. Is that a good enough reason to put us together?'
    : 'We both have the category “'+term+'” in our records. That sounds like a connection, but what does it really explain?';
  const bLine=onlyMotif
    ? 'Maybe not. My title is “'+b+'”. One recurring motif could mean quite different things to different viewers.'
    : 'Hold on. My title is “'+b+'”. If we share a category, does that mean we are making the same argument?';
  const replyLine=onlyMotif
    ? 'Fair point. We are comparing labels before inspecting the objects. What would you want to look at first?'
    : 'No, I suppose not. '+lens.question+' The title “'+a+'” leaves that question open.';
  const archivistLine=onlyMotif
    ? 'This is a motif-only suggestion based on staff metadata. Nothing here establishes a shared maker, audience, event, or intention.'
    : 'Both entries have “'+term+'” in the source index. That is a research path, not evidence of contact, influence, or a common historical purpose.';
  const lastLine=onlyMotif
    ? 'Then leave the line as a question, not an answer. What would justify keeping it?'
    : 'All right. What evidence would persuade you that our comparison reveals something beyond a shared category?';
  const nextPrompt=onlyMotif?'Keep this as a question, investigate, or withdraw the link?':
    'Which additional source would change the interpretation of this pair?';
  return {
    id:edge.id+'::'+lens.id,authored:true,mode:'scripted_interpretation',voiceBrief,
    listenerReflection:listenerReflection(source,target,lens.id),
    editorialStatus:'AUTOMATIC_SOURCE_BOUNDED_FALLBACK',edgeMode,
    dramaticArc:onlyMotif?'Can this connection survive scrutiny?':'What do two differently titled records make visible?',
    nextPrompt,
    source:source.accession,target:target.accession,lens:lens.id,
    classification:'shared_staff_metadata',historicalRelationshipEstablished:false,
    evidence:edge.reasons.map(r=>({...r})),
    turns:[
      {role:'objectA',speaker:a,text:aPrefix+aLine,citations:aFact?[aFact]:[],kind:'ARTIST_AUTHORED_INTERPRETATION'},
      {role:'objectB',speaker:b,text:bPrefix+bLine,citations:bFact?[bFact]:[],kind:'ARTIST_AUTHORED_INTERPRETATION'},
      {role:'objectA',speaker:a,text:replyLine,citations:[],kind:'ARTIST_AUTHORED_INTERPRETATION'},
      {role:'archivist',speaker:'Archivist · fictional reading protocol',text:archivistLine,citations:[],kind:'SOURCE_BOUNDARY'},
      {role:'objectB',speaker:b,text:lastLine,citations:[],kind:'ARTIST_AUTHORED_QUESTION'}
    ],
    resourceLayer:aFact||bFact?'catalog_field_quotes':'no_matched_catalog_field',
    limits:lens.limits+' This is a comparative prompt, not proof that the histories intersected.'
  };
}
export function deviceCast(role, voices = []) {
  const local = voices.filter(voice => voice.localService);
  const english = local.filter(voice => /en/i.test(voice.lang || ''));
  const pool = english.length ? english : local;
  const pick = index => pool[Math.min(index, Math.max(0, pool.length - 1))] || null;
  if (role === 'objectB') return { voice: pick(1), rate: 1.05, pitch: 1.16 };
  if (role === 'archivist') return { voice: pick(pool.length > 2 ? 2 : 0), rate: 0.86, pitch: 0.94 };
  return { voice: pick(0), rate: 0.9, pitch: 0.86 };
}
const base=name=>clean(name).replace(/\\/g,'/').split('/').pop().toLowerCase();
export function photoKeys(record) {
  return [...new Set([base(record.imageFilename),base(record.accession)].filter(Boolean).flatMap(v=>[v,v.replace(/\.[a-z]{2,5}$/i,'')]))];
}
export function imageKeys(filename) {
  const value=base(filename);return [value,value.replace(/\.(png|jpe?g|webp)$/i,'')];
}
