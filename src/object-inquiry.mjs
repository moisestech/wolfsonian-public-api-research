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
  return {title,accession,turns,disclaimer:'All dialogue is artist-authored fiction, not an object's testimony. This method does not establish a historical relationship or storage location.'};
}
export function stageForQuestion(number){
  return INQUIRY_STAGES.find(s=>s.numbers.includes(Number(number))) || null;
}
