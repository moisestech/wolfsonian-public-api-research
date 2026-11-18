/**
 * Local, permission-restricted Lakehouse search prototype.
 *
 * No network requests or model calls. This module works only on the small
 * record array supplied by a local, bounded probe. It is deliberately absent
 * from the public-site allowlist. Lexical expansions are labeled as ARTIST
 * ASSOCIATIONS, not verified catalog subjects or historical links.
 */
export const SEED_CONCEPTS=Object.freeze({
  archive:Object.freeze(['archive','archival','catalog','catalogue','memory','record','preservation','index','collection','storage']),
  dream:Object.freeze(['dream','tomorrow','future','futurama','utopia','fantasy','desire','vision','projection']),
  brain:Object.freeze(['brain','cognition','perception','signal','electricity','automation','intelligence','learning','control'])
});

const LABELS=Object.freeze({
  accession:['Accession Number','accession_number','accessionNumber'],
  additional:['Additional Accession Numbers','additional_accession_numbers','additionalAccessions'],
  title:['Title','title'],
  creator:['Creator','creator'],
  date:['Date','date'],
  subject:['Subject','subject'],
  description:['Description','description'],
  geography:['Geographic Origin','geographic_origin'],
  material:['Material','material'],
  genre:['Genre','genre']
});

const MAX_ROWS=250;
const FIELD_MAX=Object.freeze({accession:160,additional:300,title:280,creator:300,date:80,subject:800,description:2200,geography:240,material:250,genre:250});
const clean=(value,max=2200)=>{
  if(value===null||value===undefined)return '';
  const string=Array.isArray(value)?value.join('; '):typeof value==='object'?'':String(value);
  return string.replace(/https?:\/\/\S+/gi,'[external URL omitted]').replace(/[\u0000-\u001f\u007f]/g,' ')
    .replace(/\s+/g,' ').trim().slice(0,max);
};
const key=value=>clean(value,300).toLocaleLowerCase('en');
const accessionKey=value=>clean(value,160).replace(/\s+/g,'').toUpperCase();
function readField(row,aliases,limit){
  const field=aliases.find(name=>Object.hasOwn(row,name));
  return {value:field?clean(row[field],limit):'',sourceField:field||null,status:field?(row[field]===null?'NULL':'OBSERVED'):'NOT_RETURNED'};
}
function accessionParts(value){
  // Commas must stay: 85.7.383a,b can itself be one accession.
  return [...new Set(clean(value,300).split(';').map(v=>v.trim()).filter(Boolean))];
}
function safeRecord(row,index){
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Expected JSON object rows.');
  const fields={};
  for(const [name,aliases] of Object.entries(LABELS))
    fields[name]=readField(row,aliases,FIELD_MAX[name]);
  const values=accessionParts(fields.accession.value);
  if(!values.length)return null;
  const additional=accessionParts(fields.additional.value);
  const accession=values[0];
  const aliases=[...new Set([...values.slice(1),...additional].filter(v=>accessionKey(v)!==accessionKey(accession)))];
  return {
    id:'lakehouse:'+index+':'+encodeURIComponent(accession),
    accession,aliases,
    title:fields.title.value||null,creator:fields.creator.value||null,date:fields.date.value||null,
    subject:fields.subject.value||null,description:fields.description.value||null,
    geography:fields.geography.value||null,material:fields.material.value||null,
    genre:fields.genre.value||null,fields,
    provenance:{sourceSystem:'lakehouse_read_only_lookup',sourceRow:index,visibility:'private_local_unreviewed',
      rightsStatus:'not_approved_for_publication',historicalRelationshipEstablished:false}
  };
}

export function buildLocalLakehouseIndex(rows,{retrievedAt=null}={}){
  if(!Array.isArray(rows)||rows.length>MAX_ROWS)throw Error('A bounded array of at most 250 rows is required.');
  const objects=[],byAccession=new Map(),excludedRows=[];
  for(let i=0;i<rows.length;i++){
    const obj=safeRecord(rows[i],i);
    if(!obj){excludedRows.push(i);continue;}
    objects.push(obj);
    for(const [accession,kind] of [[obj.accession,'primary'],...obj.aliases.map(alias=>[alias,'additional'])]){
      const k=accessionKey(accession);
      if(!byAccession.has(k))byAccession.set(k,[]);
      byAccession.get(k).push({id:obj.id,kind});
    }
  }
  return {schemaVersion:1,source:'lakehouse_read_only_lookup',visibility:'private_local_unreviewed',
    retrievedAt,observedRows:rows.length,excludedRows,objects,byAccession};
}
export function serializeLocalLakehouseIndex(index){
  // Always derive the JSON from current data. Never mark it public.
  return {schemaVersion:index.schemaVersion,source:index.source,visibility:index.visibility,
    retrievedAt:index.retrievedAt,observedRows:index.observedRows,
    excludedRows:index.excludedRows,objects:index.objects};
}
export function rehydrateLocalLakehouseIndex(snapshot){
  if(!snapshot||snapshot.visibility!=='private_local_unreviewed'||!Array.isArray(snapshot.objects))
    throw Error('A private local discovery snapshot is required.');
  const byAccession=new Map();
  for(const object of snapshot.objects){
    if(typeof object.accession!=='string')throw Error('Invalid accession in snapshot.');
    for(const [accession,kind] of [[object.accession,'primary'],...(object.aliases||[]).map(v=>[v,'additional'])]){
      const k=accessionKey(accession);
      if(!byAccession.has(k))byAccession.set(k,[]);
      byAccession.get(k).push({id:object.id,kind});
    }
  }
  return {...snapshot,byAccession};
}
const SEARCH_FIELDS=Object.freeze({title:6,subject:4,creator:2,description:1,date:1,geography:1,material:1,genre:1});
const excerpt=(value,term)=>{
  const text=clean(value,2200),where=key(text).indexOf(key(term));
  if(where<0)return text.slice(0,140);
  const start=Math.max(0,where-46);
  return (start?'…':'')+text.slice(start,start+140)+(start+140<text.length?'…':'');
};

