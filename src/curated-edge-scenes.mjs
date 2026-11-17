/**
 * Draft editorial scene registry for Nov 19 internal curatorial review.
 * These are fictional, artist-authored statements and questions, not
 * archival testimony. Titles, dates and shared tags were inspected in the
 * repository's existing 76-record matched view; no museum rights are granted.
 * This file does not change the running interaction until explicitly wired.
 */
export const CURATED_EDGE_SCENES = Object.freeze([
  {
    "id": "opening-skilled-work-lottery",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "TD1989.317.66",
    "family": "motif",
    "tag": "Women",
    "arc": "Who gets credit for labor?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "They call me Skilled Work, as if a title could pay a worker. I can name a task. Can I give anyone credit?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.317.66",
        "text": "I advertise a lottery at an exhibition of women's labor. A prize can draw a crowd. What keeps the labor visible after the draw?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The index connects us through Women and Labor. It does not say who was paid, named, or whether our audiences ever overlapped.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which source could tell us who was paid, named, or invited?",
    "editorialNote": "Start with this pair: two different ways of staging and recognizing women's work.",
    "pair": [
      "85.4.64.34",
      "TD1989.317.66"
    ],
    "requires": {
      "family": "motif",
      "value": "Women",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "opening-skilled-work-woman-exhibition",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "TD1990.340.141",
    "family": "motif",
    "tag": "Women",
    "arc": "Who gets represented as the worker?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "I insist on the word skilled. Is that a portrait of the worker, or a way to praise what the worker produces?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1990.340.141",
        "text": "My title compresses The Woman 1813–1913 into an exhibition. A century can fit on a poster. What work disappears between the dates?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The index assigns both records the Women motif. That invites comparison, not a claim of shared organizers, audiences, or lives.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What would their actual captions reveal about the intended audiences?",
    "editorialNote": "Do not turn the two exhibition or production contexts into one historical narrative.",
    "pair": [
      "85.4.64.34",
      "TD1990.340.141"
    ],
    "requires": {
      "family": "motif",
      "value": "Women",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "opening-skilled-work-engine",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "85.4.64.43",
    "family": "motif",
    "tag": "Factories",
    "arc": "What does making hide?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "I ask you to notice skilled work. But when you leave, will you remember the worker—or only the object made?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "I am titled Making the Engine, not The Engine. If the verb matters, why does the machine so often take the bow?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories appears in both records' metadata. That does not place us in the same workshop or name the hands behind either image.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which record would identify an actual worker behind either image?",
    "editorialNote": "Same-era production imagery; do not infer direct artist influence.",
    "pair": [
      "85.4.64.34",
      "85.4.64.43"
    ],
    "requires": {
      "family": "motif",
      "value": "Factories",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "opening-skilled-work-workers-vote",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "XX1990.4091",
    "family": "motif",
    "tag": "Factories",
    "arc": "Representation versus agency",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "I make skilled work available to admire. You can admire workers without asking them a single question.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.4091",
        "text": "My title doesn't ask you to admire workers. It asks you to vote for a workers' party. But who authorizes a poster to speak for workers?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories is the shared motif. Neither record alone shows what workers thought of these images, or whether their makers shared a political cause.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Whose voice is centered in each publication?",
    "editorialNote": "Keep political interpretation critical and nonpartisan; avoid claiming artist endorsement.",
    "pair": [
      "85.4.64.34",
      "XX1990.4091"
    ],
    "requires": {
      "family": "motif",
      "value": "Factories",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "opening-skilled-work-1939",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "84.4.157",
    "family": "theme",
    "tag": "Labor",
    "arc": "A future separated by twenty-two years",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "I speak from 1917 and call munitions work skilled. Does that word sound different when another image invokes 1939?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "I am called 1939 A.D. A year can be a date, a warning, a promise. My title alone cannot tell you which.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Labor is our shared category. The dates establish distance, not that one image predicted, answered, or influenced the other.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What contemporary account from 1939 would change this reading?",
    "editorialNote": "A temporal juxtaposition, not historical continuity.",
    "pair": [
      "85.4.64.34",
      "84.4.157"
    ],
    "requires": {
      "family": "theme",
      "value": "Labor",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "opening-skilled-work-aircraft",
    "group": "opening",
    "a": "85.4.64.34",
    "b": "XX1990. 3722",
    "family": "theme",
    "tag": "War / Military",
    "arc": "From production floor to aerial spectacle",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "My title names munitions work. What is made here can travel far beyond the workshop, but whose labor travels with its story?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990. 3722",
        "text": "My title places an aircraft above Rome's Colosseum. From that altitude, who can you still see: the pilot, the engineers, the people carrying parts?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "War / Military is the shared category. It is not evidence of one factory, conflict, political purpose, or shared production network.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What does each viewpoint invite us to see—and not see?",
    "editorialNote": "The flying-over-Colosseum wording comes from its catalogue title, not a reviewed photograph.",
    "pair": [
      "85.4.64.34",
      "XX1990. 3722"
    ],
    "requires": {
      "family": "theme",
      "value": "War / Military",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "machines-engine-safety",
    "group": "chapter",
    "a": "85.4.64.43",
    "b": "TD1989.318.1",
    "family": "motif",
    "tag": "Machines",
    "arc": "The machine meets the body",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.43",
        "text": "My title is Making the Engine. It invites you to look at an achievement. Who is missing if achievement becomes the entire story?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.318.1",
        "text": "My warning says one splinter can cost an eye. The machine is not the only thing produced here; work can produce risk too.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Machines is our shared motif, not a documented workplace or incident. A safety record might test this argument better than an image can.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which safety record or workplace account would complicate the picture?",
    "editorialNote": "A key dramatic counterweight: productivity vs. bodily risk.",
    "pair": [
      "85.4.64.43",
      "TD1989.318.1"
    ],
    "requires": {
      "family": "motif",
      "value": "Machines",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "machines-vote-engine",
    "group": "chapter",
    "a": "XX1990.4091",
    "b": "85.4.64.43",
    "family": "motif",
    "tag": "Factories",
    "arc": "Labor as political address",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.4091",
        "text": "I call for a workers' vote. A command on paper is cheap. Who gets to speak when the poster stops speaking?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "My title is Making the Engine. An image can show work without letting a worker answer back. Is that difference visible to you?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The index gives us Factories in common, not the same makers, workers, or audience. A worker's account could change what we think we see.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What would a contemporaneous worker's account add?",
    "editorialNote": "Political poster is an address to a viewer; title evidence does not establish reception.",
    "pair": [
      "XX1990.4091",
      "85.4.64.43"
    ],
    "requires": {
      "family": "motif",
      "value": "Factories",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "politics-1939-atlantic-wall",
    "group": "chapter",
    "a": "84.4.157",
    "b": "XX1990.2907",
    "family": "motif",
    "tag": "Political symbols",
    "arc": "Dates deployed as arguments",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "84.4.157",
        "text": "I am 1939 A.D.: a date suspended like a question. Do you read me as a memory, a forecast, or a warning?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.2907",
        "text": "I insist that 1943 is not 1918. I ask one year to argue with another. What can a date make an audience remember?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Political symbols links our records in the index. It does not prove that one image answered the other, or that both addressed the same public.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Who was being addressed by each date?",
    "editorialNote": "Do not conflate disparate political contexts.",
    "pair": [
      "84.4.157",
      "XX1990.2907"
    ],
    "requires": {
      "family": "motif",
      "value": "Political symbols",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "politics-uboats-1939",
    "group": "chapter",
    "a": "XX1990.3843",
    "b": "84.4.157",
    "family": "motif",
    "tag": "Political symbols",
    "arc": "Whose collective future?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.3843",
        "text": "My title says Our U-Boats. One small word places you inside a group before you know who drew its borders.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "I have no our. Only a year: 1939 A.D. Who is allowed to claim its future?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Political symbols is our shared index motif. Nothing here establishes the same publisher, political purpose, or intended audience.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Can a source identify the original intended audiences?",
    "editorialNote": "Treat wartime publicity as an object of analysis, not a statement to endorse.",
    "pair": [
      "XX1990.3843",
      "84.4.157"
    ],
    "requires": {
      "family": "motif",
      "value": "Political symbols",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "challenge-robeson-architectural-fantasy",
    "group": "chapter",
    "a": "84.4.66",
    "b": "XX1991.13",
    "family": "motif",
    "tag": "Trees",
    "arc": "When the algorithm should doubt itself",
    "mode": "question_edge",
    "turns": [
      {
        "speakerAccession": "84.4.66",
        "text": "My record names Paul Robeson. Why am I in this conversation? A Trees keyword cannot tell you the story of his life.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1991.13",
        "text": "My record describes a house on a steep hillside. The index found a tree; did it find any reason for us to speak?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Only the Trees motif links these records here. No historical relationship has been established. The visitor can reject the edge.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Keep the comparison as a question, or withdraw this edge?",
    "editorialNote": "Intentional failed match; do not coerce emotional or racial meaning from a tree tag.",
    "pair": [
      "84.4.66",
      "XX1991.13"
    ],
    "requires": {
      "family": "motif",
      "value": "Trees",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "commerce-biennale-dye",
    "group": "chapter",
    "a": "84.4.25.1",
    "b": "XX1990.3275",
    "family": "motif",
    "tag": "Mythological figures",
    "arc": "Images move between art and commerce",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "84.4.25.1",
        "text": "I announce an international exhibition of contemporary art. What makes an image worthy of a wall—and who gets to decide?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3275",
        "text": "My title sells a dye. If a mythological motif moves from an exhibition to an advertisement, does its meaning follow it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The index marks Mythological figures in both records. Inspect the images before arguing resemblance; resemblance alone cannot prove influence.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What changes when an image persuades a consumer rather than an exhibition visitor?",
    "editorialNote": "Require visual check before stating motif's form or composition.",
    "pair": [
      "84.4.25.1",
      "XX1990.3275"
    ],
    "requires": {
      "family": "motif",
      "value": "Mythological figures",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "politics-east-indies-1939",
    "group": "chapter",
    "a": "TD1990.340.146",
    "b": "84.4.157",
    "family": "motif",
    "tag": "Flags",
    "arc": "Who has a claim on the future?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "TD1990.340.146",
        "text": "My title demands freedom for the East Indies and calls people to work and fight. Is its audience being addressed—or enlisted?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "Mine doesn't issue a command. It names 1939 A.D. Yet even a date can invite expectations. Whose expectations?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Flags is the shared index motif. These titles do not establish a common political context, audience, or cause.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What would each object's publisher and audience clarify?",
    "editorialNote": "Sensitive political histories require verified context before specific interpretive claims.",
    "pair": [
      "TD1990.340.146",
      "84.4.157"
    ],
    "requires": {
      "family": "motif",
      "value": "Flags",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "challenge-utrecht-living-rise",
    "group": "chapter",
    "a": "XX1990.2870",
    "b": "83.4.40",
    "family": "motif",
    "tag": "Water",
    "arc": "A false-looking bridge",
    "mode": "question_edge",
    "turns": [
      {
        "speakerAccession": "XX1990.2870",
        "text": "I announce the 10th Utrecht Fair. The graph says Water. What, exactly, should I say to Let the Living Rise?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "83.4.40",
        "text": "My title says Let the Living Rise. A repeated motif doesn't explain our purposes. Is this an accidental introduction?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Water is a metadata overlap, not proof of a shared audience, maker, or intention. This edge might need to be withdrawn.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Would you inspect the objects further—or reject this connection?",
    "editorialNote": "A deliberately self-critical match, useful as the machine recognizing its limits.",
    "pair": [
      "XX1990.2870",
      "83.4.40"
    ],
    "requires": {
      "family": "motif",
      "value": "Water",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "politics-invader-1939",
    "group": "chapter",
    "a": "XX1990.2880",
    "b": "84.4.157",
    "family": "motif",
    "tag": "Flags",
    "arc": "Future promised or threatened",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.2880",
        "text": "My title imagines an invader's grasp and the threat of enslavement. Fear does persuasive work here. Whose fear—and for whom?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "I give you 1939 A.D. without saying promise or warning. Do you read the future from my title, or from your hindsight?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The index connects these records through Flags, not a verified event, campaign, or audience. The difference matters.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Whose perspective would another document restore?",
    "editorialNote": "Do not attribute politics beyond title and checked sources.",
    "pair": [
      "XX1990.2880",
      "84.4.157"
    ],
    "requires": {
      "family": "motif",
      "value": "Flags",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  },
  {
    "id": "commerce-heels-biennale",
    "group": "chapter",
    "a": "XX1990.3277",
    "b": "84.4.25.1",
    "family": "motif",
    "tag": "Mythological figures",
    "arc": "A shared figure, two kinds of attention",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.3277",
        "text": "I advertise Pirelli heels. I offer desire as something you might wear. What would make you want it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.25.1",
        "text": "I announce a biennial exhibition. I ask you to treat what you see as art. How far apart are our requests?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Mythological figures is our shared tag. Without examining the original images, borrowing, influence, and shared design remain unproven.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What does the motif ask different viewers to desire?",
    "editorialNote": "Visual motif must be checked before claims about its appearance.",
    "pair": [
      "XX1990.3277",
      "84.4.25.1"
    ],
    "requires": {
      "family": "motif",
      "value": "Mythological figures",
      "kind": "shared_staff_metadata"
    },
    "status": "EDITORIAL_DRAFT_NOT_APPROVED",
    "historicalRelationshipEstablished": false
  }
]);

const normal=value=>String(value??'').trim().replace(/\s+/g,'').replace(/[–—]/g,'-').toUpperCase();
const key=(a,b)=>[normal(a),normal(b)].sort().join('::');
const byKey=new Map(CURATED_EDGE_SCENES.map(scene=>[key(...scene.pair),scene]));
export function sceneForConfirmedEdge(sourceAccession,targetAccession,reasons=[]) {
  if(normal(sourceAccession)===normal(targetAccession))return null;
  const scene=byKey.get(key(sourceAccession,targetAccession));
  if(!scene || !Array.isArray(reasons) ||
    !reasons.some(reason=>reason.family===scene.requires.family && reason.value===scene.requires.value))return null;
  const source=normal(sourceAccession),target=normal(targetAccession);
  return {
    ...scene,
    turns:scene.turns.map(turn=>({
      ...turn,
      role:turn.speakerAccession==='archivist'?'archivist':
        normal(turn.speakerAccession)===source?'objectA':
        normal(turn.speakerAccession)===target?'objectB':'unknown'
    }))
  };
}
