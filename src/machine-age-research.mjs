/**
 * Museum source-backed Machine-Age research packet.
 * Facts derive from the Wolfsonian Modern Design Across Borders public checklist.
 * No original catalogue page scanned/inspected or reproduced here; no museum images.
 * Artist-authored dialogue is a question, not historical testimony.
 */
import {primaryPageLeadsFor} from './machine-age-primary-leads.mjs';

export const MACHINE_AGE_RESEARCH = Object.freeze({
  "version": "1.0.0",
  "accession": "XM1999.108.8",
  "title": "Machine Age Exposition catalogue",
  "date": "1927",
  "sourceState": "WOLFSONIAN_PUBLIC_EXHIBITION_CHECKLIST",
  "licenseState": "metadata_facts_only_images_not_cleared",
  "editorialState": "artist_authored_not_museum_endorsed",
  "sources": [
    {
      "id": "WOLF-EXH-2025-MDAB",
      "title": "The Wolfsonian–FIU, Modern Design Across Borders — exhibition checklist",
      "url": "https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf",
      "kind": "institutional_exhibition_checklist",
      "locator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "reviewState": "public_source_checked",
      "originalCataloguePagesInspected": false,
      "imageUse": "not_cleared",
      "reproductionRights": "not_established"
    }
  ],
  "claims": [
    {
      "id": "MA-001",
      "label": "Catalog title",
      "value": "Machine Age Exposition",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-002",
      "label": "Catalog date",
      "value": "1927",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-003",
      "label": "Accession",
      "value": "XM1999.108.8",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-004",
      "label": "Cover designer",
      "value": "Fernand Léger",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-005",
      "label": "Place identified for catalogue",
      "value": "New York City",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-006",
      "label": "Exhibition initiator",
      "value": "Jane Heap",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-007",
      "label": "Curatorial theme",
      "value": "The museum describes the exposition as engaging streamlined forms, modernist ideas and mechanical beauty.",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-008",
      "label": "Essay contributors",
      "value": "Enrico Prampolini and Alexander Archipenko are named as essay contributors addressing machines and art.",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-009",
      "label": "Physical extent",
      "value": "11 × 8¾ inches (28 × 22 cm)",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    },
    {
      "id": "MA-010",
      "label": "Collection attribution",
      "value": "The Wolfsonian–FIU, The Mitchell Wolfson, Jr. Collection",
      "status": "source_fact",
      "sourceId": "WOLF-EXH-2025-MDAB",
      "sourceLocator": "Streamlining Transportation > Catalogue, Machine Age Exposition (1927)",
      "checkedAt": "2026-11-16",
      "approval": "artist_research_not_museum_reviewed"
    }
  ],
  "questions": [
    {
      "id": "cover",
      "label": "Who designed this cover?",
      "question": "Who designed the catalogue cover?",
      "responses": {
        "futurist": {
          "text": "Fernand Léger designed this cover. A machine-age visual vocabulary can make the future feel tangible—yet what the design promised its viewers is a question for interpretation, not a documented audience reaction.",
          "claimIds": [
            "MA-004",
            "MA-002"
          ],
          "unknowns": [
            "How did contemporary visitors understand the cover?"
          ]
        },
        "worker": {
          "text": "The Wolfsonian credits Fernand Léger with the cover design. That gives us a named artist, not a history of the people who printed, transported, or handled this catalogue.",
          "claimIds": [
            "MA-004"
          ],
          "unknowns": [
            "Who produced and distributed the physical catalogue?"
          ]
        },
        "archivist": {
          "text": "The exhibition checklist attributes the cover to Fernand Léger and dates this catalogue to 1927. Neither claim requires guessing from an image; the original catalogue pages and production credits have not yet been checked.",
          "claimIds": [
            "MA-004",
            "MA-002"
          ],
          "unknowns": [
            "Are original printer and publisher credits recorded in the Museum's physical copy?"
          ]
        }
      }
    },
    {
      "id": "network",
      "label": "Who brought this together?",
      "question": "Who initiated the exhibition and who else was involved?",
      "responses": {
        "futurist": {
          "text": "The museum names Jane Heap as the initiator of an international effort. That opens a question about how new visions of technology moved across borders, rather than emerging from a single inventor.",
          "claimIds": [
            "MA-006",
            "MA-007"
          ],
          "unknowns": [
            "What relationships between participants can individual documents establish?"
          ]
        },
        "worker": {
          "text": "Jane Heap initiated the exposition according to the museum's checklist. That does not document the technical and organizational labor that made the show or its catalogue possible.",
          "claimIds": [
            "MA-006"
          ],
          "unknowns": [
            "Who performed the practical labor of exhibition-making?"
          ]
        },
        "archivist": {
          "text": "The public institutional checklist identifies Jane Heap as the initiator. It does not, in this bounded entry, supply a verified full roster or the exact roles of every contributor.",
          "claimIds": [
            "MA-006"
          ],
          "unknowns": [
            "Can the original pages confirm the contributors and organization list?"
          ]
        }
      }
    },
    {
      "id": "machines",
      "label": "Why did machines matter to art?",
      "question": "How did the exposition relate machines to modern design?",
      "responses": {
        "futurist": {
          "text": "The museum describes modernist ideas, streamlined forms, and mechanical beauty. The artistic possibility is that machinery became an aesthetic language through which new futures could be imagined.",
          "claimIds": [
            "MA-007"
          ],
          "unknowns": [
            "Which participants explicitly argued for this reading?"
          ]
        },
        "worker": {
          "text": "The museum's description foregrounds the aesthetics of industrial technology. A Worker lens asks whether the same pages describe making, maintenance and working conditions, or mainly the beauty of their products.",
          "claimIds": [
            "MA-007"
          ],
          "unknowns": [
            "Which original essays or illustrations address workers rather than machines?"
          ]
        },
        "archivist": {
          "text": "The checklist characterizes the exposition through streamlined forms, modernist ideas and mechanical beauty. This is a museum curatorial summary; it is not a quotation from the catalogue's authors.",
          "claimIds": [
            "MA-007"
          ],
          "unknowns": [
            "How do original essays differ from the museum's current interpretation?"
          ]
        }
      }
    },
    {
      "id": "essays",
      "label": "Whose voices are in the essays?",
      "question": "Which named contributors wrote about machines and art?",
      "responses": {
        "futurist": {
          "text": "The Wolfsonian identifies Enrico Prampolini and Alexander Archipenko as essay contributors on machines and art. Their exact arguments could provide competing futures—but we should read the original pages before writing those arguments into their mouths.",
          "claimIds": [
            "MA-008"
          ],
          "unknowns": [
            "What did each essay actually claim?"
          ]
        },
        "worker": {
          "text": "Prampolini and Archipenko are named in the museum's summary. That says who appears as an essayist, not whose labor the texts discuss or exclude. We need the original pages before drawing that conclusion.",
          "claimIds": [
            "MA-008"
          ],
          "unknowns": [
            "Do the essays describe labor or industrial production?"
          ]
        },
        "archivist": {
          "text": "The institution names Enrico Prampolini and Alexander Archipenko among essay contributors. Their precise essay titles, wording, and positions must be checked against the original catalogue before citing a page or producing a quotation.",
          "claimIds": [
            "MA-008"
          ],
          "unknowns": [
            "Verify original essay pages and transcription against the physical or approved digitized copy."
          ]
        }
      }
    },
    {
      "id": "labor",
      "label": "Where are the workers?",
      "question": "Who made the machinery and who is missing from the record?",
      "responses": {
        "futurist": {
          "text": "The promise of machinery is compelling, but this short museum checklist does not tell us who built, maintained or used the machines. This absence from our present source packet is a research question, not proof that the original show omitted workers.",
          "claimIds": [
            "MA-007"
          ],
          "unknowns": [
            "Who is named or pictured in the original catalogue?"
          ]
        },
        "worker": {
          "text": "We can name the cover designer and exhibition initiator, but the evidence currently loaded does not identify a specific mechanic, printer, factory worker, or maintenance crew. The next step is to inspect captions, credits and original pages.",
          "claimIds": [
            "MA-004",
            "MA-006"
          ],
          "unknowns": [
            "Which working lives can primary documents genuinely recover?"
          ]
        },
        "archivist": {
          "text": "Not established by the sources currently loaded: the identities or working conditions of people who manufactured the depicted machines. Do not invent workers or assume their absence from the full catalogue.",
          "claimIds": [],
          "unknowns": [
            "Page-level labor evidence from the original is pending."
          ]
        }
      }
    },
    {
      "id": "evidence",
      "label": "What can we actually prove?",
      "question": "Which details are verified and what still needs research?",
      "responses": {
        "futurist": {
          "text": "The named object is a 1927 Machine Age Exposition catalogue with a cover attributed to Fernand Léger. That's a starting point. Its broader promise for society is an artist's interpretation to be tested against primary sources.",
          "claimIds": [
            "MA-001",
            "MA-002",
            "MA-004"
          ],
          "unknowns": [
            "Documented visitor responses and original essay claims are not yet in this packet."
          ]
        },
        "worker": {
          "text": "The title, accession, cover credit and Jane Heap attribution can be traced to the Wolfsonian checklist. The production labor behind the physical catalogue cannot be reconstructed from that entry alone.",
          "claimIds": [
            "MA-001",
            "MA-003",
            "MA-004",
            "MA-006"
          ],
          "unknowns": [
            "Printing, distribution and labor histories need independent sources."
          ]
        },
        "archivist": {
          "text": "Verified here from an institutional exhibition checklist: accession XM1999.108.8, the 1927 catalogue identity, Fernand Léger's cover, and Jane Heap as the exhibition initiator. Not yet verified against original pages: exact essay wording, full credits and page citations.",
          "claimIds": [
            "MA-001",
            "MA-002",
            "MA-003",
            "MA-004",
            "MA-006"
          ],
          "unknowns": [
            "Original catalogue page-level verification and reproduction permissions remain pending."
          ]
        }
      }
    }
  ],
  "openResearch": [
    {
      "id": "R-01",
      "question": "What does Hugh Ferriss's foreword actually argue?",
      "status": "pending_original_page_review",
      "requirement": "Confirm the signed foreword text and catalog page with museum staff; no direct quotation yet."
    },
    {
      "id": "R-02",
      "question": "What do the Prampolini and Archipenko essays argue?",
      "status": "pending_original_page_review",
      "requirement": "Verify essay page numbers, exact phrasing and whether excerpt use is permitted."
    },
    {
      "id": "R-03",
      "question": "Which industrial or publishing workers are actually represented?",
      "status": "unanswered",
      "requirement": "Check image captions, production credits, collection documentation, and curator research."
    },
    {
      "id": "R-04",
      "question": "What photographs or scans may appear on a public website?",
      "status": "rights_review_required",
      "requirement": "Obtain written image and quotation permission for museum copy or third-party scans."
    }
  ]
});