export function discoverLakehouse(index,query,{lens=null,literalOnly=false,limit=8}={}){
  if(!index||!Array.isArray(index.objects)||!(index.byAccession instanceof Map))throw Error('Index is not initialized.');
  const text=clean(query,120);
  const requestedLens=String(lens||'').trim().toLowerCase();
  if(requestedLens&&!Object.hasOwn(SEED_CONCEPTS,requestedLens))throw Error('Unknown discovery lens.');
  const selectedLens=requestedLens|| (Object.hasOwn(SEED_CONCEPTS,key(text))?key(text):null);
  const q=key(text||selectedLens||'');
  if(!q)return {query:text,lens:selectedLens,items:[],total:0,semanticStatus:'not_enabled'};
  const boundedLimit=Math.max(1,Math.min(40,Math.floor(Number(limit))||8));
  const exactHits=index.byAccession.get(accessionKey(text))||[];
  if(exactHits.length){
    const mapped=exactHits.map(hit=>{
      const record=index.objects.find(r=>r.id===hit.id);
      return {record,rankScore:1000,matchType:hit.kind==='primary'?'exact_accession':'exact_additional_accession',
        reasons:[{method:'exact',sourceField:hit.kind==='primary'?record.fields?.accession?.sourceField:record.fields?.additional?.sourceField,
          matchedTerm:text,basis:hit.kind==='primary'?'exact primary identifier':'exact additional/compound identifier'}],
        historicalRelationshipEstablished:false};
    });
    return {query:text,lens:selectedLens,items:mapped.slice(0,boundedLimit),total:mapped.length,
      ambiguous:exactHits.length>1,semanticStatus:'not_enabled'};
  }
  const literalTerms=q.split(/\s+/g).filter(Boolean);
  const expansion=(selectedLens&&!literalOnly)?SEED_CONCEPTS[selectedLens].filter(t=>!literalTerms.includes(key(t))):[];
  const ranked=[];
  for(const record of index.objects){
    const reasons=[];let score=0;
    for(const [field,weight] of Object.entries(SEARCH_FIELDS)){
      const value=record[field];if(!value)continue;
      const lower=key(value);
      const literalMatched=literalTerms.length&&literalTerms.every(t=>lower.includes(t));
      if(literalMatched){
        const term=literalTerms.join(' ');
        score+=weight*4;
        reasons.push({method:'literal',field,sourceField:record.fields?.[field]?.sourceField||null,
          matchedTerm:term,basis:'term observed in returned record field',excerpt:excerpt(value,term)});
      }
      if(selectedLens&&!literalOnly){
        for(const term of expansion){
          if(!lower.includes(key(term)))continue;
          score+=weight;
          reasons.push({method:'artist_vocabulary_expansion',field,sourceField:record.fields?.[field]?.sourceField||null,
            matchedTerm:term,basis:'artist-authored discovery expansion; NOT a catalog subject',excerpt:excerpt(value,term)});
        }
      }
    }
    if(reasons.length)ranked.push({record,rankScore:score,matchType:reasons.some(r=>r.method==='literal')?'literal':'expanded',
      reasons,historicalRelationshipEstablished:false});
  }
  ranked.sort((a,b)=>b.rankScore-a.rankScore||a.record.accession.localeCompare(b.record.accession)||a.record.id.localeCompare(b.record.id));
  return {query:text,lens:selectedLens,items:ranked.slice(0,boundedLimit),total:ranked.length,
    ambiguous:false,semanticStatus:'not_enabled_permission_pending'};
}
export function listLakehouseObjects(index,{limit=40,offset=0}={}){
  // Browsing does NOT depend on lexical hits, links, imagery, or speaking roles.
  const start=Math.max(0,Math.floor(Number(offset))||0);
  const cap=Math.max(1,Math.min(250,Math.floor(Number(limit))||40));
  return index.objects.slice().sort((a,b)=>a.accession.localeCompare(b.accession)||a.id.localeCompare(b.id)).slice(start,start+cap);
}
export function localDiscoveryCensus(index){
  return {observedRows:index.observedRows,indexedObjects:index.objects.length,
    excludedRows:index.excludedRows.length,objectIds:new Set(index.objects.map(x=>x.id)).size,
    zeroVoiceOrLinksDiscoverable:index.objects.every(x=>!!x.id&&!!x.accession),
    possibleAmbiguousAccessions:[...index.byAccession.values()].filter(values=>values.length>1).length,
    publicationStatus:'private_only_no_rights_granted'};
}
