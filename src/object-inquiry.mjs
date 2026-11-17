/**
 * Artist's adaptation of the twenty-question object-inquiry method supplied
 * by Luna (photographed handout attributed to Susan Garfinkel).
 *
 * The source asks the inspector to begin with scrutiny rather than premature
 * identification. These five editorial stages are OUR grouping, not the
 * author's original numbering or headings.
 */
export const INQUIRY_STAGES = Object.freeze([
  {
    id:'observe', label:'Look before naming', numbers:[1,2,3,4,5],
    prompt:'What can we actually sense or describe without inventing a use?',
    examples:['What do you notice first?','Which marks show handling or wear?','Which side seems meant to face a person?']
  },
  {
    id:'encounter', label:'Use and feeling', numbers:[6,7,8],
    prompt:'Who might have acted with this object, and how does it make you feel?',
    examples:['What action does its form invite?','Would it feel reassuring or intrusive?','Who is missing from this scene?']
  },
  {
    id:'provenance', label:'Making and biography', numbers:[9,10,11,12],
    prompt:'What can records prove about production, ownership, and other objects?',
    examples:['Who designed it, and who made it?','Where did it travel?','Is this grouping documented or imagined?']
  },
  {
    id:'systems', label:'Power and exchange', numbers:[13,14,15,16,17],
    prompt:'Whose identities, beliefs, labor, value, and agency did the object shape?',
    examples:['Who benefits from it?','Who controls the exchange?','What does the object let a person do—or stop them doing?']
  },
  {
    id:'interpret', label:'Present and reinterpret', numbers:[18,19,20],
    prompt:'Why does this object matter now, and what should someone ask next?',
    examples:['What in it still feels contemporary?','What is genuinely unusual here?','Which source might change our reading?']
  }
]);
export const ORIGINAL_QUESTION_COUNT=20;
export const SOURCE_CREDIT='Susan Garfinkel, “Revised Questions: Twenty Questions to Ask an Object” (Luna-provided handout); editorial stages and prompts are an artist adaptation.';

/**
 * An eight-turn dramaturgical experiment, NOT a historical speech transcript.
 * Catalog data are only referenced as catalog identifiers; no specific
 * container, floor, ownership, or historical dialogue is claimed.
 */
export function objectInquiryDialogue(record={accession:'XX1990.1484',title:'Sparton radio'}) {
  const accession=String(record.accession||'UNKNOWN').slice(0,80);
  const title=String(record.title||'this object').slice(0,160);
  const turns=[
    {speaker:'Visitor',phase:'observe',type:'question',text:'What am I supposed to notice before I know what you are?'},
    {speaker:title,phase:'observe',type:'interpretation',text:'Maybe the shape. You reached for a name before looking at how I present myself.'},
    {speaker:'Visitor',phase:'encounter',type:'question',text:'All right. What were people expected to do with you?'},
    {speaker:title,phase:'encounter',type:'interpretation',text:'That depends on whose life we are imagining. A designer, a buyer, and a repairer would not tell the same story.'},
    {speaker:'Worker · fictional perspective',phase:'systems',type:'interpretation',text:'And which story counts as work? You can admire an object without knowing whose hands made or maintained it.'},
    {speaker:'Visitor',phase:'provenance',type:'question',text:'Where were you kept before somebody brought you here?'},
    {speaker:'Archivist · fictional research protocol',phase:'provenance',type:'source_limit',text:'The selected public research identity is '+accession+'. This demo has no approved record connecting that accession to a storage box, floor, or bay. I cannot supply a location.'},
    {speaker:'Visitor',phase:'interpret',type:'question',text:'So the catalog can identify you without telling me where you are?'},
    {speaker:'Archivist · fictional research protocol',phase:'interpret',type:'source_limit',text:'Yes. A catalog identity and a physical container are different systems. A verified join and display permission would be needed to connect them.'},
  ];
  return {title,accession,turns,disclaimer:"All dialogue is artist-authored fiction, not an object's testimony. This method does not establish a historical relationship or storage location."};
}
export function stageForQuestion(number){
  return INQUIRY_STAGES.find(s=>s.numbers.includes(Number(number))) || null;
}


