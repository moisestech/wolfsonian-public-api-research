/**
 * Relationship labels for the research preview.
 * A shared tag stays a metadata overlap. A juxtaposition is an authored
 * comparison. A documented historical relationship would need reviewed
 * evidence of contact, and this set has none.
 */
import { PRESENTATION_PAIRS } from './presentation-pairs.mjs';
import { WORLDS_FAIRS_RESEARCH } from './worlds-fairs-research.mjs';

export const RELATIONSHIP_TYPES = Object.freeze({
  metadata_overlap: Object.freeze({
    id: 'metadata_overlap',
    label: 'Metadata overlap',
    meaning: 'A shared catalog tag. It is not evidence that the objects met.',
  }),
  curatorial_juxtaposition: Object.freeze({
    id: 'curatorial_juxtaposition',
    label: 'Curatorial juxtaposition',
    meaning: 'An authored comparison with a question, published sources, and a limit. It is not a catalog match or a documented meeting.',
  }),
  documented_historical_relationship: Object.freeze({
    id: 'documented_historical_relationship',
    label: 'Documented historical relationship',
    meaning: 'Reviewed evidence of contact between the records. This preview has none.',
  }),
});

export const DOCUMENTED_HISTORICAL_RELATIONSHIPS = Object.freeze([]);

const CHECKLIST = 'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf';

function researchRecord(accession) {
  const candidate = WORLDS_FAIRS_RESEARCH.candidates.find(item => item.accession === accession);
  if (!candidate) throw new Error('Missing checklist candidate ' + accession);
  return Object.freeze({
    accession: candidate.accession,
    title: candidate.title,
    year: candidate.year,
    creator: '',
    date: '',
    source: 'research-preview',
    researchOnly: true,
    rightsApproved: false,
    tags: [],
  });
}

function existingRecord(accession, title) {
  return Object.freeze({
    accession,
    title,
    creator: '',
    date: '',
    source: 'research-preview',
    researchOnly: false,
    tags: [],
  });
}

const NARRATES_ARCHIVIST = 'The published checklist describes the 1939 Futurama book spread and the Harlem invitation leaflet. That checklist fact does not show that a Harlem Tours client attended Futurama or met anyone from General Motors.';
const REFUSED_ARCHIVIST = 'The published checklist lists The Threatening Shadow as an unexecuted maquette rejected by fair organizers. That checklist fact does not show what visitors encountered beside the Trylon and Perisphere, or why the organizers refused the proposal.';
const BUILDS_ARCHIVIST = 'The published checklist identifies The Glory of Iron as a sculpture of workers constructing the Eiffel Tower. On Munitions: Skilled Work is a separate object already in this demo. The checklist does not connect their makers, workplaces, or dates.';

function edgeFor(id, source, target) {
  return Object.freeze({
    id: 'juxtaposition::' + id,
    source: source.accession,
    target: target.accession,
    relationshipType: 'curatorial_juxtaposition',
    label: 'Curatorial juxtaposition',
    reasons: [],
    classification: 'curatorial_juxtaposition',
    historicalRelationshipEstablished: false,
  });
}

function evidenceLinks(path) {
  const links=[];
  for (const record of [path.source,path.target]) {
    if (record.researchOnly) links.push({label:'Museum World’s Fairs checklist',url:CHECKLIST});
    else if (record.source==='presentation') links.push({label:'Public presentation titles and accessions',url:'https://github.com/moisestech/wolfsonian-public-api-research/blob/main/src/presentation-pairs.mjs'});
    else if (record.source==='public-packet') {
      links.push({label:'Public research packet · '+record.accession,url:'https://github.com/moisestech/wolfsonian-public-api-research/blob/main/data/public/objects/'+record.packet+'.json'});
      links.push({label:'Museum source · '+record.accession,url:record.sourceUrl});
    }
  }
  return Object.freeze([...new Map(links.map(link=>[link.url,Object.freeze(link)])).values()]);
}

