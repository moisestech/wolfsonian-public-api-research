/**
 * Explainable metadata discovery for a private, locally supplied Object at Scale CSV.
 * No API calls, historical-link inference or automatic image downloads.
 * Source fields remain distinct from fictional artist-authored interpretive lenses.
 */
export const FAMILIES = Object.freeze({
  theme: { label: 'Thematic category', weight: 1.2 },
  motif: { label: 'Symbol / motif', weight: 1.6 },
  style: { label: 'Visual strategy / style', weight: 0.95 },
  geography: { label: 'Geography', weight: 0.25 }
});

export const PERSONAS = Object.freeze([
  { id:'open', label:'Open discovery', question:'Which unexpected metadata bridge can I follow?', focus:{}, limits:'This is a broad metadata search, not a historical relationship.' },
  { id:'family', label:'Family', question:'How did this change ordinary daily life?', focus:{theme:['Domestic life','Safety / Health','Leisure / Entertainment','Labor'],motif:['Children','Food and drink','Women','Hands']}, limits:'Domestic experience cannot be recovered from a poster alone.' },
  { id:'tourist', label:'Tourist', question:'What world does this image invite me to visit?', focus:{theme:['Travel / Transportation','Expositions and fairs','Cities','Leisure / Entertainment'],motif:['Trains','Ships','Aircraft','Maps / Globes','Buildings']}, limits:'Promotion is not evidence of how travel was experienced.' },
  { id:'connoisseur', label:'Art connoisseur', question:'What formal choices make this object distinctive?', focus:{style:['Art Deco','Art nouveau','Typography','Montage','Symbolism','Abstraction','Silhouette'],theme:['Architecture'],motif:['Logos','Buildings']}, limits:'Formal likeness is not proof of influence.' },
  { id:'worker', label:'Worker', question:'Who made, repaired, maintained or benefited from this?', focus:{theme:['Labor','Industry','Trade / Commerce','Domestic life'],motif:['Workers','Hands','Factories','Machines']}, limits:'A labor theme alone does not identify actual workers.' },
  { id:'futurist', label:'Futurist', question:'What future did this object promise?', focus:{theme:['Technology','Electricity','Travel / Transportation','Expositions and fairs'],motif:['Speed','Trains','Aircraft','Machines','Gears']}, limits:'A designed future is not evidence that it occurred.' },
  { id:'archivist', label:'Archivist', question:'Which part of this connection can we actually document?', focus:{theme:['Commemoration','Trade / Commerce'],motif:['Maps / Globes','Numbers','Signs']}, limits:'Metadata is a useful index, not a complete object biography.' },
  { id:'mourner', label:'Mourner', question:'Whose loss or absence does this representation overlook?', focus:{theme:['War / Military','Commemoration','Colonialism'],motif:['Soldiers','National symbols','Monuments']}, limits:'The existence of a symbol cannot establish a person's experience.' },
  { id:'propagandist', label:'Propagandist', question:'How does the image persuade its viewer?', focus:{theme:['Advertising','Propaganda','Politics','War / Military'],motif:['Flags','National symbols','Weapons','Logos']}, limits:'Analyzing persuasion does not endorse the message.' }
]);

const normalize = value => String(value ?? '').replace(/\s+/g,' ').trim();
const key = value => normalize(value).toLowerCase();
const named = (headers, label) => headers.findIndex(h => key(h) === key(label));
const titleHeader = h => key(h).startsWith('object display title');
const accessionPattern = /\d{2,4}\.\d+/;

export function parseCsv(csv) {
  const src = String(csv ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row=[], value='', quoted=false;
  for (let i=0;i<src.length;i++) {
    const ch=src[i];
    if (quoted) {
      if (ch==='"' && src[i+1]==='"') { value+='"'; i++; }
      else if (ch==='"') quoted=false;
      else value+=ch;
    } else if (ch==='"') quoted=true;
    else if (ch===',') { row.push(value); value=''; }
    else if (ch==='\n') { row.push(value); rows.push(row); row=[]; value=''; }
    else if (ch!=='\r') value+=ch;
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field.');
  if (row.length || value) {row.push(value); rows.push(row);}
  return rows;
}

export function parseMatrixCsv(csv) {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex(row => row.some(c => key(c)==='accession number') && row.some(titleHeader));
  if (headerIndex < 0) throw new Error('Could not find Object at Scale headers. Export the matrix tab as CSV first.');
  const headers = rows[headerIndex].map(normalize);
  const accessionCol = named(headers,'Accession Number');
  const titleCol = headers.findIndex(titleHeader);
  const imageCol = named(headers,'Image Filename');
  const descriptionCol = named(headers,'Interpretive Text');
  const creatorCol = headers.findIndex(h => key(h).startsWith('primary name'));
  const dateCol = named(headers,'Date Created');
  const typeCol = named(headers,'Object Type');
  const families = {
    geography: ['Geography'],
    style: ['Visual Strategy/Style'],
    theme: ['Thematic Category 1','Thematic Category 2','Thematic Category 3'],
    motif: ['Symbols/Motifs 1','Symbols/Motifs 2']
  };
  const slots = Object.fromEntries(Object.entries(families).map(([family,names]) => [
    family, names.map(name => ({name,index:named(headers,name)})).filter(slot => slot.index>=0)
  ]));
  if (!slots.theme.length || !slots.motif.length) throw new Error('Missing thematic or motif columns.');
  const seen = new Set();
  const records = [];
  const read=(row,i)=>i<0?'':normalize(row[i]);
  for (const row of rows.slice(headerIndex+1)) {
    const accession=read(row,accessionCol), title=read(row,titleCol);
    // Country/type/category separator rows are NOT object records.
    if (!accession || !title || !accessionPattern.test(accession) || seen.has(accession)) continue;
    seen.add(accession);
    const tags=[];
    const byKey=new Map();
    for (const [family,fields] of Object.entries(slots)) {
      for (const field of fields) {
        const value=read(row,field.index);
        if (!value) continue;
        const id=family+':'+key(value);
        if (byKey.has(id)) byKey.get(id).sourceColumns.push(field.name);
        else {
          const tag={id,family,value,sourceColumns:[field.name]};
          byKey.set(id,tag); tags.push(tag);
        }
      }
    }
    records.push({
      accession, title, creator:read(row,creatorCol), date:read(row,dateCol),
      objectType:read(row,typeCol), interpretiveText:read(row,descriptionCol),
      imageFilename:read(row,imageCol), tags
    });
  }
  if (!records.length) throw new Error('No object rows with recognizable accession numbers were found.');
  return {records, metadata:{source:'local-csv',headerRow:headerIndex+1,columnCount:headers.length}};
}

export function buildDiscoveryIndex(records) {
  const objects = new Map();
  const inverted = new Map();
  for (const record of records) {
    if (!record.accession || objects.has(record.accession)) throw new Error('Accession identifiers must be unique.');
    objects.set(record.accession, record);
    for (const tag of record.tags || []) {
      if (!FAMILIES[tag.family]) continue;
      if (!inverted.has(tag.id)) inverted.set(tag.id,new Set());
      inverted.get(tag.id).add(record.accession);
    }
  }
  return {objects,inverted,size:objects.size};
}

export function recommendNeighbors(index, accession, personaId='open', limit=6) {
  const source=index.objects.get(accession);
  if (!source) return [];
  const persona=PERSONAS.find(p=>p.id===personaId) || PERSONAS[0];
  const candidates=new Map();
  for (const tag of source.tags || []) {
    const peers=index.inverted.get(tag.id);
    if (!peers) continue;
    const rarity=1+Math.log((index.size+1)/(peers.size+1));
    const focus=(persona.focus[tag.family]||[]).some(t=>key(t)===key(tag.value)) ? 1.9 : 1;
    const weight=FAMILIES[tag.family]?.weight || 0;
    for (const otherId of peers) {
      if (otherId===accession) continue;
      let item=candidates.get(otherId);
      if (!item) { item={record:index.objects.get(otherId),score:0,reasons:[]}; candidates.set(otherId,item); }
      const targetTag=item.record.tags.find(t=>t.id===tag.id);
      const contribution=weight*rarity*focus;
      item.score+=contribution;
      item.reasons.push({
        family:tag.family, value:tag.value,
        sourceColumns:tag.sourceColumns, targetColumns:targetTag?.sourceColumns||[],
        candidateCount:peers.size, contribution:Number(contribution.toFixed(3))
      });
    }
  }
  return [...candidates.values()].map(item=>({
    ...item,score:Number(item.score.toFixed(3)),
    reasons:item.reasons.sort((a,b)=>b.contribution-a.contribution || a.value.localeCompare(b.value)),
    provenance:'shared_staff_metadata', historicalRelationshipEstablished:false
  })).sort((a,b)=>b.score-a.score||a.record.accession.localeCompare(b.record.accession))
    .slice(0,Math.max(0,Math.min(12,Math.floor(limit)||0)));
}
