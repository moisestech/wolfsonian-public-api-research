/**
 * Offline scripted encounters. No model call, external voice provider, or invented historical claim.
 * Displayed dialogue is interpretive theatre, assembled only from supplied metadata.
 */
function short(value,max=75){const s=String(value||'Unknown').trim();return s.length>max?s.slice(0,max-1)+'…':s;}
export function makeDialogue(source,neighbor,connection,persona){
  if(!source || !neighbor || !connection)return [];
  const reasons=connection.reasons||[];
  const tags=reasons.slice(0,3).map(r=>`${r.value} (${r.family})`);
  const overlap=tags.length?tags.join(', '):'no confirmed shared tags';
  const question=persona?.question||'Why might these items be compared?';
  return [
    {actor:source.title,role:'Fictional object voice 01',text:`My working record identifies me as "${short(source.title)}", accession ${source.accession}. I am not speaking as an actual historical witness.`},
    {actor:neighbor.title,role:'Fictional object voice 02',text:`My record has overlaps with yours: ${overlap}. Those fields suggest a path to explore, not evidence that our histories intersected.`},
    {actor:persona?.label||'Visitor lens',role:'Artist-authored interpretation',text:`${question} We would need more sources or a human expert before asserting a direct connection.`}
  ];
}
export function replyToQuestion(question,record,persona){
  const input=String(question||'').trim();
  if(!input)return 'Ask a question to begin. This is an offline scripted research aid, not a live AI conversation.';
  const lower=input.toLowerCase();
  let focus='The source packet is limited.';
  const themes=(record?.tags||[]).filter(t=>t.family==='theme').map(t=>t.value);
  const motifs=(record?.tags||[]).filter(t=>t.family==='motif').map(t=>t.value);
  if(/box|stored|storage|accession|catalog|database|where/.test(lower))
    focus=`The current record gives accession ${record?.accession||'unknown'}. A physical box/location identifier is distinct and cannot be inferred from these tags.`;
  else if(/work|labor|made|maker|maintain|factory|repair/.test(lower))
    focus=`The recorded themes are ${themes.join(', ')||'not supplied'}. They do not on their own establish who made, repaired or used the object.`;
  else if(/symbol|motif|show|image|look/.test(lower))
    focus=`The available motif tags are ${motifs.join(', ')||'not supplied'}. They are indexing cues, not definitive interpretation.`;
  else if(/related|connect|same|why/.test(lower))
    focus='Any connection displayed here is a calculated overlap between staff-provided metadata fields. It is not a demonstrated historical relationship.';
  else
    focus=`The supplied record is titled "${short(record?.title)}" and has ${themes.length} thematic and ${motifs.length} motif tags.`;
  return `${focus} As the fictional ${persona?.label||'reader'}, I would ask: ${persona?.question||'What source could help answer this?'} For a factual answer, consult the museum's collections team and cited documents.`;
}
export const VOICE_DISCLOSURE='Offline, deterministic scripted voices using your browser speech synthesis. Not ElevenLabs, not a live LLM, and not the voice of a historic person or the museum.';
