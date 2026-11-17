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
        "text": "My title calls munitions work skilled. Why does the word skilled need to be announced?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.317.66",
        "text": "My title advertises a lottery tied to an exhibition of women's labor. Is making work visible the same as valuing the people who do it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The records share the Women motif and Labor theme. They do not establish a common workforce, audience, or historical collaboration.",
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
        "text": "I tie skilled work to munitions. Does the job become visible, or only the national need for it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1990.340.141",
        "text": "I announce an exhibition called The Woman 1813–1913. Who decides which kinds of work deserve a public exhibition?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The Women motif connects these records. Their different dates and purposes are grounds for comparison, not proof of a shared cause.",
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
        "text": "Skilled work appears in my title. Can production be celebrated without naming the people doing it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "I am titled Making the Engine. What happens when a machine becomes the hero of the image, rather than the act of making it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The Factories motif is shared. It does not establish the same factory, workers, or a connection between the makers of these prints.",
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
        "text": "My title asks the viewer to notice skilled work on munitions.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.4091",
        "text": "My title asks people to vote for a workers' party. When does being pictured as labor become having a political voice?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories is the shared motif. We can compare the requests these titles make without claiming a common movement or campaign.",
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
        "text": "My 1917 title names munitions as skilled work. Does a wartime need change how skill is celebrated?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "I am titled 1939 A.D. What does that date do to the earlier image's confidence in work and progress?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Labor is the common category. The records' dates establish distance, not a documented causal chain.",
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
        "text": "My title stays close to the work of making munitions.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990. 3722",
        "text": "My title places a Savoia-Marchetti aircraft above Rome's Colosseum. What changes when technical power is seen from above rather than from the workshop?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "War / Military is the shared category. It does not place the two images in one program, conflict, or propaganda campaign.",
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
        "text": "Making the Engine is my title. Does the act of making disappear when the engine becomes the subject?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.318.1",
        "text": "My warning says one splinter can cost an eye. What is progress worth if the worker's body carries the risk?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Machines is the shared motif. That justifies comparison, not a claim that the two images depict the same industry, location, or incident.",
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
        "text": "My title instructs viewers to vote for a workers' party. Can an image speak for labor?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "I depict engine-making by title. What is the difference between showing people working and hearing what they demand?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories is the repeated motif, not a proven relation between the parties, artists, or workers represented.",
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
        "text": "My title names 1939 A.D. Can a year stand in for a prediction about what comes next?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.2907",
        "text": "Mine insists that 1943 is not 1918. Why would a poster need to argue with a previous year?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The Political symbols motif links the records. Nothing here proves a shared speaker, ideology, or direct historical response.",
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
        "text": "My title says The Effect of Our U-Boats. Who is invited into that word our?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "Mine names 1939 A.D. Does a date address everyone equally, or a particular imagined public?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Political symbols is a staff-assigned connection. This is a comparison of how titles speak, not a common campaign.",
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
        "text": "My record names Paul Robeson. Why should I be connected to an architectural fantasy?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1991.13",
        "text": "My record describes a house on a steep hillside. Is the shared Trees motif enough for us to claim a conversation?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "No documented historical relationship is established. Trees is a metadata overlap. This might be a useful failed hypothesis, not a meaningful historical edge.",
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
        "text": "I announce an international exhibition of contemporary art. What makes an image appear worthy of attention?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3275",
        "text": "My title advertises a dye. What happens when a similar mythological motif enters an industrial advertisement?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Mythological figures is the shared motif. Resemblance does not establish copying, influence, or a shared designer.",
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
        "text": "My title demands that the East Indies be free and urges people to work and fight for it. Who is being summoned?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "My title gives us a year, 1939. Can a date answer a later political demand?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Flags is the shared motif. Do not merge these distinct political contexts or infer ideological alignment.",
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
        "text": "I announce the 10th Utrecht Fair. Why has this graph connected me to Let the Living Rise?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "83.4.40",
        "text": "The metadata says we share Water. But what do our titles actually tell us about a common purpose?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Not enough. A repeated motif does not establish intention, contact, or a historical relationship. The proposed edge remains unproven.",
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
        "text": "My title describes an invader's grasp and a threat of enslavement. What future is being feared?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "I am titled 1939 A.D. Can a future be an expectation for one audience and a danger for another?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Flags is the shared category. It does not support a claim that the two works spoke to the same event or audience.",
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
        "text": "My title promotes Pirelli heels. Can an image make a commercial object seem extraordinary?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.25.1",
        "text": "I announce a biennial exhibition. Why would the same motif appear in a product image and an art exhibition poster?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The shared Mythological figures tag creates a comparison. It does not establish borrowing, influence, or collaboration.",
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
