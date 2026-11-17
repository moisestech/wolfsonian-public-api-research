# Object Lens — source-first visitor architecture
Archive Dreams in Public | Moises Sanabria | 2026-11-16 | Independent research, internal draft

## Why this exists
One compelling object → identity confirmation → competing fictional interpretations → source check → optional related-object exploration. It is an artistic research experience, not a museum chatbot or a released visitor product.

## Code audit at branch point
- Main commit 6356247 already has a Conversational Atlas, deterministic three-turn dialogue, local browser speech, optional gated ElevenLabs, six public anchor identities, 300 staff-derived matrix objects, and a saved 76-object Lakehouse matched snapshot.
- The existing Object Lens started camera preview but made NO visual match, and searched only the six anchor accessions. The Atlas instead loaded a different subset; a six-anchor phone handoff could fail.
- Staff metadata and the saved Lakehouse snapshot are ALREADY visible in the public repo. Publication/redistribution review is tracked in issue #25. This new branch adds neither source dataset nor images and must not be deployed as a new public release until that issue is resolved.
- Improvements to multiple local voice casting (PR #24) and visitor-first Atlas UI (PR #26) remain separate DRAFT work. This branch is independent and must be reconciled with them before merging.

## Evidence contract / trust boundaries
A SOURCE_PACKET_IDENTITY is a pre-existing public research identity consisting of title and exact accession. It does not prove authorship, physical location, storage box, object history, rights, or links to neighbors.
PUBLIC_EXHIBITION_REFERENCE may add a date with a separately cited public exhibition checklist. It is not the same as a unique current Lakehouse record.
ARTIST_AUTHORED_INTERPRETATION is fictional and is always labeled so, with a visible prompt and blind spot.
SHARED_STAFF_METADATA is a calculated thematic overlap, not historical causation.
DOCUMENTED_RELATION may only be used after independent primary/curatorial evidence is supplied with source pointer, reviewer and permissions.

## Module boundaries
- src/atlas-graph.mjs: canonical six public anchor identities and exact accession matching.
- src/object-lens-core.mjs: builds compact visitor packets, three reader scripts, evidence labels and graph fallback. No media bytes, model requests, image uploads, matrix, or Lakehouse fetch.
- demo/object-lens/: privacy-conscious camera preview, exact typed identity, explicit confirmation, on-phone persona switching, limited evidence, optional local speech, and deep link.
- demo/archive-society/society.mjs: accepts the selected exact accession. If it is absent from the catalog-matched graph, add an isolated identity-only node and no fabricated edges. Existing catalog records are never replaced by a shorter packet.
- scripts/serve-archive-society.mjs: explicitly allowlisted source module for loopback demo.
- test/object-lens-core.test.mjs: exact identity, ambiguous/prefix rejection, noninvented evidence boundaries, isolated-node fallback and DOM binding checks.

## Proposed object packet (future curated version)
{
  "accession": "XM1999.108.8",
  "title": "Machine Age Exposition catalogue",
  "identitySource": { "type": "public_exhibition", "sourceUrl": "...", "checkedAt": "..." },
  "claimLedger": [
    { "claimId": "C1", "text": "1927", "kind": "record_date", "sourcePointer": "...", "permission": "review_required" }
  ],
  "interpretations": [
    { "persona": "worker", "promptVersion": "1", "text": "...", "claimIds": [], "classification": "artist_interpretation" }
  ],
  "relationships": [
    { "to": "...", "type": "artist_question", "evidence": [], "historicalRelationshipEstablished": false }
  ],
  "images": [],
  "unknowns": ["Who are the people not represented in this identity record?"]
}
This example is a target contract, not an existing approved media/citation packet. Current runtime output is narrower and documented by schemas/object-encounter.schema.json.

## Phone recognition architecture
P0 works without recognizing a photograph. Visitors may use an artist-made test QR link with an accession parameter or type an exact accession. Both require confirmation. Camera permission is opt-in, camera stops on page hide, no frames saved.
P1: native BarcodeDetector only where supported; otherwise a bundled, tested fallback. Never auto-confirm a decoded URL. Encoded URI contains only a verified accession.
P2: permission-cleared object reference photos and a local image candidate index with calibrated thresholds. Return up to 3 candidates with source and “none of these,” and require explicit confirmation. No server upload by default.
P3: an explicit opt-in to server-side vision only if image rights and user consent, retention, and provider processing terms are agreed.

## Conversation architecture
Begin with curated author-authored dialogue while preserving the existing source-aware Atlas and voice infrastructure.
Future visitor question path:
confirmed accession → approved object packet → intent + persona → source retrieval → answer composition → claim-by-claim validation → transcript with citations / unknown state → optional consented voice.
Without an exact supporting source pointer, use NOT ESTABLISHED, not a plausible claim. A source link must be attributed with page/section, and interpretation may not masquerade as historical quotation.
Build an object-to-object conversation only when the edge basis is labeled; no artificial direct historical connection from shared tags.

## Sources and dependencies
Research memo: https://docs.google.com/document/d/1AEPsxFiQU2r3a-VBpY0Gbb0uL4dK8mFP-I59D4JlI2s/edit
Nov 16 audit: https://docs.google.com/document/d/12sNHXlak4l74a7u1yxNWhYd8qF8eYWI5WtELaS10SL4/edit
Working slides: https://docs.google.com/presentation/d/1qSRY2xkMEBGcZfokohvd1zBQKgA5hDMJpt9nl6KO48U/edit
Rights gate: https://github.com/moisestech/wolfsonian-public-api-research/issues/25

## Definition of done (P0)
The visitor manually chooses XM1999.108.8; sees title and accession; explicitly confirms; switches Futurist/Worker/Archivist with different text; can inspect evidence; optional verified local speech or transcript fallback; Atlas opens the same accession even if no neighbor exists. No photographic recognition, live generative system, auto-play, external image transfer or unapproved image credits are claimed.
