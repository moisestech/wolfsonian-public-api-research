/**
 * Visitor-first explanation of WHY an encounter exists and WHAT selecting
 * another object changes. Statements must follow the source contract.
 * A similarity tag is not an historical relationship.
 */
const short=(value,max=115)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
export function explainEncounter({source,target,conversation,lensLabel='Family',previous=null}={}){
  if(!source?.accession||!target?.accession||!conversation)throw Error('A selected source, target and conversation are required.');
  const curated=conversation.mode==='CURATED_EDGE_SCENE';
  const juxtaposition=conversation.relationshipType==='curatorial_juxtaposition';
  const reasons=Array.isArray(conversation.evidence)?conversation.evidence:[];
  const reason=reasons[0];
  const key=short(conversation.id||source.accession+'::'+target.accession);
  const sourceName=short(source.title)||'First object';
  const targetName=short(target.title)||'Second object';
  const family=reason?.family==='theme'?'theme':reason?.family==='motif'?'motif':'research tag';
  const tag=short(reason?.value);
  const evidenceBasis=juxtaposition
    ? 'An artist-proposed comparison from a separately described research path, not a catalog match.'
    : tag
      ? 'Both records are indexed under '+family+' “'+tag+'”. This is a reason to compare them, not proof they met.'
      : 'No verified shared-tag relationship is provided for this artistic comparison.';
  const question=short(conversation.dramaticArc||conversation.nextPrompt||'What happens when we compare these records?',200);
  const form=juxtaposition
    ? 'A specifically written curatorial juxtaposition: the works were selected to challenge one another.'
    : curated
      ? 'A specifically written exchange for these two records. Another pair can raise a different argument.'
      : 'An offline five-turn comparison template. The object titles, shared tag and reading perspective change; the dramatic structure can repeat.';
  const frame=juxtaposition
    ? 'The research path supplies the question.'
    : curated
      ? 'The selected perspective helps navigate the map. This hand-written scene does not change its script when you change that perspective.'
      : 'The selected “'+short(lensLabel,60)+'” perspective changes which question frames this scripted exchange.';
  const previousChanged=previous&&previous.key!==key;
  const changed=previousChanged
    ? 'Previously: '+short(previous.sourceName,70)+' + '+short(previous.targetName,70)+' ('+short(previous.question,90)+'). Now: '+sourceName+' + '+targetName+' ('+question+').'
    : 'Choose another object or connection to compare a different pair. The shared reason and central question will update.';
  return {
    key,sourceName,targetName,question,evidenceBasis,form,frame,changed,
    type:juxtaposition?'ARTIST-PROPOSED PAIR':curated?'PAIR-SPECIFIC SCENE':'TAG-BASED SCRIPT',
    boundary:'These speakers are fictional interpretations. The link is not evidence of historical contact, influence, or shared storage.',
    next:short(conversation.nextPrompt||'What source would change this interpretation?',200)
  };
}
