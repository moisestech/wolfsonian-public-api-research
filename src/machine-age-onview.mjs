/**
 * On-view protocol: Wolfsonian copy is displayed, not accessible for handling.
 * Other copies, reviews and scholar sources are separate witness/edition layers.
 * No media is fetched, stored, mirrored or licensed by this module.
 */
export const MACHINE_AGE_ACCESSION='XM1999.108.8';
export const MACHINE_AGE_ACCESS_STATE='ON_VIEW_NO_HANDLING';
export const MACHINE_AGE_SOURCE_LAYERS=Object.freeze([
  {
    "id": "WOLF-COPY",
    "label": "Wolfsonian copy (displayed object)",
    "type": "museum_object",
    "url": "https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf",
    "scope": "Museum title, accession and publicly exhibited cover; no physical page inspection.",
    "access": "on_view_no_handling",
    "verified": "user_confirmed_display_and_institutional_checklist",
    "reproduction": "permission_required",
    "priority": 1
  },
  {
    "id": "WOLF-CHECKLIST",
    "label": "Wolfsonian exhibition checklist",
    "type": "institutional_object_record",
    "url": "https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf",
    "scope": "Current museum attribution and curatorial description, including catalogue title and cover designer.",
    "access": "public_online",
    "verified": "official_checklist_read",
    "reproduction": "image_permission_separate_from_metadata",
    "priority": 2
  },
  {
    "id": "TEHNE-SURROGATE",
    "label": "Independent digitized catalogue, with sample photographed pages",
    "type": "independent_copy_selected_page_images",
    "url": "https://tehne.com/library/machine-age-exposition-catalogue-new-york-1927",
    "scope": "39-page catalogue described with sample page images and a third-party transcript. Not certified to match the museum copy.",
    "access": "public_selected_pages",
    "verified": "visual_sample_pages_available_other_copy",
    "reproduction": "third_party_rights_not_cleared",
    "priority": 3
  },
  {
    "id": "HATHI-LISTING",
    "label": "HathiTrust page-image catalogue listing",
    "type": "library_discovery",
    "url": "https://onlinebooks.library.upenn.edu/webbin/book/browse?c=x&key=Exhibition+catalogs&type=lcsubc",
    "scope": "Online Books Page lists Machine-age exposition : catalogue (1927) with HathiTrust page images; viewer access and edition need confirmation.",
    "access": "listing_known_page_access_unverified",
    "verified": "bibliographic_listing_only",
    "reproduction": "rights_and_download_rules_unknown",
    "priority": 4
  },
  {
    "id": "HAGLEY-HISTORIC",
    "label": "Hagley digital catalogue — historically cited",
    "type": "institutional_link_unverified",
    "url": "https://digital.hagley.org/cdm/compoundobject/collection/p268001coll12/id/16132/show/16131",
    "scope": "A scholarly PDF cites this Hagley link as a source for the catalogue cover/interior; legacy URL inaccessible during this research. Ask Hagley for updated permalink.",
    "access": "legacy_link_not_confirmed",
    "verified": "scholarly_citation_only",
    "reproduction": "rights_not_cleared",
    "priority": 5
  },
  {
    "id": "SCRIBD-OCR",
    "label": "Third-party OCR/transcription",
    "type": "transcription_candidate",
    "url": "https://www.scribd.com/document/1053998892/Machine-Age-Exposition-Catalogue",
    "scope": "Text and provisional page candidates only, not verified against a complete facsimile or Wolfsonian copy.",
    "access": "online_transcription",
    "verified": "ocr_not_facs_verified",
    "reproduction": "no_text_or_scan_redistributed",
    "priority": 6
  },
  {
    "id": "NY-REVIEW",
    "label": "Contemporary exhibition review — E. B. White (1927)",
    "type": "contemporary_witness_review",
    "url": "https://www.newyorker.com/magazine/1927/05/21/machine-age",
    "scope": "Separate period review of what was shown, not a page from the catalogue; website acknowledges possible transcription errors.",
    "access": "public_online",
    "verified": "published_historical_review_digitized",
    "reproduction": "link_and_brief_paraphrase_only",
    "priority": 7
  },
  {
    "id": "UCL-THESIS",
    "label": "Scholarly interpretation — Barnaby Emmett Haran",
    "type": "scholarly_secondary",
    "url": "https://discovery.ucl.ac.uk/id/eprint/1444189/1/U591491.pdf",
    "scope": "Art-history thesis studies 1927 exhibition, publication as Little Review supplement and the gap between catalogue and final displays.",
    "access": "open_access_pdf",
    "verified": "scholarly_source_read",
    "reproduction": "link_and_brief_paraphrase_only",
    "priority": 8
  }
]);
export const MACHINE_AGE_WITNESS=Object.freeze({
  "sourceId": "NY-REVIEW",
  "authoredNotOriginalQuote": true,
  "sourceStatus": "contemporary_digitized_review_not_museum_catalogue",
  "transcriptionCaveat": true,
  "claims": [
    {
      "id": "W1927-01",
      "label": "Artwork and machinery were displayed side by side",
      "paraphrase": "The May 1927 reviewer describes modern works shown alongside machine parts and equipment."
    },
    {
      "id": "W1927-02",
      "label": "Glass-skyscraper model",
      "paraphrase": "The reviewer describes a Hugh Ferriss glass-skyscraper model, with claims about a Vita-Glass design."
    },
    {
      "id": "W1927-03",
      "label": "Special illumination",
      "paraphrase": "The reviewer describes the display as illuminated with Sun-Like lamps."
    },
    {
      "id": "W1927-04",
      "label": "The logic of juxtaposition",
      "paraphrase": "The reviewer suggests the combination of art and everyday machinery made the show interesting."
    }
  ],
  "responses": {
    "futurist": {
      "text": "A 1927 visitor described machine parts and modern artworks side by side, as well as a futuristic glass-skyscraper model. The new future was not only pictured: machinery and speculative architecture became things an audience could encounter together.",
      "claimIds": [
        "W1927-01",
        "W1927-02"
      ],
      "unknowns": [
        "How typical was this visitor's reaction?",
        "Do surviving exhibition photographs document the arrangement?"
      ]
    },
    "worker": {
      "text": "The contemporary account mentions machine parts, special lighting, and an experimental glass-skyscraper model. That description gives us a sense of the exhibition's staging, but does not tell us who installed the lights, produced the components, or maintained the display.",
      "claimIds": [
        "W1927-01",
        "W1927-02",
        "W1927-03"
      ],
      "unknowns": [
        "Whose labor prepared and maintained the show?",
        "Was the lighting described accurately?"
      ]
    },
    "archivist": {
      "text": "This is testimony from a contemporary review, not the Wolfsonian catalogue. The reviewer describes side-by-side art and machinery, an unusual glass-skyscraper model, and special lighting. The digitized text warns of transcription errors; source edition and exact wording should be checked before any quotation.",
      "claimIds": [
        "W1927-01",
        "W1927-02",
        "W1927-03",
        "W1927-04"
      ],
      "unknowns": [
        "Can the May 21, 1927 print issue be checked?",
        "Does this show arrangement match the catalogue's exhibit list?"
      ]
    }
  }
});

