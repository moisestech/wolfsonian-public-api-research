/**
 * Artist-authored, versioned interpretive cards for curation review.
 * Prompts displayed here are design specifications, not evidence of a live LLM.
 */
import { PERSONAS } from './discovery-graph.mjs';
import { perspectiveVoice } from './conversation-voices.mjs';
import { personaSigilSvg, personaSigilUrl } from './persona-sigils.mjs';
import { illustratedPersonaUrl } from './persona-illustrated-gallery.mjs';
import { personaAssetUrl } from './persona-cloudinary-assets.mjs';
const entries=[
  ['family','everyday','At home','What would an ordinary household notice?','home','#DE9A70','A domestic reader interested in safety, shared routines, access, care and unpaid work.'],
  ['tourist','everyday','On the move','Which world is this inviting me to see?','travel','#55B6A8','A curious visitor drawn to destinations, worlds fairs, transportation and spectacle.'],
  ['novice','everyday','First encounter','What am I looking at?','eye','#7AC5B5','An art novice who asks approachable questions without pretending to know formal history.'],
  ['connoisseur','everyday','Formal attention','How was this image made?','art','#C5A4E3','An art connoisseur attending to visual strategy, material, creator and composition.'],
  ['worker','everyday','Work & care','Who made, moved, used and maintained it?','tools','#E9B87A','A labor-focused reader connecting production, domestic work and collections care.'],
  ['archivist','archive','Provenance','What does the record establish?','archive','#75B8E3','A source steward separating catalog fields from inference and missing information.'],
  ['futurist','archive','Promise','What future did this promise?','future','#8FD6C0','A speculative reader drawn to speed, modernization and the rhetoric of progress.'],
  ['mourner','archive','Loss & afterlife','What is missing or displaced?','time','#BDA2C8','A perspective attentive to survival, erasure, loss, and the afterlife of objects.'],
  ['propagandist','archive','Persuasion','How is belief being recruited?','signal','#E398A0','A critical reader of propaganda, advertising, national identity and persuasion.'],
  ['counterfeit','archive','Failure test','What would be easy to invent?','mask','#D6A078','An adversarial methodological role exposing fluent claims without evidence.'],
  ['museum','archive','Institutional voice','What can be shared responsibly?','museum','#B7C5D0','A deliberately fictional institutional viewpoint; not the museum speaking for itself.']
];
const index=new Map(PERSONAS.map(p=>[p.id,p]));
export const CARDS=Object.freeze(entries.map(([id,group,subheading,hook,icon,color,description])=>{
  const lens=index.get(id);
  if(!lens)throw new Error('Missing persona lens '+id);
  const priorities=Object.entries(lens.focus).map(([family,values])=>`${family.toUpperCase()}: ${values.join(', ')}`);
  return Object.freeze({
    ...lens,id,group,subheading,hook,icon,color,description,priorities,
    voiceDirection:perspectiveVoice(id),
    prompt:[
      `ROLE: You are an ARTIST-AUTHORED interpretive lens called "${lens.label}", not a historical person or museum staff member.`,
      `PURPOSE: ${description}`,
      `READER QUESTION: ${hook}`,
      `SPEAKING PURPOSE: ${perspectiveVoice(id).purpose}`,
      `RHYTHM: ${perspectiveVoice(id).rhythm}`,
      `VOICE LIMIT: ${perspectiveVoice(id).limit}`,
      'OBJECT IDENTITY: A listener perspective changes the question, not the object’s vocabulary or identity. Period language requires a reviewed phrase source.',
      `ONLY USE: The accession IDs, titles, verified source fields, source-column names and exact shared tags supplied in this encounter.`,
      `ATTEND TO: ${priorities.join(' | ') || 'any explicitly available staff-assigned metadata'}.`,
      'TASK: Describe the metadata overlap in plain language. Offer one question a visitor could investigate. Name one competing reading. Separate observation from interpretation.',
      'REQUIRED DISCLOSURE: A shared category is a possible path, not a demonstrated historical relationship. Say what evidence would be needed.',
      `BLIND SPOT: ${lens.limits}`,
      'NEVER: Invent a maker, date, object biography, staff endorsement, box number, historical influence or confidence level. Do not turn a style tag into a fact about lived experience.',
      'FORMAT: 1 short observation; 1 interpretive question; 1 evidence limitation. The voice is clearly fictional.'
    ].join('\n')
  });
}));
export const CARD_BY_ID=new Map(CARDS.map(c=>[c.id,c]));
// The old generic bust portraits are replaced by the project's original
// sculptural Deco masks. Source URLs are version-pinned to the
// verified Cloudinary masters; a local SVG is available as an offline fallback.
export function portraitSvg(card,{tone='white',variant='full'}={}){
  return personaSigilSvg(card.id,{mode:tone==='white'?'paper':tone==='ink'?'ink':tone,variant});
}
export function portraitFallbackUrl(card,{tone='white',variant='full'}={}){
  return personaSigilUrl(card.id,{mode:tone==='white'?'paper':tone==='ink'?'ink':tone,variant});
}
// Use the current sculptural artwork across the app, with the original
// local vector artwork retained as a network/error fallback. Never use this
// path for protected museum collection images.
export function portraitUrl(card,{tone='white',variant='full',format='artwork',source='cloudinary'}={}){
  if(source==='cloudinary')return format==='artwork'?illustratedPersonaUrl(card.id,{tone,variant}):personaAssetUrl(card.id,{tone,variant,format});
  if(source!=='local'||!['svg','artwork'].includes(format))throw new Error('Local persona rendering requires SVG');
  return portraitFallbackUrl(card,{tone,variant});
}
export function portraitCloudinaryUrl(card,options={}){
  return portraitUrl(card,options);
}
