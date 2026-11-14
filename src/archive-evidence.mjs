// Candidate adapters for the documented public labels, not a claim of a live schema.
const fields={
  accession:['Accession Number','accession_number','accessionNumber'],
  additional:['Additional Accession Numbers','additional_accession_numbers','additionalAccessionNumbers'],
  title:['Title','title'],nodeId:['ID (Node ID)','node_id','id'],
  creator:['Creator','creator'],date:['Date','date'],collection:['Collection','collection'],
  material:['Material','material'],credit:['Credit Line','credit_line']
};
const escapePointer=s=>s.replace(/~/g,'~0').replace(/\//g,'~1');
const str=x=>typeof x==='string'||typeof x==='number'?String(x).trim():'';
export function recordsFromLookup(payload) {
  let records,path='';
  if(Array.isArray(payload)) records=payload;
  else if(payload&&typeof payload==='object') {
    const arrays=['records','items','results','data'].filter(k=>Array.isArray(payload[k]));
    if(arrays.length!==1) throw new Error('Unrecognized or ambiguous Lakehouse wrapper. Supply a bounded array of records.');
    path='/'+arrays[0];records=payload[arrays[0]];
  }
  if(!records||records.some(r=>!r||typeof r!=='object'||Array.isArray(r))) throw new Error('Expected an array of record objects.');
  if(records.length>250) throw new Error('This demo accepts at most 250 bounded lookup rows.');
  return {records,path};
}
function observed(record,names,prefix) {
  return names.filter(k=>Object.hasOwn(record,k)).map(k=>({value:record[k],pointer:prefix+'/'+escapePointer(k)}));
}
export function reconcileLookup(payload,accession,retrievedAt=new Date().toISOString()) {
  const {records,path}=recordsFromLookup(payload), wanted=String(accession).trim(),matches=[];
  records.forEach((record,i)=>{
    const prefix=path+'/'+i,primary=observed(record,fields.accession,prefix),extra=observed(record,fields.additional,prefix);
    const primaryValues=[...new Set(primary.map(p=>str(p.value)).filter(Boolean))];
    const p=primary.find(p=>str(p.value)===wanted);
    // Never split commas: 85.7.383a,b can itself be an accession.
    const a=extra.find(p=>(Array.isArray(p.value)?p.value:[p.value]).some(v=>str(v)===wanted));
    if(!p&&!a)return;
    const values={};
    for(const [name,aliases] of Object.entries(fields)) {
      const candidates=observed(record,aliases,prefix);
      values[name]=candidates.length?{...candidates[0],status:candidates[0].value===null?'NULL':str(candidates[0].value)===''&&!Array.isArray(candidates[0].value)?'EMPTY':'PRESENT'}:{status:'NOT_RETURNED'};
    }
    matches.push({match:p?'EXACT_PRIMARY_ACCESSION':'EXACT_ADDITIONAL_ACCESSION',identityConflict:primaryValues.length>1,identityPointer:(p||a).pointer,fields:values});
  });
  const ambiguous=matches.length>1||matches.some(m=>m.identityConflict);
  return {accession:wanted,status:ambiguous?'AMBIGUOUS':matches.length?matches[0].match:'NOT_IN_BOUNDED_RESPONSE',
    matches,retrievedAt,schemaStatus:'candidate_label_adapter',rowsObserved:records.length,
    boxContext:'NOT_ESTABLISHED_BY_THIS_ADAPTER',historicalRelationshipEstablished:false};
}
