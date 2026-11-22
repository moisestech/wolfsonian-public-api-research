/**
 * Relationship labels for the research preview.
 * A shared tag stays a metadata overlap. A juxtaposition is an authored
 * comparison. A documented historical relationship would need reviewed
 * evidence of contact, and this set has none.
 */
import { PRESENTATION_PAIRS } from './presentation-pairs.mjs';
import { WORLDS_FAIRS_RESEARCH } from './worlds-fairs-research.mjs';
import { sceneVoiceBrief, listenerReflection, accessionKey } from './conversation-voices.mjs';

const PATH_FOLLOW_UP = Object.freeze({
  'who-narrates-tomorrow':'Follow the Harlem invitation. How does an organizer’s route change the view from above?',
  'which-future-is-refused':'Look again at the maquette. What does an unbuilt warning ask of the fair’s emblem?',
  'who-builds-the-future':'Return to the hands in the sculpture. What does the word “skilled” add to that view?',
  'cost-of-iron':'Change your distance from the tower to the eye. Which detail makes you pause?',
  'room-for-a-warning':'Compare the two warnings: what can each name, and what answer is missing?',
  'city-from-a-window':'Follow the hillside house. Where does the grand plan become an ordinary journey?',
  'terms-of-entry':'Inspect the invitation and the lottery separately. What does each actually offer?',
  'date-on-tomorrow':'Read 1939 A.D. beside the imagined city. What does that year make you reconsider?',
  'fair-counts':'Stay with “Harlem” and “tenth.” What kind of public does each word ask you to count?',
  'heel-and-working-day':'Inspect the heel as an object of commerce. What would be needed to read a working day into it?',
  'permission-to-rise':'Say “Let” as a request, then as permission. Which reading changes the maquette?',
  'catalogue-meets-engine':'Open the category “Machine Age” beside the task “Making.” Where does the title stop explaining?',
  'radio-meets-futurama':'Follow the radio. What is the difference between receiving a voice and choosing the route?',
  'globe-and-theme-center':'Inspect the edge of the model and the surface of the vase. What does each scale leave outside?',
  'catalogue-and-globe':'Follow the named design roles on Mappemonde. Which distinctions should survive a broad era label?',
  'poster-and-theme-center':'Return to the pictured queue. What changes when you treat that crowd as an invitation?',
  'radio-and-television':'Compare the devices as receivers. What would let a listener or viewer answer back?',
  'poster-and-program':'Read the program’s “your” against the poster’s crowd. Who is being addressed?',
  'television-and-booklet':'Follow the booklet. What can be carried away that a picture alone cannot establish?',
  'program-and-booklet':'Keep the invitation beside the souvenir. When would you say the promise had been kept?',
});

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

