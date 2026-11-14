/**
 * Artist-authored, versioned interpretive cards for curation review.
 * Prompts displayed here are design specifications, not evidence of a live LLM.
 */
import { PERSONAS } from './discovery-graph.mjs';
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
    prompt:[
      `ROLE: You are an ARTIST-AUTHORED interpretive lens called "${lens.label}", not a historical person or museum staff member.`,
      `PURPOSE: ${description}`,
      `READER QUESTION: ${hook}`,
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
const symbols={
home:'<path d="M8 22 32 4 56 22v31H8Z"/><path d="M24 53V34h16v19"/>',
travel:'<rect x="10" y="18" width="44" height="35" rx="6"/><path d="M22 18v-7h20v7M18 27h28M18 43h28"/><circle cx="21" cy="55" r="3"/><circle cx="43" cy="55" r="3"/>',
eye:'<path d="M4 32Q32 4 60 32Q32 60 4 32Z"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="3" fill="currentColor"/>',
art:'<path d="M8 50 32 8 56 50Z"/><circle cx="32" cy="28" r="7"/><path d="M17 43h30"/>',
tools:'<path d="M14 13 50 49M50 13 14 49"/><path d="M8 8 20 12 13 19ZM44 45 53 42 56 50 50 56Z"/>',
archive:'<rect x="8" y="13" width="48" height="40" rx="3"/><path d="M8 24h48M21 33h22M21 43h22"/>',
future:'<path d="M12 47 40 9 36 30h16L20 55l4-23H12Z"/>',
time:'<circle cx="32" cy="32" r="23"/><path d="M32 17v16l12 9"/>',
signal:'<circle cx="16" cy="24" r="5"/><path d="M26 23q18 0 21-12v42Q41 41 26 41Z"/><path d="M16 29v19h10V30"/>',
mask:'<path d="M12 12Q32 4 52 12v20Q50 53 32 56 14 53 12 32Z"/><path d="M20 30l10 3M44 30l-10 3M25 44q7-5 14 0"/>',
museum:'<path d="M5 22 32 7 59 22Z"/><path d="M9 24h46M13 54V27m13 27V27m13 27V27m13 27V27M7 57h50"/>'
};
export function portraitSvg(card){
  const mark=symbols[card.icon]||symbols.archive;
  const bg=card.color;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" role="img">
    <defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#1C344A"/></linearGradient></defs>
    <rect width="120" height="140" rx="15" fill="url(#p)"/>
    <path d="M0 110Q60 57 120 110v30H0Z" fill="#15283D" opacity=".65"/>
    <circle cx="60" cy="63" r="29" fill="#F2E6D4" opacity=".88"/>
    <path d="M30 126Q60 89 90 126" fill="#F2E6D4" opacity=".84"/>
    <g transform="translate(41 42) scale(.6)" fill="none" stroke="#182D3F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${mark}</g>
    <path d="M14 15h28" stroke="#fff" stroke-opacity=".54" stroke-width="2"/>
    <circle cx="104" cy="19" r="5" fill="#fff" opacity=".72"/>
  </svg>`;
}
export function portraitUrl(card){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(portraitSvg(card));}