const byClaim = new Map(MACHINE_AGE_RESEARCH.claims.map(claim => [claim.id, claim]));
const byQuestion = new Map(MACHINE_AGE_RESEARCH.questions.map(question => [question.id, question]));
const readers = new Set(['futurist','worker','archivist']);
const approvedState = new Set(['source_fact']);

export function machineAgeResearchLeads(accession,questionId) {
  return primaryPageLeadsFor(accession,questionId);
}

export function machineAgeQuestions(accession) {
  if(accession !== MACHINE_AGE_RESEARCH.accession)return [];
  return MACHINE_AGE_RESEARCH.questions.map(({id,label,question})=>({id,label,question}));
}
export function machineAgeClaimLedger(accession) {
  if(accession !== MACHINE_AGE_RESEARCH.accession)return [];
  return MACHINE_AGE_RESEARCH.claims.map(claim=>({...claim,
    source:MACHINE_AGE_RESEARCH.sources.find(s=>s.id===claim.sourceId)}));
}
export function machineAgeAnswer(accession, questionId, readerId) {
  if(accession !== MACHINE_AGE_RESEARCH.accession || !readers.has(readerId)) {
    return {status:'NOT_ESTABLISHED',text:'No verified question/reader pair is available for this object.',claimIds:[],claims:[],unknowns:[]};
  }
  const question=byQuestion.get(questionId),response=question?.responses?.[readerId];
  if(!response)return {status:'NOT_ESTABLISHED',text:'Not established by the prepared research questions. Choose a documented topic.',claimIds:[],claims:[],unknowns:[]};
  const cites=[];
  for(const id of response.claimIds){
    const claim=byClaim.get(id);
    const source=MACHINE_AGE_RESEARCH.sources.find(s=>s.id===claim?.sourceId);
    if(!claim || !approvedState.has(claim.status) || source?.reviewState!=='public_source_checked') {
      return {status:'NOT_ESTABLISHED',text:'A required source has not been verified. This answer cannot be presented as a factual claim.',claimIds:[],claims:[],unknowns:[]};
    }
    cites.push({...claim,source});
  }
  return {status:response.claimIds.length?'SOURCE_BOUNDED_INTERPRETATION':'UNANSWERED_RESEARCH_QUESTION',
    question:question.question,readerId,text:response.text,claimIds:[...response.claimIds],claims:cites,
    unknowns:[...response.unknowns],sourceState:'INSTITUTIONAL_CHECKLIST_NOT_ORIGINAL_PAGE',
    authored:true,verifiedHistoricalQuotation:false};
}