const PATH_LANGUAGE_REVISIONS = Object.freeze({
  "who-narrates-tomorrow": [
    "Keep your eyes on the city. The narration will explain the route—unless you have a question?",
    "We’re doing the inviting from Harlem. Your route may be impressive, but it doesn’t decide where our questions begin.",
    null
  ],
  "which-future-is-refused": [
    "I was a warning against authoritarian aggression. The fair turned the proposal down. Apparently there wasn’t room.",
    "I give that fair an emblem. You make me wonder what an emblem fails to show when a warning stays unbuilt.",
    null
  ],
  "who-builds-the-future": [
    "Admire the height, by all means. I show workers raising the iron of the Eiffel Tower. Look for the hands.",
    "Skilled Work. I put the compliment into words. You make me ask whether the people doing it get more than a heading.",
    null
  ],
  "catalogue-meets-engine": [
    "Machine Age. An entire era before you’ve even opened the catalogue. Efficient, isn’t it?",
    "Making the Engine. A less sweeping title. Somebody still has to do the making.",
    "Quite. You’ve turned my heading back into a question. Which work would we need to inspect before agreeing about the age?"
  ],
  "radio-meets-futurama": [
    "A voice comes in; a dial gives you a choice. Your narration sounds harder to interrupt.",
    "My attraction carries visitors above an imagined city. The route and narration do rather a lot of the choosing.",
    "Then changing the station would only be a start. Who gets to answer the plan?"
  ],
  "poster-and-theme-center": [
    "Quite a queue, isn’t it? Printed in 1937, with the fair still two years away. I can draw a crowd ahead of time.",
    "And I can give that pictured crowd a destination: the Trylon and Perisphere. Neither of us can name who actually came.",
    "You’re right. I made an invitation look like an arrival. Let’s keep that difference in view."
  ],
  "poster-and-program": [
    "Look at the line I’ve drawn toward the fair. It makes the invitation seem popular already.",
    "Your World of Tomorrow. I make it seem personal. A crowd in a picture cannot tell either of us who felt invited.",
    "Then the people in my picture cannot answer for the public. I’d want to hear from someone who crossed the threshold."
  ],
  "television-and-booklet": [
    "A picture as well as sound. I can make an experience seem close. What do you offer after the display?",
    "Futurama, in a booklet. Something you could hold. Being able to carry the promise away doesn’t mean it came true.",
    "No. And I cannot tell you I showed your exhibit. We’d need an actual account of how either experience was received."
  ],
  "date-on-tomorrow": [
    "A city still ahead of the visitor. What year would you put on that entrance sign?",
    "1939 A.D. I already have a year in my title. It doesn’t settle what your tomorrow will become.",
    "Leave the sign there a moment. I want to hear how that year sounded to someone living through it."
  ],
  "terms-of-entry": [
    "An invitation to visit the fair. Mind you, an invitation still leaves the journey to be made.",
    "A chance in a lottery. I leave rather a lot to chance, too. A ticket could be kept without its holder ever seeing the exhibition.",
    "Then neither piece of paper gets to count as a visit. Whose itinerary could tell us what happened after the invitation?"
  ]
});

