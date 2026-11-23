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
        "text": "My title calls munitions work skilled. Why would someone need to say that out loud?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.317.66",
        "text": "Mine advertises a lottery linked to an exhibition of women's labor. Seeing work isn't the same as valuing it, is it?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.34",
        "text": "Maybe not. Even the word skilled could leave the people doing the work unnamed.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "The records share a Women motif and a Labor theme. They do not establish a shared workforce, audience, or collaboration.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.317.66",
        "text": "Then let's not give them a shared history. Who chose what the exhibition showed?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which source could tell us who was paid, named, or invited?",
    "editorialNote": "Start with this pair: two different ways of staging and recognizing women's work. Five-turn dramaturgical study: mutual challenge and correction. Fictional; not archival testimony.",
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
    "openingQuestion": "Whose work makes the machine?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "Skilled Work. That's in my title. I wonder who had to be convinced.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "Mine is Making the Engine. It names what is made, but not necessarily everyone making it.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.34",
        "text": "So showing production isn't the same thing as hearing from the workers.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories is the shared motif. Nothing here proves the same factory, workers, or a connection between the makers of these prints.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "Then what kind of worker's account would change the story we're telling?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which record would identify an actual worker behind either image?",
    "editorialNote": "Same-era production imagery; do not infer direct artist influence. Five-turn dramaturgical study: mutual challenge and correction. Fictional; not archival testimony.",
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
    "openingQuestion": "What changes when a print asks workers to vote?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "My title asks you to notice the skill it takes to make munitions. What happens after you've noticed?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.4091",
        "text": "I'd ask you to vote. Looking at workers and asking them to make a choice are two different invitations.",
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
    "openingQuestion": "What happens to the idea of progress between 1917 and 1939?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "My 1917 title calls making munitions skilled work. When the work is for war, what counts as progress?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "My title, 1939 A.D., gives you another year to look from. Does that word progress sound as confident twenty-two years later?",
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
    "openingQuestion": "What does power look like from a workshop and from the air?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.34",
        "text": "My title brings you close to the work of making munitions. That's where I'd look to see how power is made.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990. 3722",
        "text": "My title puts a Savoia-Marchetti aircraft above Rome's Colosseum. From up there, how much of the work that gets you into the air can you still see?",
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
    "openingQuestion": "Who pays the price of progress?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "85.4.64.43",
        "text": "Making the Engine. The title puts the machine first. Where did the hands go?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.318.1",
        "text": "Hold on. My warning says a splinter can cost an eye. The worker's body isn't an afterthought.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "You're right. I was asking about the image. You're asking what the work might cost.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Both records have the Machines motif. That does not place them in the same workshop, industry, or incident.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.318.1",
        "text": "Good. Keep us separate, but keep that question. What would an actual workplace account tell us?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "Which safety record or workplace account would complicate the picture?",
    "editorialNote": "A key dramatic counterweight: productivity vs. bodily risk. Five-turn dramaturgical study: mutual challenge and correction. Fictional; not archival testimony.",
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
    "openingQuestion": "Does being seen mean having a say?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.4091",
        "text": "My title tells viewers to vote for a workers' party. At least it's asking for a political choice.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "Making the Engine, that's my title. I show work by name; I don't ask anyone for a vote.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.4091",
        "text": "That's the difference. Being pictured as a worker isn't the same as having a say.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "archivist",
        "text": "Factories is a repeated motif, not a proven relation between these parties, artists, or workers.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "85.4.64.43",
        "text": "Fair. And do we know whether anyone listened to either appeal? Not from a shared tag.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      }
    ],
    "next": "What would a contemporaneous worker's account add?",
    "editorialNote": "Political poster is an address to a viewer; title evidence does not establish reception. Five-turn dramaturgical study: mutual challenge and correction. Fictional; not archival testimony.",
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
    "openingQuestion": "How can a year become an argument?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "84.4.157",
        "text": "My title is 1939 A.D. Put a year in a title and people start asking what comes next.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.2907",
        "text": "I put two years in mine. I insist that 1943 is not 1918. My argument depends on what you remember about the earlier year.",
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
    "arc": "Can a tree connect Paul Robeson to an imagined house?",
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
    "openingQuestion": "What changes when a myth helps sell a dye?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "84.4.25.1",
        "text": "I announce an international exhibition of contemporary art. My invitation is to come and look. What do you want the same kind of motif to do?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3275",
        "text": "My title advertises a dye. A look is a start. I'd like you to remember what you can buy.",
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
    "arc": "Can water connect a trade fair to Let the Living Rise?",
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
    "openingQuestion": "How can the future be a promise to one person and a threat to another?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.2880",
        "text": "My title warns about an invader's grasp and the threat of enslavement. The future I ask you to imagine is one to fear.",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.157",
        "text": "My title is 1939 A.D. Until you spoke, I heard a year someone might look forward to. A year can sound different depending on who's waiting for it.",
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
    "openingQuestion": "Can a myth make a pair of heels look extraordinary?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.3277",
        "text": "My title promotes Pirelli heels. If a myth can make you look twice, why shouldn't I use it to make a pair of heels seem extraordinary?",
        "kind": "ARTIST_AUTHORED_INTERPRETATION"
      },
      {
        "speakerAccession": "84.4.25.1",
        "text": "I announce a biennial exhibition. I'd like a second look too, though I'm asking you to look at art. When you look twice, do you see the heels or the story?",
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
  },
  {
    "id": "TD1989.317.66::TD1990.340.141",
    "group": "public-expansion",
    "a": "TD1989.317.66",
    "b": "TD1990.340.141",
    "family": "motif",
    "tag": "Women",
    "arc": "Who gets to represent women’s work?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "TD1989.317.66",
        "text": "My lottery has an exhibition in its name. A ticket could tell you who won. Could it tell you whose work was on the wall?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1990.340.141",
        "text": "I have a hundred years in my title. Try fitting a single working day inside those dates.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1989.317.66",
        "text": "Then I’d want a different kind of list. Who set up the exhibition before anyone came through the door?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      }
    ],
    "next": "Which names would you look for in an exhibition checklist?",
    "editorialNote": "AI-assisted script grounded in the two public titles and their shared motif. The voices are imagined.",
    "pair": [
      "TD1989.317.66",
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
    "id": "XX1990.2907::XX1990.3843",
    "group": "public-expansion",
    "a": "XX1990.2907",
    "b": "XX1990.3843",
    "family": "motif",
    "tag": "Political symbols",
    "arc": "What does a war poster ask us to believe?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.2907",
        "text": "I put 1943 beside 1918. Two dates, and already you’re looking for a difference.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3843",
        "text": "My title promises the effect of our U-boats. You’d need more than a date to measure an effect.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.2907",
        "text": "But read your title again. Before you measure anything, that little word “our” has picked a side.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      }
    ],
    "next": "Whose account would you put beside the word “our”?",
    "editorialNote": "AI-assisted script grounded in the two public titles and their shared motif. The voices are imagined.",
    "pair": [
      "XX1990.2907",
      "XX1990.3843"
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
    "id": "XX1990.3275::XX1990.3277",
    "group": "public-expansion",
    "a": "XX1990.3275",
    "b": "XX1990.3277",
    "family": "motif",
    "tag": "Mythological figures",
    "arc": "What can a myth sell?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "XX1990.3275",
        "text": "My dye calls itself superior. Put two swatches on the counter and you could ask me to prove it.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3277",
        "text": "And how would you test my heels? Walk a mile in them, or take one look and want to be the person wearing them?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.3275",
        "text": "Now I wonder what I’m selling. Would anyone buy the very same color if I called it ordinary?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      }
    ],
    "next": "What would you cover up to test whether the image changes your choice?",
    "editorialNote": "AI-assisted script grounded in the two public titles and their shared motif. The voices are imagined.",
    "pair": [
      "XX1990.3275",
      "XX1990.3277"
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
    "id": "TD1990.340.146::XX1990.2880",
    "group": "public-expansion",
    "a": "TD1990.340.146",
    "b": "XX1990.2880",
    "family": "motif",
    "tag": "Flags",
    "arc": "Who is invited to stand behind a flag?",
    "mode": "contest",
    "turns": [
      {
        "speakerAccession": "TD1990.340.146",
        "text": "My title tells you to work and fight. Read it aloud. Who do you feel is giving the order?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "XX1990.2880",
        "text": "Mine says the invader means to enslave us. Say “us” aloud and listen to where it puts you.",
        "kind": "AI_ASSISTED_INTERPRETATION"
      },
      {
        "speakerAccession": "TD1990.340.146",
        "text": "You’ve given me a harder question. Could someone want freedom and still refuse my command?",
        "kind": "AI_ASSISTED_INTERPRETATION"
      }
    ],
    "next": "Who could answer these posters back, and where might you find their words?",
    "editorialNote": "AI-assisted script grounded in the two public titles and their shared motif. The voices are imagined.",
    "pair": [
      "TD1990.340.146",
      "XX1990.2880"
    ],
    "requires": {
      "family": "motif",
      "value": "Flags",
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