const claimMap=new Map(MACHINE_AGE_WITNESS.claims.map(x=>[x.id,x]));
const readers=new Set(['futurist','worker','archivist']);
export function onViewResourcesFor(accession){
 if(accession!==MACHINE_AGE_ACCESSION)return [];
 return MACHINE_AGE_SOURCE_LAYERS.map(x=>({...x}));
}
export function contemporaryWitnessFor(accession,readerId){
 if(accession!==MACHINE_AGE_ACCESSION || !readers.has(readerId))return {
  status:'NOT_ESTABLISHED',claimIds:[],claims:[],unknowns:[],text:'No bounded historical witness is prepared for this object and reader.'
 };
 const a=MACHINE_AGE_WITNESS.responses[readerId];
 const verified=a.claimIds.map(id=>claimMap.get(id));
 if(verified.some(x=>!x))return {
  status:'NOT_ESTABLISHED',claimIds:[],claims:[],unknowns:[],text:'Required review claim not found in source register.'
 };
 return {
  status:'SOURCE_BOUNDED_CONTEMPORARY_WITNESS',
  text:a.text,
  claimIds:[...a.claimIds],
  claims:verified.map(c=>({...c,source:MACHINE_AGE_SOURCE_LAYERS.find(s=>s.id==='NY-REVIEW')})),
  unknowns:[...a.unknowns],
  authored:true,
  voice:'fictional_reader',
  historicalQuotation:false,
  notAnOriginalCataloguePage:true,
  transcriptionCaveat:true
 };
}