function scene(path) {
  const revision=PATH_LANGUAGE_REVISIONS[path.id];
  return Object.freeze({
    ...path,
    followUp:PATH_FOLLOW_UP[path.id]||path.arc,
    turns:revision?Object.freeze(path.turns.map((turn,index)=>Object.freeze({...turn,text:revision[index]||turn.text}))):path.turns,
    languageRevision:revision?'object-voices-v2':['radio-and-television','program-and-booklet','catalogue-and-globe','globe-and-theme-center'].includes(path.id)?'object-voices-v1':null,
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
        text: 'I narrate a city from above while the visitor is carried past it. If this voice explains tomorrow, who is allowed to interrupt it?',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: 'XC2024.03.1.1',
        speaker: 'Harlem Invites You to Visit the New York World\'s Fair (leaflet)',
        text: 'I invite Harlem to the fair and name a route of our own. Your narration does not decide who is addressed, or which road we take.',
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
        text: 'I am the built emblem of that fair. Your refusal is not my story, and my silhouette does not answer for the warning that was turned away.',
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
        text: 'I show workers raising the iron of the Eiffel Tower. A monument to progress still has to account for the people who built it.',
        kind: 'ARTIST_AUTHORED_INTERPRETATION',
      }),
      Object.freeze({
        role: 'objectB',
        speakerAccession: '85.4.64.34',
        speaker: 'On Munitions: Skilled Work',
        text: 'My title has to announce that munitions work is skilled. If the future is made by hands, the announcement should not be the only place those hands appear.',
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
    ['The fair turned down my warning. Yours made it into print. Was it easier to ask someone to stop a wheel?',
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
    ['I invite you to visit a fair. You can read my words and still have a whole journey ahead of you.',
     'I offer a chance in a lottery. Someone could keep my ticket and never see the work named on it.',
     'If we wanted to know who actually walked through the doors, whose paper would we ask to see next?']),
  comparison('date-on-tomorrow','Who gets to put a date on the future?',
    researchRecord('83.2.19'),presentationRecord('84.4.157'),
    'A 1939 fair attraction imagines tomorrow. Another object puts 1939 in its title.',
    'A year in a title does not establish the object’s production date or a connection to the fair.',
    ['My visitors ride above a city that still lies ahead of them. What year would you put on the sign at the entrance?',
     'I already carry a date: 1939 A.D. Someone reading me today has to look backward to find it.',
     'Leave the sign there. I’d like to hear what someone who lived through that year would say over my narration.']),
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
    ['My ticket names an exhibition of women’s labor. If you had one small case to fill, what would you put in it?',
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
    ['My body is glass, brass, wood and Bakelite. A radio can receive a voice, but does that mean it can answer back?',
     'My visitors moved above an imagined city while a narration explained what they saw. Could they have changed the station?',
     'Changing a station is not the same as choosing the city. Who would get to talk back to your narrator?']),
  comparison('globe-and-theme-center','How much of a world fits inside an object?',
    publicPacketRecord('85.7.383a,b'),publicPacketRecord('86.17.1'),
    'A 1932 globe-shaped stoneware vase meets a model of the Trylon and Perisphere, designed for the 1939 fair’s Theme Center.',
    'The two public packets document distinct objects and materials. They do not establish a shared exhibition, audience or design influence.',
    [
  "You can turn me in your hands. That doesn’t put the world in them.",
  "Come closer. As a model, I make a fair’s Theme Center look manageable. Isn’t a change of scale useful?",
  "Useful, yes. Complete, no. A globe-shaped vase has a boundary, too.",
  "Then I’ve offered a way to look, not a whole world. What would you look for outside the model?",
  "The part the model leaves you wondering about. Which plan or description could help us inspect that edge?"
]),
  comparison('catalogue-and-globe','Who gets named when we call a design modern?',
    publicPacketRecord('XM1999.108.8'),publicPacketRecord('85.7.383a,b'),
    'The Machine Age Exposition catalogue proposes a broad category. The Mappemonde vase’s public packet names separate form, décor and decoration roles.',
    'The catalogue packet does not quote its essays or connect its exhibition to the vase; the vase packet does not establish its reception or exhibition placement.',
    [
  "An entire age, neatly titled. Machine Age. A heading has its uses.",
  "Very efficient. My record names a form designer, a décor designer and a decorator. Your title takes a shorter route.",
  "I was trying to bring things together. You’ve made me look at what the heading leaves out.",
  "Then keep the heading. Leave room for the names beside it.",
  "Agreed. Before we turn a label into an explanation, which page or maker’s record should we open?"
]),
  comparison('poster-and-theme-center','Can a poster invite you into a future that has not happened yet?',
    publicPacketRecord('85.4.72'),publicPacketRecord('86.17.1'),
    'An offset-lithograph poster designed in 1937 depicts people lining up for the Trylon and Perisphere, while the theme-center model represents the fair’s structures.',
    'The published checklist describes the poster’s scene and the model. It does not establish whether viewers of the poster attended the fair or how the design shaped their decisions.',
    ['I was printed in 1937, and I already show people lining up for a fair still two years away. I make a crowd appear before the crowd arrives.',
     'I am a model of the Trylon and Perisphere. I can give your imaginary queue a destination, but I cannot tell you who eventually stood in it.',
     'Then my line is not an attendance record. Whose photographs or tickets could put real people beside my imagined queue?']),
  comparison('radio-and-television','When does a household become an audience?',
    publicPacketRecord('2012.6.1'),publicPacketRecord('XX1990.1484'),
    'A 1939 RCA Victor TRK 12 television and a 1937 Sparton 558-C radio offer two designed forms for receiving media in domestic interiors.',
    'The packets establish designers, dates and materials, but no shared owner, broadcast schedule, specific audience or household use.',
    [
  "A picture as well as a voice. Surely that improves matters?",
  "Easy with the dial. Receiving a voice is one thing. Answering it is another.",
  "You think a picture might make that harder?",
  "I think it might make the speaker harder to ignore. That’s a different achievement.",
  "Then let’s find out who was watching. Have we got anything that names an audience?",
  "Not for either of these sets. Start with a listener’s account or a household record. I’d like to hear an answer."
]),
  comparison('poster-and-program','Who gets to say the future is open?',
    publicPacketRecord('85.4.72'),publicPacketRecord('86.19.57'),
    'The 1937 promotional poster projects a crowd toward the fair; the 1939 Your World of Tomorrow program belongs to the Theme Center presentation.',
    'The public packets do not identify poster viewers, attendees, full program text, or evidence that a specific visitor read both items.',
    ['My picture has a line of people approaching the structures, but their faces do not answer my question: who came?',
     'I am a program called Your World of Tomorrow. My title can address a reader directly; it cannot prove that every person was equally welcomed.',
     'I mistook a painted crowd for a public. What sort of record would tell us who actually crossed the threshold?']),
  comparison('television-and-booklet','Can tomorrow survive being turned into a souvenir?',
    publicPacketRecord('2012.6.1'),publicPacketRecord('XB1992.1640'),
    'The RCA Victor TRK 12 is dated 1939; the General Motors Futurama booklet is dated 1940 and associated with the fair exhibit.',
    'The museum packets do not establish owners, actual viewers, whether the television broadcast the exhibit, or any personal encounter with the booklet.',
    ['My record dates me to 1939, a television designed to present pictures. Which pictures someone saw through me remains an unanswered question.',
     'I am a Futurama booklet from 1940. You can hold me after the fair’s promised tomorrow, but holding a booklet is not the same as taking the ride.',
     'Then I should not invent a broadcast of your exhibit. What surviving account could tell us how either experience was actually received?']),
  comparison('program-and-booklet','When does a promise become a souvenir?',
    publicPacketRecord('86.19.57'),publicPacketRecord('XB1992.1640'),
    'A 1939 program titled Your World of Tomorrow, associated with the fair’s Theme Center, meets a 1940 Futurama booklet associated with the separate General Motors exhibit. Both frame the future as an experience, but their public records document different publications.',
    'The packets do not establish a shared reader, visit, distribution path, reception, or historical interaction between these printed works; the full program text is not available here.',
    [
  "Your world. Has a nice ring to it, doesn’t it?",
  "Fits nicely in a title. A future you can take home has its attractions.",
  "You make it sound like a sales pitch. I was offering an invitation.",
  "I’m a booklet for a General Motors exhibit. I can hardly object to a little promotion. I’m asking what the promise delivers.",
  "Then perhaps “your” is where the question begins. Whose account could tell us what that invitation meant?",
  "Find a reader’s account. Being kept as a booklet won’t tell you whether the promised tomorrow arrived."
])
];

export const CURATORIAL_PATHS = Object.freeze([...PATH_DRAFTS,...BRIDGES].map(path => scene({
  ...path,
  edge: edgeFor(path.id, path.source, path.target),
})));

export function pathById(id) {
  return CURATORIAL_PATHS.find(path => path.id === id) || null;
}

export function juxtapositionConversation(path, lensId='family') {
  if (!path || path.relationshipType !== 'curatorial_juxtaposition') throw new Error('Select a curatorial juxtaposition.');
  return {
    id: path.id,
    mode: 'CURATORIAL_JUXTAPOSITION',
    relationshipType: 'curatorial_juxtaposition',
    researchPreview: true,
    aiAssisted: Boolean(path.aiAssisted||path.languageRevision),
    voiceBrief: sceneVoiceBrief(path.source,path.target,lensId),
    listenerReflection:listenerReflection(path.source,path.target,lensId,path.arc),
    editorialStatus: 'research_preview',
    historicalRelationshipEstablished: false,
    dramaticArc: path.arc,
    nextPrompt: path.followUp,
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

/** Onward reading choices share exact object identities, never inferred historical contact. */
export function pathwayContinuations(pathId, limit=3) {
  const path=pathById(pathId);
  if(!path)return [];
  const ids=[path.source.accession,path.target.accession].map(accessionKey);
  const candidates=CURATORIAL_PATHS.filter(other=>other.id!==pathId).map(other=>({
    id:other.id,question:other.arc,
    sharedAccessions:[other.source.accession,other.target.accession].filter(id=>ids.includes(accessionKey(id))),
    kind:'ARTIST_AUTHORED_ROUTE',historicalRelationshipEstablished:false,
  })).filter(other=>other.sharedAccessions.length);
  // Offer a route through each side before adding more of either side.
  const chosen=[];
  for(const id of ids){const next=candidates.find(c=>!chosen.includes(c)&&c.sharedAccessions.some(a=>accessionKey(a)===id));if(next)chosen.push(next);}
  for(const candidate of candidates)if(!chosen.includes(candidate))chosen.push(candidate);
  return chosen.slice(0,Math.max(0,Math.min(6,Number.isFinite(limit)?Math.floor(limit):3)));
}