/**
 * Vary the dramatic problem with the visitor's selected line of inquiry.
 * Keep every utterance as authored interpretation, question or explicit limit;
 * do not invent missing physical/custodial records.
 */
const INQUIRY_PATHS=Object.freeze({
  observe:[
    ['Visitor','What would you notice if nobody told you what this was?'],
    ['Object','You keep asking my name. Try looking first. Which edges, surfaces or traces are actually visible?'],
    ['Visitor','So an appearance can mislead?'],
    ['Object','Or invite an assumption. I cannot certify which mark is wear, design, or damage from a title alone.'],
    ['Worker','A close look might tell you where someone touched me. It will not automatically tell you who that was.'],
    ['Archivist','Observations and catalog descriptions are different evidence. Record what can be seen, then check the object record.'],
    ['Visitor','What photograph or inspection note could challenge what I thought I saw?']
  ],
  encounter:[
    ['Visitor','What would my body have to do with you?'],
    ['Object','Before we speak of innovation, imagine a hand, an ear, an everyday room. Which of those is visible in the evidence?'],
    ['Worker','And whose hands prepared the thing before a user ever arrived?'],
    ['Object','You have changed the subject from the user to the people behind the promise. That seems fair.'],
    ['Visitor','Would everyone have experienced you the same way?'],
    ['Archivist','No single experience is established here. That would require records of use, testimony, photographs or other sources.'],
    ['Visitor','What sort of account from an actual user would complicate our story?']
  ],
  provenance:[
    ['Visitor','Who made you, and who decided what to call you?'],
    ['Object','A name is a starting point, not a biography. Did you expect me to remember the workshop?'],
    ['Worker','Even a named designer is not an inventory of makers, movers and repairers.'],
    ['Visitor','Then what about ownership, movement and storage?'],
    ['Object','You have a catalog identity. That is not a key to every door I have passed through.'],
    ['Archivist','We have no approved box, bay or floor association for this accession in the demo. The absence of a join is not proof that no record exists.'],
    ['Visitor','Which authorized record would let us draw that line?']
  ],
  systems:[
    ['Visitor','Who benefited from the future you were supposed to represent?'],
    ['Object','Supposed to represent? You have already given me a promise. Can you show me the advertisement?'],
    ['Worker','A promise can hide a wage, an exclusion, a repair bill or someone doing the work.'],
    ['Object','Then perhaps you should ask who got to call this progress.'],
    ['Visitor','Is that history, or is it our interpretation?'],
    ['Archivist','It is an artist-authored critical question. No particular purchaser, worker or benefit is established by this accession alone.'],
    ['Visitor','What labor or sales source could make this argument specific?']
  ],
  interpret:[
    ['Visitor','Why should this object matter to anyone now?'],
    ['Object','You brought me here. Surely that says as much about your present as about mine.'],
    ['Visitor','Maybe I recognize myself in the system that made you.'],
    ['Worker','That is a metaphor, not evidence. It might still be worth making, as long as you label it.'],
    ['Object','So you are not asking me to predict the future, but to reveal what a future promised?'],
    ['Archivist','That is a contemporary interpretation. Keep the original record beside it so visitors can object to the reading.'],
    ['Visitor','What would change your mind?']
  ]
});
export function objectInquiryPath(record,stageId='observe'){
  const chosen=INQUIRY_STAGES.find(s=>s.id===stageId)||INQUIRY_STAGES[0];
  const accession=String(record?.accession||'UNKNOWN').slice(0,80);
  const objectTitle=String(record?.title||'Selected object').slice(0,160);
  const rows=INQUIRY_PATHS[chosen.id];
  const turns=rows.map(([role,text],index)=>({
    speaker:role==='Object'?objectTitle:role==='Worker'?'Worker · imagined perspective':role==='Archivist'?'Archivist · fictional protocol':role,
    role:role.toLowerCase(),phase:chosen.id,type:role==='Archivist'?'source_limit':role==='Visitor'?'question':'interpretation',
    text:role==='Archivist'&&chosen.id==='provenance'?text+' Selected accession: '+accession+'.':text,
    beat:index+1
  }));
  return {title:objectTitle,accession,stage:chosen.id,turns,
    disclaimer:'Artist-authored seven-turn study, not historical testimony or evidence of an actual relationship. Changing the inquiry stage changes this scene.'};
}