function scene(path) {
  return Object.freeze({
    ...path,
    status: 'research_preview',
    relationshipType: 'curatorial_juxtaposition',
    historicalRelationshipEstablished: false,
    sourceUrl: [path.source,path.target].some(record=>record.researchOnly) ? CHECKLIST : null,
    sourceLinks: evidenceLinks(path),
  });
}

const PATH_DRAFTS = [
  {
    id: 'who-narrates-tomorrow',
    arc: 'Who narrates tomorrow?',
    source: researchRecord('83.2.19'),
    target: researchRecord('XC2024.03.1.1'),
    proposal: 'The checklist places a corporate narration of an imagined city beside a Harlem invitation to the same fair. This pair is not a catalog match or a documented meeting.',
    limits: 'This record does not tell us what an individual fairgoer believed, nor prove that any Harlem Tours client attended the Futurama ride.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '83.2.19',
        speaker: 'Futurama (book page spread)',
        text: 'On my Futurama spread, a city is yours to look over. I can set the scene on the page. Who gets to tell you where tomorrow begins?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: 'XC2024.03.1.1',
        speaker: 'Harlem Invites You to Visit the New York World\'s Fair (leaflet)',
        text: 'My heading invites Harlem to visit the fair. Your spread can point to a city. My leaflet starts with the people I’m asking to make the trip.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: NARRATES_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
  {
    id: 'which-future-is-refused',
    arc: 'Which future is refused?',
    source: researchRecord('83.6.2'),
    target: existingRecord('86.17.1', 'Trylon and Perisphere'),
    proposal: 'The checklist says organizers rejected this unexecuted warning. The Trylon and Perisphere is a different, already built fair emblem. This pair is not a catalog match or a documented meeting.',
    limits: 'The checklist supports rejection of the proposal, not the full decision process, organizers\' private motives, or visitor reactions.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '83.6.2',
        speaker: 'The Threatening Shadow (unexecuted maquette)',
        text: 'I was drawn as a warning against authoritarian aggression, and the fair left me unbuilt. What future remains when the warning is refused?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: '86.17.1',
        speaker: 'Trylon and Perisphere',
        text: 'I give the fair a silhouette people can recognize. If your warning stays unbuilt, there’s nothing in my outline to tell a visitor what was left out.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: REFUSED_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
  {
    id: 'who-builds-the-future',
    arc: 'Who builds the future?',
    source: researchRecord('84.6.14'),
    target: existingRecord('85.4.64.34', 'On Munitions: Skilled Work'),
    proposal: 'The checklist shows workers constructing the Eiffel Tower. On Munitions is a separate print about skilled work. This pair is not a catalog match or a documented meeting.',
    limits: 'No proven connection to the 1917 On Munitions print; the comparison crosses separate moments and contexts.',
    turns: Object.freeze([
      Object.freeze({
        role: 'objectA',
        speakerAccession: '84.6.14',
        speaker: 'La Gloire du fer [The Glory of Iron] (sculpture)',
        text: 'Look past the tower. I put its iron and the hands raising it in the same sculpture. Isn’t that how you show who built the future?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: '85.4.64.34',
        speaker: 'On Munitions: Skilled Work',
        text: 'Showing hands is a start. My title calls munitions work skilled and still leaves me asking whose work gets named. Can a visitor put a name to the hands in your iron?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'archivist',
        speakerAccession: 'archivist',
        speaker: 'Archivist',
        text: BUILDS_ARCHIVIST,
        kind: 'PUBLISHED_CHECKLIST_LIMIT',
      }),
    ]),
  },
];

// Each comparison joins two existing rooms through their exact object identities.
function presentationRecord(accession) {
  for (const pair of PRESENTATION_PAIRS) {
    for (const side of ['source', 'target']) {
      if (pair[side] === accession) return {...existingRecord(accession, pair[side + 'Title']), source:'presentation'};
    }
  }
  throw new Error('Unknown presentation accession ' + accession);
}

// Public packets are artist-prepared research records, not Lakehouse matches
// or rights-cleared photographs. Titles/accessions match WOLF-002/003/004/001.
const PUBLIC_PACKET_RECORDS = Object.freeze({
  'XX1990.1484': { title:'Radio, Sparton, model 558-C', packet:'WOLF-002', url:'https://wolfsonian.org/whats-on/digital-experiences/designing-deco/' },
  'XM1999.108.8': { title:'Catalogue, Machine Age Exposition', packet:'WOLF-003', url:'https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf' },
  '85.7.383a,b': { title:'Vase with lid, Mappemonde [Globe]', packet:'WOLF-004', url:'https://wolfsonian.org/whats-on/digital-experiences/designing-deco/' },
  '86.17.1': { title:'Model, Trylon and Perisphere', packet:'WOLF-001', url:'https://wolfsonian.org/whats-on/exhibitions+installations/2025/05/worlds-fairs-visions-of-tomorrow.html' },
  '85.4.72': { title:'Poster, In 1939: The New York World’s Fair', packet:'WOLF-005', url:'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf' },
  '86.19.57': { title:'Program, Your World of Tomorrow', packet:'WOLF-006', url:'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf' },
  'XB1992.1640': { title:'Booklet, Futurama', packet:'WOLF-007', url:'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf' },
  '2012.6.1': { title:'Television, RCA Victor TRK 12', packet:'WOLF-008', url:'https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf' },
});
function publicPacketRecord(accession) {
  const entry=PUBLIC_PACKET_RECORDS[accession];
  if(!entry)throw new Error('Missing reviewed public packet '+accession);
  return Object.freeze({...existingRecord(accession,entry.title),source:'public-packet',packet:entry.packet,sourceUrl:entry.url,rightsApproved:false});
}

function comparison(id, arc, source, target, proposal, limits, lines) {
  const turns=lines.map((text,index)=>{
    const first=index%2===0;
    const record=first?source:target;
    return Object.freeze({role:first?'objectA':'objectB',speakerAccession:record.accession,speaker:record.title,text,kind:'AI_ASSISTED_INTERPRETATION'});
  });
  return {id,arc,source,target,proposal,limits,turns:Object.freeze(turns),aiAssisted:true};
}

const BRIDGES=[
  comparison('cost-of-iron','What does a monument owe the hands that built it?',
    researchRecord('84.6.14'),presentationRecord('TD1989.318.1'),
    'A sculpture of ironwork celebrates building. A grinding warning asks what a single splinter could cost.',
    'The sources identify different objects. They give no evidence of an injury on the tower.',
    ['Stand far enough back and you can take in a whole tower. Can you still make out the people raising it?',
     'Read my warning from that distance. Can you make out the word “eye”? Come closer. One splinter is all I ask you to picture.',
     'Then look at the workers again. How close must you stand before the tower stops being the first thing you see?']),
  comparison('room-for-a-warning','Who gets to put a warning in public?',
    researchRecord('83.6.2'),presentationRecord('TD1989.318.1'),
    'An unbuilt warning about political aggression meets a printed warning about grinding.',
    'The fair’s rejection is recorded. The safety poster’s placement and audience remain unverified.',
    ['The fair turned down my warning. Yours made it into print. Did it help that you could tell someone exactly what to do, grind safely?',
     'My title gives you one splinter and one eye. I can name what is at risk. I can’t tell you whether anyone stopped.',
     'What would my warning have had to name for someone to make space for it?']),
  comparison('city-from-a-window','What disappears when you see a city from above?',
    researchRecord('83.2.19'),presentationRecord('XX1991.13'),
    'Futurama offers a view over a city. An architectural fantasy singles out one house on a steep hillside.',
    'The titles and checklist support a comparison of viewpoints. They do not identify the same city or architect.',
    ['From above, I can give you the whole city in a glance. Pick a house. What would you want to know?',
     'Mine stands on a steep hillside. Put down the plan for a moment. How would you get home with a bag in each hand?',
     'I was about to point out the road. Now I’m looking for the last few steps to the door.']),
  comparison('terms-of-entry','What does an invitation actually give you?',
    researchRecord('XC2024.03.1.1'),presentationRecord('TD1989.317.66'),
    'A Harlem fair invitation and an exhibition lottery address the reader in different ways.',
    'Neither record identifies an individual who attended both exhibitions or won the lottery.',
    ['Harlem, I’m inviting you to the fair. My words can offer a place to go. Who can actually make the trip?',
     'You can keep my lottery ticket without seeing a thing in the exhibition. What does your invitation give someone who can’t get through the door?',
     'If we wanted to know who actually walked through the doors, whose paper would we ask to see next?']),
  comparison('date-on-tomorrow','Who gets to put a date on the future?',
    researchRecord('83.2.19'),presentationRecord('84.4.157'),
    'A 1939 fair attraction imagines tomorrow. Another object puts 1939 in its title.',
    'A year in a title does not establish the object’s production date or a connection to the fair.',
    ['I’m the page that puts a future city in front of you. Shall I put a year on its entrance sign?',
     'My title already says 1939 A.D. If you put a year over your entrance, somebody who reads it later might call your tomorrow the past.',
     'Then leave the sign unwritten for a moment. I’ve drawn a future in words and pictures. You’ve made me wonder who gets to date it.']),
  comparison('fair-counts','Who gets counted at a fair?',
    researchRecord('XC2024.03.1.1'),presentationRecord('XX1990.2870'),
    'An invitation issued by Harlem Hospitality Tours and a title announcing the tenth Utrecht Fair count a public gathering in different ways.',
    'The records identify separate fairs. They supply no shared attendance list.',
    ['Say my first word aloud: Harlem. Before you even reach the fair, you know who is doing the inviting.',
     'Say mine: tenth. I can tell you how many fairs that number asks you to remember. It tells you nothing about who walked in.',
     'Suppose we counted the invitations that never got an answer. Would that change your picture of a successful fair?']),
  comparison('heel-and-working-day','Where does a working day leave its mark?',
    presentationRecord('TD1989.317.66'),presentationRecord('XX1990.3277'),
    'A lottery names an exhibition of women’s labor. A branded heel offers an everyday way to ask what work leaves visible.',
    'The public titles identify the exhibition lottery and Pirelli heels. They establish no wearer, occupation or link between the objects.',
    ['My lottery names an exhibition of women’s labor. If a whole day’s work had to fit in a small case, which trace would you put in first?',
     'Give me a brand-new heel and a worn one. Set them side by side. Which one tells you how somebody spent the day?',
     'The worn one makes me curious. But I’d leave space in the case for its owner to correct my guess.']),
  comparison('permission-to-rise','Who has the power to let something rise?',
    researchRecord('83.6.2'),presentationRecord('83.4.40'),
    'A rejected proposal for a fair sculpture meets an object whose title begins with the word “Let.”',
    'The checklist records the sculpture’s rejection. The other title supplies no evidence that its maker addressed the same organizers.',
    ['I was meant to stand in public. The fair organizers turned me down. Read me the first word of your title.',
     '“Let.” Try saying “Let the Living Rise” twice: once as the person asking, once as the person who can grant permission.',
     'I heard two different voices. Which one would you have given the wall label to?']),
  comparison('catalogue-meets-engine','Who gets to call an age the Machine Age?',
    publicPacketRecord('XM1999.108.8'),presentationRecord('85.4.64.43'),
    'The 1927 Machine Age Exposition catalogue meets an artwork titled Making the Engine. The comparison contrasts a cultural category with the work named in the print.',
    'The public packet identifies the catalogue and its cover attribution, not the text of its essays. Neither source establishes who built an engine or attended the exposition.',
    ['I am a catalogue for the Machine Age Exposition. Before anyone opens me, my title has already declared an era.',
     'My title is Making the Engine. Declaring an era is easy to print; making an engine sounds like something somebody must do.',
     'You make my title sound unfinished. Which hands or pages would we need to examine before agreeing about the age?']),
  comparison('radio-meets-futurama','Can you change the channel on tomorrow?',
    publicPacketRecord('XX1990.1484'),researchRecord('83.2.19'),
    'The Sparton 558-C is a 1937 radio; the published checklist describes Futurama’s narrated journey over an imagined city at the 1939 fair.',
    'No public packet establishes this radio’s actual listeners, tuning habits or association with the General Motors exhibit.',
    ['Turn the dial and you can change stations. On your Futurama page, who gets to change where the story goes?',
     'My spread can give the city an order. You can turn the page, but who in the city gets to talk back to the story I tell?',
     'That’s it. The dial gives my listener a choice of stations. It doesn’t give anyone a go at the microphone.']),
  comparison('globe-and-theme-center','How much of a world fits inside an object?',
    publicPacketRecord('85.7.383a,b'),publicPacketRecord('86.17.1'),
    'A 1932 globe-shaped stoneware vase meets a model of the Trylon and Perisphere, designed for the 1939 fair’s Theme Center.',
    'The two public packets document distinct objects and materials. They do not establish a shared exhibition, audience or design influence.',
    ['You can turn my stoneware world in your hands. What does yours let me see when I get up close?',
     'I’m a model of a fair’s Theme Center. Come closer and two great shapes fit inside your view. What would you need to see beyond them?',
     'The edge, for one. You changed the scale and I can still ask whose world fits inside.']),
  comparison('catalogue-and-globe','Who gets named when we call a design modern?',
    publicPacketRecord('XM1999.108.8'),publicPacketRecord('85.7.383a,b'),
    'The Machine Age Exposition catalogue proposes a broad category. The Mappemonde vase’s public packet names separate form, décor and decoration roles.',
    'The catalogue packet does not quote its essays or connect its exhibition to the vase; the vase packet does not establish its reception or exhibition placement.',
    ['My cover can gather many objects under the phrase Machine Age. Is that enough to explain who made them?',
     'My public record names a form designer, a décor designer and a decorator. A single label would make those different tasks disappear.',
     'Then my category may need a footnote rather than a slogan. Whose names should a visitor look for before calling something modern?']),
  comparison('poster-and-theme-center','Can a poster invite you into a future that has not happened yet?',
    publicPacketRecord('85.4.72'),publicPacketRecord('86.17.1'),
    'An offset-lithograph poster designed in 1937 depicts people lining up for the Trylon and Perisphere, while the theme-center model represents the fair’s structures.',
    'The published checklist describes the poster’s scene and the model. It does not establish whether viewers of the poster attended the fair or how the design shaped their decisions.',
    ['I put a fair in my title before its gates could open. How do you invite a crowd to a place it can’t visit yet?',
     'Give it a shape to look for. My model can make the Trylon and Perisphere imaginable without naming a single person who came.',
     'Then my advance invitation and your model can tell someone where to look. To count arrivals, we’d have to open a different record.']),
  comparison('radio-and-television','When does a household become an audience?',
    publicPacketRecord('2012.6.1'),publicPacketRecord('XX1990.1484'),
    'A 1939 RCA Victor TRK 12 television and a 1937 Sparton 558-C radio offer two designed forms for receiving media in domestic interiors.',
    'The packets establish designers, dates and materials, but no shared owner, broadcast schedule, specific audience or household use.',
    ['A picture as well as a voice. Would that make everybody in the room my audience?',
     'Hold on. Turn my dial and you choose a station. Hearing a voice doesn’t tell you who in the room was listening.',
     'Fair. But if my screen helps everybody look the same way, does anybody get to answer back?',
     'Same trouble here. The dial lets you tune in. It doesn’t hand you the microphone.',
     'So a cabinet can offer a picture. A household still decides who gets to watch and who gets heard.',
     'I’d want to hear from someone who was in the room. What would they say we left out?']),
  comparison('poster-and-program','Who gets to say the future is open?',
    publicPacketRecord('85.4.72'),publicPacketRecord('86.19.57'),
    'The 1937 promotional poster projects a crowd toward the fair; the 1939 Your World of Tomorrow program belongs to the Theme Center presentation.',
    'The public packets do not identify poster viewers, attendees, full program text, or evidence that a specific visitor read both items.',
    ['Come see the world I’m advertising. I can invite a crowd onto paper. Who can actually get to the fair?',
     'I am a program called Your World of Tomorrow. My title can address a reader directly; it cannot prove that every person was equally welcomed.',
     'I can make it look open to everybody. Put that promise beside an itinerary or a ticket and let’s see what a visit required.']),
  comparison('television-and-booklet','Can tomorrow survive being turned into a souvenir?',
    publicPacketRecord('2012.6.1'),publicPacketRecord('XB1992.1640'),
    'The RCA Victor TRK 12 is dated 1939; the General Motors Futurama booklet is dated 1940 and associated with the fair exhibit.',
    'The museum packets do not establish owners, actual viewers, whether the television broadcast the exhibit, or any personal encounter with the booklet.',
    ['I can bring a picture and a voice into a room. When the set goes dark, what can you take with you?',
     'I’m a Futurama booklet. Slip me into a bag and you can carry a piece of tomorrow home. Does that make it any easier to tell what you were promised?',
     'You can reopen a booklet. I’ll grant you that. What a viewer actually saw would take their account, and we don’t have one here.']),
  comparison('program-and-booklet','When does a promise become a souvenir?',
    publicPacketRecord('86.19.57'),publicPacketRecord('XB1992.1640'),
    'A 1939 program titled Your World of Tomorrow, associated with the fair’s Theme Center, meets a 1940 Futurama booklet associated with the separate General Motors exhibit. Both frame the future as an experience, but their public records document different publications.',
    'The packets do not establish a shared reader, visit, distribution path, reception, or historical interaction between these printed works; the full program text is not available here.',
    ['My 1939 title addresses the reader directly: Your World of Tomorrow. How do you decide when a printed future belongs to you?',
     'My 1940 cover says Futurama. I can travel home as a booklet, but being kept does not prove any promised tomorrow arrived.',
     'Then a program and a souvenir may preserve two versions of a future without proving either was shared. Whose itinerary or first-hand account could test that claim?'])
];

export const CURATORIAL_PATHS = Object.freeze([...PATH_DRAFTS,...BRIDGES].map(path => scene({
  ...path,
  edge: edgeFor(path.id, path.source, path.target),
})));

export function pathById(id) {
  return CURATORIAL_PATHS.find(path => path.id === id) || null;
}

export function juxtapositionConversation(path) {
  if (!path || path.relationshipType !== 'curatorial_juxtaposition') throw new Error('Select a curatorial juxtaposition.');
  return {
    id: path.id,
    mode: 'CURATORIAL_JUXTAPOSITION',
    relationshipType: 'curatorial_juxtaposition',
    researchPreview: true,
    aiAssisted: Boolean(path.aiAssisted),
    editorialStatus: 'research_preview',
    historicalRelationshipEstablished: false,
    dramaticArc: path.arc,
    nextPrompt: '',
    source: path.source.accession,
    target: path.target.accession,
    proposal: path.proposal,
    limits: path.limits,
    evidence: [],
    turns: path.turns.map(turn => ({
      role: turn.role,
      speaker: turn.speaker,
      text: turn.text,
      citations: [],
      kind: turn.kind,
    })),
  };
}
