/**
 * Author-reviewed *candidates* for fictional dramatic register.
 * Exact historical claims remain in the original scene's Archivist line.
 * Tone is never permission to fabricate an edge, quotation or museum fact.
 */
export const CONVERSATION_TONES=Object.freeze({
  critical:{id:'critical',label:'Argumentative / Critical',description:'Direct objections and source-aware challenges'},
  poetic:{id:'poetic',label:'Poetic / Uncanny',description:'Objects awaken into metaphor while evidence remains fixed'}
});
export const POETIC_OBJECT_LINES=Object.freeze({
  "opening-skilled-work-lottery": [
    "They called me Skilled Work. A phrase polished like a medal. Whose hands could ever wear it?",
    "I offer a lottery beside an exhibition of women's labor. A chance to win is not the same as a chance to be remembered."
  ],
  "opening-skilled-work-woman-exhibition": [
    "The word skilled hangs in my title like a lamp. Whose face stays outside its circle of light?",
    "A century, 1813 to 1913, held between two dates. Which lives shrink when history is made to fit a poster?"
  ],
  "opening-skilled-work-engine": [
    "Work is my subject—or at least my promise. Can a verb keep a worker from disappearing?",
    "Call me Making the Engine. The machine is named, but the makers are still a question."
  ],
  "opening-skilled-work-workers-vote": [
    "The word skilled does not vote. Can a title recognize a worker without listening?",
    "I ask for a workers' vote. Ink can give an order, but it cannot tell us who agreed to be represented."
  ],
  "opening-skilled-work-1939": [
    "My date is 1917. I carry skilled work toward a future I cannot see. What does 1939 hear when I speak?",
    "I am 1939 A.D., a year flattened into four signs. Do numbers promise anything, or wait for someone to believe them?"
  ],
  "opening-skilled-work-aircraft": [
    "My title holds munitions work close. How far can the story travel before the worker falls out of view?",
    "My title sends a Savoia-Marchetti aircraft above the Colosseum. At that height, can a workshop still be imagined?"
  ],
  "machines-engine-safety": [
    "An engine waits at the end of my title. How far from its name are the people who made it?",
    "One splinter. One eye. That is the warning in my title. Progress has a body, even when an engine seems not to."
  ],
  "machines-vote-engine": [
    "I ask for a vote. The command is printed before a worker can answer. Whose voice arrives first?",
    "My title promises the making of an engine. Between making and being heard, how much noise can an image hide?"
  ],
  "politics-1939-atlantic-wall": [
    "I carry 1939 like a sealed envelope. Can a date open itself?",
    "I say 1943 is not 1918. Two years face each other like witnesses. Who called them to testify?"
  ],
  "politics-uboats-1939": [
    "Our. One small word opens a door and decides who stands on the inside. What does it ask of you?",
    "I offer a year, 1939 A.D. No pronoun, no public named. Yet every reader brings a history to it."
  ],
  "challenge-robeson-architectural-fantasy": [
    "A person's name: Paul Robeson. The machine answers with Trees. What has it forgotten to ask?",
    "I am a house imagined for a steep hillside. The index hands us a tree where a relationship ought to be."
  ],
  "commerce-biennale-dye": [
    "I open a door marked contemporary art. Who is allowed to decide what deserves a frame?",
    "My title promises dye. The index offers Mythological figures. What can a motif make someone want to buy?"
  ],
  "politics-east-indies-1939": [
    "My title makes a demand for freedom. It does not whisper. But who was meant to hear it?",
    "I am 1939 A.D., only a date. Can a year answer a political call made in another context?"
  ],
  "challenge-utrecht-living-rise": [
    "I announce a fair in Utrecht. Water introduces me to a stranger. Shall I trust our guide?",
    "Let the Living Rise: those words are my title. Water is the bridge the index offers. Is it strong enough to cross?"
  ],
  "politics-invader-1939": [
    "An invader's grasp; enslavement threatened. My title makes fear into a sentence. Whose fear does it summon?",
    "I am named 1939 A.D. A date cannot tell you whether to hope or fear. The reader brings that weather."
  ],
  "commerce-heels-biennale": [
    "I advertise Pirelli heels. Desire walks into the room, while a mythological figure waits in the index. What is being sold?",
    "I announce a biennial exhibition. Give a shared motif a different room: is it still asking the same thing of us?"
  ]
});

export function normalizeTone(value){
  return Object.hasOwn(CONVERSATION_TONES,value)?value:'critical';
}
/**
 * Pure editorial transform. No mutation of the source-backed conversation,
 * citations, provenance, identities or evidence. Unscripted metadata fallback
 * remains the same source-limited text in both modes.
 */
export function withConversationTone(conversation,tone='critical'){
  const selected=normalizeTone(tone);
  if(!conversation||!Array.isArray(conversation.turns))return conversation;
  if(selected!=='poetic')return conversation;
  const lines=POETIC_OBJECT_LINES[conversation.sceneId];
  if(!lines)return conversation;
  const turns=conversation.turns.map((turn,i)=>{
    if(turn.role==='archivist')return {...turn}; // canonical evidence text, unchanged
    const text=lines[i];
    if(typeof text!=='string'||!text.trim())return {...turn};
    return {...turn,text};
  });
  return {...conversation,turns,tone:selected,displayTone:CONVERSATION_TONES[selected].label};
}
