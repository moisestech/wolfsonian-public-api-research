/**
 * Provisional primary-publication reading leads for 1927 Machine-Age Exposition.
 * Derived from a third-party indexed OCR/transcription, NOT direct visual
 * verification against the Wolfsonian copy or a page facsimile.
 *
 * Never elevate these to the institution-verified claim ledger, quote them as
 * original-page evidence, or use them as asserted facts in generated dialogue.
 */
export const PRIMARY_TEXT_SOURCE={
  "id": "MA-SCAN-OCR-THIRD-PARTY",
  "title": "Machine-Age Exposition Catalogue — third-party indexed OCR/transcription of a purported 1927 copy",
  "url": "https://www.scribd.com/document/1053998892/Machine-Age-Exposition-Catalogue",
  "kind": "third_party_transcription",
  "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
  "relationToWolfsonianCopy": "NOT_ESTABLISHED",
  "pages": "Printed page markers derived from third-party OCR; pagination and transcription require visual cross-check.",
  "rights": "No scans, photographs or OCR body text redistributed in this code.",
  "inspectedAt": "2026-11-16"
};
export const PRIMARY_PAGE_LEADS=Object.freeze([
  {
    "id": "MA-P01",
    "label": "Hugh Ferriss and new architectural forms",
    "printedPageCandidate": "6",
    "topicIds": [
      "machines",
      "evidence"
    ],
    "section": "Architecture of This Age",
    "observed": "The OCR attributes a foreword to Hugh Ferriss and discusses changes to the form of New York buildings and the need to reassess inherited aesthetic conventions.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "What precisely does Ferriss argue about technological change versus architectural change?",
    "sourceTextAnchor": "FOREWORD / ARCHITECTURE OF THIS AGE"
  },
  {
    "id": "MA-P02",
    "label": "Prampolini: the machine as an artistic symbol",
    "printedPageCandidate": "8–10",
    "topicIds": [
      "machines",
      "essays",
      "evidence"
    ],
    "section": "The Aesthetic of the Machine and Mechanical Introspection in Art",
    "observed": "The OCR describes machinery and mechanical elements as new sources of artistic inspiration and distinguishes symbolic analogy from literal representations of machine parts.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "How does Prampolini define the machine as symbol rather than mere visual motif?",
    "sourceTextAnchor": "THE AESTHETIC OF THE MACHINE AND MECHANICAL INTROSPECTION IN ART"
  },
  {
    "id": "MA-P03",
    "label": "Archipenko: action rather than fragments of machinery",
    "printedPageCandidate": "12–14",
    "topicIds": [
      "machines",
      "essays"
    ],
    "section": "Machine and Art",
    "observed": "The OCR attributes a text to Archipenko that critiques fragmentary representations of machinery and proposes movement/action as an artistic problem.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "Does the original printing distinguish representation of mechanisms from the experience of movement, and how?",
    "sourceTextAnchor": "MACHINE AND ART"
  },
  {
    "id": "MA-P04",
    "label": "Labor-related architectural entries",
    "printedPageCandidate": "10–12",
    "topicIds": [
      "labor",
      "evidence"
    ],
    "section": "Austria section: architecture entries",
    "observed": "The OCR lists workmen's cottages and a model workingman's unit house among architectural exhibits. The precise page and naming need a scan check.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "Who designed these dwellings, whom were they intended for, and how were they represented?",
    "sourceTextAnchor": "Workmen's Cottages"
  },
  {
    "id": "MA-P05",
    "label": "Safety garments and masks appear in exhibit list",
    "printedPageCandidate": "17",
    "topicIds": [
      "labor",
      "evidence"
    ],
    "section": "U.S. exhibitors list / industrial safety",
    "observed": "The OCR lists a safety-equipment company with exhibit number 442, described as industrial safety garments and masks. This complicates any assertion that labor or safety was altogether absent.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "Is item 442 actually present in the museum-held copy and can its exhibition context be documented?",
    "sourceTextAnchor": "442 Industrial Safety Garments and Masks"
  },
  {
    "id": "MA-P06",
    "label": "Lozowick: industrialization and art in America",
    "printedPageCandidate": "18–19",
    "topicIds": [
      "machines",
      "essays",
      "evidence"
    ],
    "section": "The Americanization of Art",
    "observed": "The OCR attributes to Louis Lozowick an essay that links industrialization, standardization and modern visual forms. Confirm exact language from source pages.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "How does Lozowick connect industrial processes to the artist's formal decisions?",
    "sourceTextAnchor": "THE AMERICANIZATION OF ART"
  },
  {
    "id": "MA-P07",
    "label": "Jane Heap: artist and engineer",
    "printedPageCandidate": "36–37",
    "topicIds": [
      "network",
      "machines",
      "evidence"
    ],
    "section": "Machine-Age Exposition",
    "observed": "The OCR presents a first-person exhibition statement proposing encounters among actual machines, engineering, architecture and visual art, and discusses the possible future made by artist–engineer exchange.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "Which claims about the relationship between engineers and artists appear on these exact pages?",
    "sourceTextAnchor": "MACHINE-AGE EXPOSITION"
  },
  {
    "id": "MA-P08",
    "label": "Time clock in the exhibit list",
    "printedPageCandidate": "37",
    "topicIds": [
      "labor",
      "evidence"
    ],
    "section": "Exhibitors list: International Business Machines",
    "observed": "The OCR lists a time clock among equipment, associated with International Business Machines; the reading order of multi-column text requires visual verification.",
    "verification": "OCR_ONLY_NOT_FACSIMILE_VERIFIED",
    "researchQuestion": "What exact label and company attribution appear next to the time clock in the printed catalogue?",
    "sourceTextAnchor": "322 Time Clock"
  }
]);

export function primaryPageLeadsFor(accession,questionId) {
  if(accession!=='XM1999.108.8') return [];
  return PRIMARY_PAGE_LEADS
    .filter(lead=>!questionId || lead.topicIds.includes(questionId))
    .map(lead=>({...lead,source:{...PRIMARY_TEXT_SOURCE}}));
}
