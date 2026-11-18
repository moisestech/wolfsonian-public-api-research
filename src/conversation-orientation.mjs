/**
 * Visitor-first explanation of WHY an encounter exists and WHAT selecting
 * another object changes. Statements must follow the source contract.
 * A similarity tag is not an historical relationship.
 */
const short=(value,max=115)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
// Editorial display names are never substituted for catalog titles or identities.
const ROOM_NAMES=new Map([
  ['85.4.64.43','Making the Engine'],
  ['TD1989.318.1','Safety warning'],
  ['85.4.64.34','Skilled Work'],
  ['TD1989.317.66',"Women's Labor lottery"],
  ['XX1990.4091','Workers’ party poster']
]);
const ROOM_QUESTIONS=new Map([
  ['machines-engine-safety','Who pays the price of progress?'],
  ['opening-skilled-work-lottery','Who gets credit for labor?'],
  ['opening-skilled-work-engine','Whose work makes the machine?'],
  ['machines-vote-engine','Does being seen mean having a say?']
]);
const RESEARCH_QUESTIONS=new Map([
  ['TD1989.317.66::TD1990.340.141','Who gets to represent women’s work?'],
  ['XX1990.2907::XX1990.3843','What does a war poster ask us to believe?'],
  ['XX1990.3275::XX1990.3277','What can a myth sell?'],
  ['TD1990.340.146::XX1990.2880','Who is invited to stand behind a flag?']
]);
export function conversationEpisode({source,target,conversation}={}){
  if(!source?.accession||!target?.accession||!conversation)throw Error('A selected source, target and conversation are required.');
  const authored=['CURATED_EDGE_SCENE','CURATORIAL_JUXTAPOSITION'].includes(conversation.mode);
  const proposed=conversation.relationshipType==='curatorial_juxtaposition';
  const reason=conversation.scriptBasis||conversation.evidence?.[0];
  const family=reason?.family==='motif'?'motif':reason?.family==='theme'?'theme':'tag';
  const term=short(reason?.value,80);
  const names=[source,target].map(item=>ROOM_NAMES.get(item.accession)||short(item.title.match(/\[([^\]]{3,65})\]/)?.[1]||item.title,65));
  const pairId=[source.accession,target.accession].sort().join('::');
  const question=ROOM_QUESTIONS.get(conversation.sceneId)||
    (authored?(conversation.dramaticArc?.endsWith('?')?conversation.dramaticArc:conversation.nextPrompt):
      RESEARCH_QUESTIONS.get(pairId)||'What could “'+term+'” connect—and what might it miss?')||'What happens when we compare these records?';
  return Object.freeze({
    // A reading lens does not change the identity of a hand-written scene.
    id:conversation.sceneId||pairId,
    question:short(question,200),
    participants:Object.freeze([source,target].map((item,i)=>Object.freeze({accession:item.accession,title:item.title,shortName:names[i],role:i?'objectB':'objectA'}))),
    mode:authored?'CURATED_SCRIPT':'RESEARCH_PROMPT',
    label:conversation.aiAssisted?'AI-assisted script':authored?'Authored scene':'Research prompt',
    sourceStatus:proposed?'ARTIST_PROPOSAL':term?([source,target].every(item=>['matrix','lakehouse'].includes(item.source))?'STAFF_METADATA':'LOCAL_INPUT'):'UNRESOLVED',
    relationship:Object.freeze({type:proposed?'ARTIST_COMPARISON':'SHARED_TAG',family:reason?.family||null,term:term||null}),
    rationale:proposed?'Artist-proposed comparison · Not a catalog match':term?'Shared '+family+': '+term+' · Imagined comparison':'Comparison proposed · No verified shared tag',
    turns:Object.freeze(authored?conversation.turns.map(turn=>Object.freeze({...turn})):[]),
    nextQuestion:conversation.nextPrompt||'What source would change this interpretation?',
    editorialStatus:conversation.editorialStatus||'DRAFT',
    historicalRelationshipEstablished:false
  });
}
/**
 * Compact per-room connection, never a claim of historical contact.
 * Curatorial proposals carry their own published research explanation;
 * leave the complete account available in Evidence rather than crowding
 * the two object panels on small screens.
 */
export function connectionCaption({episode,proposal}={}){
  if(!episode?.relationship)throw Error('A selected conversation episode is required.');
  if(episode.relationship.type==='ARTIST_COMPARISON'){
    const detail=String(proposal??'').replace(/\s+/g,' ').trim();
    if(!detail)return 'Artist-proposed connection · Not a catalog match';
    const limit=135;
    const excerpt=detail.length<=limit?detail:detail.slice(0,limit-1).replace(/\s+\S*$/,'')+'…';
    return 'Artist-proposed connection · '+excerpt;
  }
  const family=episode.relationship.family||'tag';
  const term=episode.relationship.term;
  return term?'Shared '+family+': '+term+' · metadata only':'Connection not established · Research question';
}

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
      ? 'The selected perspective helps navigate the map. This scripted scene does not change its script when you change that perspective.'
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
