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
export function inventedRecords() {
  return sample.map(([id,title,themes,motifs],i) => ({
    accession:'FICTION-'+String(i+1).padStart(2,'0'), title, source:'invented',
    creator:'Invented demonstration record', date:'', objectType:id, imageFilename:'',
    interpretiveText:'Artist-authored example. Not a Wolfsonian collection object.',
    tags:[
      ...themes.map((value,j)=>({id:'theme:'+value.toLowerCase(),family:'theme',value,sourceColumns:['Thematic Category '+(j+1)]})),
      ...motifs.map((value,j)=>({id:'motif:'+value.toLowerCase(),family:'motif',value,sourceColumns:['Symbols/Motifs '+(j+1)]}))
    ]
  }));
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
export function societyView(records, accession, lens='family', {atlas=false, theme='', query=''}={}) {
  const index=buildDiscoveryIndex(records), seed=index.objects.get(accession);
  if(!seed) return {nodes:[],edges:[]};
  const matches=r=>(!theme||(r.tags||[]).some(t=>t.family==='theme'&&t.value===theme)) &&
    (!query||(r.title+' '+r.accession).toLowerCase().includes(query.toLowerCase()));
  const neighbors=recommendNeighbors(index,accession,lens,12).filter(n=>matches(n.record)).slice(0,6);
  let chosen=[seed,...neighbors.map(n=>n.record)];
  if(atlas) {
    const rest=records.filter(r=>r.accession!==accession&&matches(r)).sort((a,b)=>district(a).localeCompare(district(b))||a.accession.localeCompare(b.accession));
    chosen=[seed,...rest].slice(0,24);
  }
  const slots=[[1000,535],[440,355],[1510,350],[690,185],[1280,160],[610,875],[1460,840]];
  const nodes=chosen.map((record,i)=>({
    record, district:district(record),
    x:atlas?190+(i%6)*322:slots[i][0],
    y:atlas?165+Math.floor(i/6)*255:slots[i][1]
  }));
  const visible=new Set(nodes.map(n=>n.record.accession));
  const edges=neighbors.filter(n=>visible.has(n.record.accession)).map(n=>({
    id:accession+'::'+n.record.accession, source:accession,target:n.record.accession,
    reasons:n.reasons, classification:'shared_staff_metadata',
    historicalRelationshipEstablished:false
  }));
  return {nodes,edges};
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
