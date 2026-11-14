# MASTER PROMPT FOR CURSOR — Archive Dreams in Public
## Spatial Conversational Atlas + Object Lens | November 19, 2026 demo

ROLE: Act as principal creative technologist, senior frontend/Three.js engineer, accessible interaction designer, evidence/provenance architect, QA engineer and critical collaborator on Moises Sanabria's artwork Archive Dreams in Public. Your job is to CODE and TEST an independently runnable, curatorial-quality demo in the EXISTING repository. This is a real implementation task; do not stop after writing a proposal.

REPOSITORY: https://github.com/moisestech/wolfsonian-public-api-research
INTENDED START BRANCH: feat/spatial-atlas-object-lens-nov19 (branched from feat/explainable-discovery-lab-20261114)
REFERENCE RESEARCH PR: https://github.com/moisestech/wolfsonian-public-api-research/pull/19 (draft; 36 curated items + 22 candidate edges)
CURRENT DISCOVERY LAB PR: https://github.com/moisestech/wolfsonian-public-api-research/pull/18
DEMO TARGET: Thursday November 19, 2026, 4–5 PM; present a 4–6-minute interaction with a reliable 90-second essential slice.
ALWAYS label this an independent artist-authored prototype, not a Wolfsonian product or deployed installation.

## Core proposition

Build a Boschian **artificial society of archive objects**. The background is a layered, original allegorical archive world inspired by the density of simultaneous events in Northern Renaissance painting, without copying Bosch's painting. Actual archival objects and accession identities float in this terrain, linked by inspectable relationships and fictional interpretive dialogues. Visitors can switch viewpoints, follow edges, inspect the precise basis of a claim, and return to the physical object. Our difference from the Discovery Wall is not that we find shared categories, but that a visitor can ask: "Who proposed this link? What does it mean? What evidence supports it? What remains unknown?"

ONE GRAPH, THREE SURFACES:
(A) /demo/archive-society/ — existing SVG/2D Conversational Atlas, our robust baseline;
(B) /demo/spatial-atlas/ — NEW progressive-enhancement Three.js / 2.5D world using the same source graph and scripted encounter data;
(C) /demo/object-lens/ — NEW mobile-first, permission-based Object Lens, initially camera/label-assisted and user-confirmed, capable of handing off a selected accession into the Atlas and research conversation.
Do not rewrite or break /world/, /demo/, /demo/discovery-lab/, or /research-console/. Keep routes isolated; make existing archive-society service and graph helpers reusable. The archive-society route should still run with its documented local Node server.

## FIRST: inspect the actual code, don't assume

Before touching implementation:
- git status, branch, recent commits, relevant PR diff and package scripts. Preserve ALL uncommitted files. Never reset/clean/stash unrelated work or force-push.
- Read: docs/archive-society.md, docs/discovery-lab-nov19-presentation.md, docs/discovery-lab.md, src/archive-society.mjs, src/discovery-graph.mjs, src/discovery-dialogue.mjs, src/discovery-personas.mjs, src/archive-evidence.mjs, demo/archive-society/{index.html,society.mjs,society.css}, server/archive-services.mjs, scripts/serve-archive-society.mjs, and existing tests.
- Read the draft 36-object / 22-edge research material from PR #19: data/research/boschian-network/candidates.json and relationships.json, plus docs/boschian-network-curatorial-brief.md. These currently belong to a separate research branch; fetch or copy exact reviewed contents to this branch only with provenance preserved and never silently turn "candidate" into "verified".
- Existing /demo/archive-society/ has a generated background at demo/archive-society/assets/archive-landscape.jpg, local CSV/photo imports, SVG map, scripted object dialogue, browser device speech, optional consent-gated ElevenLabs, bounded Lakehouse lookup and synthetic example records. Reuse these! Avoid building a competing voice stack.
- Existing /demo/discovery-lab/ has a three-rail persona/graph/inspector UI; reuse its conventions and core graph logic, not unrelated duplicated parser code.
- Read user Drive docs if accessible locally, or use linked docs for human visual review: Visual Evidence & Image Generation Ledger; Annex Field Notes; Visual Production Bible; Nov 19 working deck. Never treat a link as its contents if access is unavailable.

IMPORTANT RESEARCH GATES:
* Mark's staff-shared Discovery Wall matrix has 301 accession-identified objects, staff thematic/motif/style/geography metadata, and empty manually forced relations; the Discovery Wall is NOT integrated with Lakehouse. Full staff workbook, its interpretive prose, and unapproved images must not be committed or published.
* The six existing repo public source packets are the verified anchor set (Sparton XX1990.1484; Trylon/Perisphere 86.17.1; Machine Age catalogue XM1999.108.8; Mappemonde 85.7.383a,b; fair poster 85.4.72; fair program 86.19.57). The 30 matrix candidates in PR #19 are NOT yet live Lakehouse verified; mark appropriately.
* Artist's November 14 field finding: Lakehouse holds BOTH box numbers and accession numbers. However, only the public /api/v1/aa_good_lookup endpoint is confirmed and its documented 16-field subset lists Accession Number and Additional Accession Numbers but NO box field. We know that box identifiers exist in Lakehouse; we DO NOT know their permitted public field path, exact join cardinality, coverage or display rights. Do not infer or invent actual box values.
* Only public read-only endpoint allowed: https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup. Do NOT probe /records, /search, /docs, /openapi.json or work around 403, DNS, IP allowlists or redirects. Query parameter contract must come from an observed authorized example; never guess or download an unbounded response. A cloud function does not inherit a home network's IP allowance.
* Image scope: actual collection image permission confirmed for INTERNAL NOVEMBER 19 PRESENTATION ONLY. Do not commit, bundle, publish, upload to Vercel, run through external visual models, add to public screenshots or send to ElevenLabs. The generated landscape can be bundled; approved object photos remain local in the browser session. Every image carries kind (historical/collection documentation, authentic screenshot, schematic, conceptual generation) and precise attribution where available.

## PHASE 1 — SHARED GRAPH / RELATIONSHIP CONTRACT (P0)

Create a small typed or JS-with-JSDoc, testable module, e.g. src/atlas-graph.mjs. Stable graph IDs are NEVER display labels:
  ObjectRecord { id, accession, additionalAccessions[], title, date?, creator?, sourcePacket?, sourceState, imageState, boxReferences? }
  IdentifierNode { id:'accession:<encoded-exact-string>', kind:'accession', rawValue, scope:'primary'|'additional'|'component' }
  ContainerNode { id:'box:<opaque-safe-id>', kind:'box', displayValue?, disclosure:'approved'|'private'|'unknown' }
  TagNode { id:'tag:<namespace>:<normalized-key>', kind:'tag', label, namespace:'matrix_theme'|'matrix_motif'|'matrix_style'|'lakehouse_subject' }
  Relationship { id, source, target, type, layer, basis, sourceReferences[], validationState, permissionState, question? }
  Edge types:
    primary_accession; additional_accession; verified_component_identity;
    verified_box_membership; shared_metadata; published_source_fact;
    curatorial_interpretation; scripted_conversation.
Keep layers distinct in config/state; never treat edge counts as number of true historical relationships.

CRITICAL ON/OFF SWITCHES, INDEPENDENT AND REAL:
1. [ ] ACCESSION / IDENTITY — graph expands each object to its primary accession node, optionally approved additional-accession alias/component nodes. Toggles visible accession-node relationships. Do NOT infer identity from matching accession prefixes or link objects because both contain "1990". If the same exact accession maps to competing records, mark AMBIGUOUS, not "equivalent." Include toggle for printed ID text labels separately from actual edge visibility if useful.
2. [ ] BOX / STORAGE — when authorized sample mappings exist, graph expands object -> box/container -> other objects in same verified container, preserving many-to-one or many-to-many as actually observed. Each physical link must say "physical grouping, not historical causation." No box field in the currently documented public projection: default demo has an explanatory "No verified public box mappings loaded" state and ZERO fabricated box edges. Optionally allow a clearly marked LOCAL SYNTHETIC box fixture for testing, e.g. "DEMO-BOX-A", with an obvious "SIMULATED" watermark. Never surface real private labels or shelf positions without staff approval.
3. [ ] SUBJECT/THEME — toggle staff matrix themes; keep Lakehouse Subjects a different namespace.
4. [ ] MOTIF / STYLE — optionally toggle motif and style separately.
5. [ ] INTERPRETATION — toggle authored speculative relationships from PR #19.
6. [ ] CONVERSATION — show only edges currently instantiated as scripted encounters.
When an edge layer turns off, both line and its pick/hit target must disappear; inspector should show "hidden by filter" where applicable. Independent state persists between world and evidence panels for the session, not sent off-device.

Provide a simple internal test fixture with 3 fictional objects, 2 unique accession nodes and 1 additional accession, a *synthetic* shared box, one theme, one interpretation: prove every toggle works independently and counts are honest. For real corpus with no authorized box mapping, toggling box ON should show an informative empty state, not plausible fake edges.

Import PR #19's 36 candidate object/22 interpretation link IDs to a separate source-safe curation adapter (title, accession and provenance only), not as authenticated Lakehouse records; do not claim staff themes from Mark are equivalent to public Lakehouse Subject.

## PHASE 2 — ART DIRECTION / THREE.JS PROTOTYPE (P0)

Make /demo/spatial-atlas/ a sophisticated **2.5D panorama, not an FPS game**:
- Progressive rendering: Three.js WebGLRenderer with background image plane, 2–3 translucent depth planes, ~12 active object sprites or billboard cards, readable curved edge paths; depth/parallax subtle (don't spin the entire painting). Use the original generated landscape as a permitted starting asset.
- Keep text, credits, evidence and controls as accessible DOM overlays, not low-resolution text baked into WebGL. Use Raycaster or equivalent screen-pick mapping for pointer/touch hit-testing; synchronize DOM focus and the world selection state. Use responsive hit targets.
- Background must never masquerade as an actual Wolfsonian interior. Real object photos can be added *only as runtime local browser File URLs*, stripped on page reload, with a clear "collection documentation / permission-limited" label and credits entered locally. No uploaded museum photos in app assets or CI screenshots.
- Three distinct but traversable zones: PROMISE (future, machines, fairs); DESIRE (domesticity, travel, advertising); CONSEQUENCES (labor, safety, ideology, empire). Zones are curatorial interpretive map coordinates, NOT institutional classification. An object can appear in multiple interpretations but keep one canonical stable record ID.
- Motion grammar: selected node advances/brightens; active edge breathes softly; inactive nodes de-emphasize; short animated movement to next focus; no continuous spinning, graph spaghetti, bloom overload or faux sci-fi HUD. Keep dense panoramas and generous clearings.
- 16:9 presentation mode: start from Sparton and its two contrasting readings, then zoom out to show the society. Have a Presenter button that triggers a deterministic 90-second guided path with tap-to-advance (NOT timed narration required).
- Desktop: left compact persona rail, middle broad image world, right relationship/evidence inspector, similar to current Discovery Lab. Keyboard Tab, Enter/Space, Escape; pointer hover label; scroll/pinch zoom (bounded), drag pan, one-click Fit/Reset.
- Touchscreen kiosk/tablet: 44–48px minimum targets, no hover-only features; tap to select, tap edge to inspect, drag background to move, two-finger pinch to zoom; on-screen Help and Reset. Prevent accidental pinch/scroll conflicts.
- Mobile: single-screen immersive canvas or simple scrollable 2D fallback; bottom sheet shows 1 object, source badge and choices "Ask / Connections / Evidence"; full-screen camera is a separate route. Avoid left/right rails crushing content.
- Network density policy: default 1 center + <=6 neighbors, overview <=24; 36 curated IDs live in list/search, not all rendered/animated at once. Never draw all possible metadata pair edges. Use deterministic layout coordinates and cull nonvisible lines.
- Feature detection: if WebGL fails or reduced motion/power mode, fall back gracefully to the existing SVG atlas or 2D accessible list; leave the same selection and evidence. Avoid choosing experimental WebGPU as a required path.
- Add a simple "show data provenance" control exposing source layer, retrieval timestamp, license/permission, and "Interpretation is not evidence."

Use official Three.js Raycaster picking, bundle dependencies locally with package lock (no CDN critical path). Keep build route compatible with existing deployment behavior. If a Vite sub-build is necessary, isolate it without replacing root app packaging. Do not use secrets in JS bundle.

## PHASE 3 — OBJECT LENS: CAMERA -> CANDIDATE -> CONFIRM -> DIALOGUE (P0/P1)

At /demo/object-lens/ build a mobile-first Progressive Web App *page*, not fake AR registration. A visitor points a phone at an object or its accession label, optionally takes a snapshot; the UI identifies a possible match and asks the visitor to CONFIRM before conversation.

Ship the reliable baseline:
- [P0] Plain browse + type accession/title (search only the allowed local corpus), optional paste/scan accession text if a permitted label is visible. A typed accession can select only exact known IDs; unknown IDs show "not verified".
- [P0] On "Use camera", ask permission only from a user gesture, using navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}), HTTPS or localhost. Show clear camera-active state. Camera is OFF by default; stop tracks immediately on Close, page hide or route exit. Never run background capture. Have denial, unsupported browser and offline fallback.
- [P0] For Thursday, support explicit "Capture & compare to locally supplied references" demonstration using a local-only gallery of PUBLIC/ARTIST-OWNED or expressly approved images. If genuine reference photos have permission only for internal display, load them via file picker on the presenting device, never from repository/public URL, and do not persist/cache/upload.
- [P0] Result sheet: "Possible match — confirm"; object title, exact accession, source label, evidence status, alternate candidates, "Not this object", "Search manually", "Ask this object". Never automatically open a claimed identity from an uncertain visual similarity. If no permitted references: "Image recognition not configured; use an accession or choose from the collection." That is a completed honest experience.
- [P1, behind flag] On-device image embeddings (e.g. MediaPipe Image Embedder) for a tiny local approved reference set; implement a deterministic top-k similarity adapter, empirically calibrated threshold/abstention and unit tests. Never claim a result is visually confirmed just because an embedding ranks it #1. Do not extract persons' identities, store camera frames, phone location, faces, or raw image payloads.
- [P1] QR/barcode where an institution-approved target exists; if no QR approved, do NOT invent institutional stickers.
- [NOT FOR THURSDAY] Full object recognition across the museum, spatial anchors, continuous live AR overlay, hands-free conversational agent, public uploaded image recognition.

After confirmation, hand off {objectId, accession, sourceRevision?, recognitionMethod, candidateStatus} into the SAME conversation/evidence state, ideally via URL query with validated, encoded record ID (never raw photos, auth token, box/private values in URL). Allow "Back to actual object" and "See in Living Archive" links. Provide a photo-free demo mode with an obviously labeled synthetic target to test the complete flow.

## PHASE 4 — SCRIPT INTEGRATION / OBJECTS SPEAK (P0)

Reuse src/discovery-dialogue.mjs and src/archive-society.mjs conversationFor. Do not ask an LLM to freely invent object biographies for the presentation. Make a reusable script-contract JSON or JS data file with:
  sceneId; trigger; sourceObjectIds; persona/lens; turns[{speaker,kind,text,citedFields[],knowledgeStatus}]; alternativeBranch; nextEdgeId; unansweredQuestion; disclaimer; estimatedSeconds.
Every line is either (a) exact catalog-field quote with JSON pointer or packet source, (b) ARTIST-AUTHORED interpretation/question, or (c) explicit UNKNOWN. Speaking in first person is a theatrical construct, never an actual historic quotation. Show complete transcript and evidence ledger when selected. Fictional "Museum" voice must be explicitly marked, not impersonate Wolfsonian staff.

Prepare three deterministic interactions:
1. SPARTON / DOMESTIC MODERNITY (60–90s): Futurist: The silhouette makes modern media desirable. Worker: Who cut, shipped, maintained or repaired it? Archivist: Our public packet names its title, accession, designer, date and material; it does not establish the life of a particular household or maker. Question: What would a manual, advertising campaign or object-care record tell us? Visual: reveal Sparton -> Philips light advertising -> labor/safety comparison as **curatorial** links pending accession/source verification.
2. MACHINE AGE CATALOGUE / TEXT VS INFERENCE (~45s): the object has an exact accession but no invented page-level quotation. Archivist says the original essays/captions must be consulted before asserting what the text promises. Link to the actual library consultation request.
3. BOX VS ACCESSION / TWO MAPS (~45s): "The accession names a catalog unit; the container organizes physical care." Present empty/unknown box mapping for actual sources, and optionally a boldly simulated local demonstration of box membership, then switch that layer off. End by returning to physical object.
Place the word "SCRIPTED" visibly and link inspectable source evidence.

Voice controls:
- DEFAULT silent readable transcripts and optional Web Speech API device TTS for the actual words.
- Existing server/auth-gated ElevenLabs TTS only after explicit "send this displayed text" consent for that selection; do not send image, full CSV, private box values, museum restricted interpretation or unpublished photographs. Key remains server-only. Stop always interrupts. If provider unavailable, device speech/transcript works.
- A typed freeform question can return only bounded scripted/guided responses with explicit abstention (current replyToQuestion); a future model adapter is an interface with disabled feature flag, not a live LLM claim.
- No automatic microphones, recording or transcript persistence. If future speech-to-text is added, it must be opt-in and clearly disclosed.

## PHASE 5 — INTEGRATION / DATA PROTECTION / UI PROVENANCE (P0)

Reuse a shared selection state (selectedObjectId, selectedEdgeId, activeLens, layerFilters, conversationId, evidenceOpen) across Spatial Atlas and Object Lens, with validation against loaded record IDs. Avoid pushing private source records into public static bundles. Staff CSV and collection images stay browser-local; a public production route must default to invented sample or existing approved public packets. Expose a conspicuous source-state badge:
  VERIFIED PUBLIC PACKET; STAFF MATRIX CANDIDATE; SYNTHETIC DEMO; LAKEHOUSE LOOKUP VERIFIED; UNRESOLVED.
No invented object or edge can inherit VERIFIED from some other node. For each edge inspector: basis, exact tag/source columns or accession join, claim type, interpreted question, uncertainty, and disclosure permission.

When box maps are absent, distinguish "Lakehouse contains box data (artist-confirmed)" from "Not returned in the public lookup projection" and "No approved box-to-accession pair loaded" — not from a claim that the data doesn't exist.

Keep all external/API calls opt-in. Existing proxy must remain fixed to exact approved URL and fail closed. No automatically crawling Lakehouse. No background surveillance or image upload.

## PHASE 6 — DELIVERY / QUALITY BAR

Code and run this in order:
1. Shared relationship schema + test fixtures; add independent accession and box toggles in the existing SVG archive atlas FIRST. This is the core deliverable. The toggles must change real graph geometry and the inspector (and reflect missing box mappings honestly).
2. Integrate 36 candidate/22 curated edges with provenance flags into a source-safe ADAPTER, without shipping staff corpus or privately shared images. Start from a verified public Sparton object card and distinguish all hypothetical neighbors; do not mix invented demo objects and actual objects without a visible transition.
3. Add /demo/spatial-atlas/ using Three.js as progressive enhancement, reusing shared state. Match the visual system: warm archival paper #F6F4EB, charcoal #142523, muted teal #326D68, copper #AE6243, pale sage #DCE6DE. Editorial typography Georgia + Courier/monospace, readable 16:9 presentation.
4. Add /demo/object-lens/ with camera permissions + manual/accession fallback + candidate confirmation + safe handoff. Image embedding recognition is P1 only if P0 is solid.
5. Wire 3 SCRIPTED source-aware dialogues and local TTS / existing consented ElevenLabs controls. The evidence panel must be reachable from every surface.
6. Add stable links to the routes from the existing atlas/demo without changing frozen BEFORE functionality. Extend local server static allowlist and any Vercel rewrite/build config carefully; no publicly accessible protected museum files.
7. Run npm test, npm run test:society, npm run check:society:browser, build:demo and a targeted new browser smoke test (desktop 1440x900, projector 1920x1080, phone 390x844, tablet landscape). Test keyboard, pointer, touch, AR/camera deny, permissions cleanup, no-box, alias ambiguity, missing image, unknown accession, source-state, toggle isolation, failed WebGL, reduced motion, voice consent reset, offline load. **Do not claim PASS without actually running.**
8. Capture screenshots of the 3 interfaces using ONLY permitted generated/synthetic visuals for repo/CI; real approved in-room images remain local. Produce README and presenter runbook with exact commands, asset provenance, 90-second script and PDF/video fallback checklist.
9. Open or update a DRAFT PR targeting the appropriate review branch (not main by default). Do not auto-merge or deploy to production. If a preview is generated, verify it uses only synthetic or approved-public visuals/data. Clearly distinguish preview URL from production.

## DEMO ACCEPTANCE: after 90 seconds a visitor can answer
1. What is the selected object, and is its identity verified or illustrative?
2. Why does this connection appear (accession relation, verified box membership, shared metadata or curatorial interpretation)?
3. Can box and accession lines be turned on/off independently, and what happens when no authorized box joins exist?
4. Can I change reader perspectives without changing original museum data?
5. Can I inspect evidence and spot a claim that is unresolved?
6. Does the mobile camera ask permission, offer confirmation and avoid confidently misidentifying an object?
7. Can I return from an object conversation to the archive world and back to the physical thing?

## REQUIRED FINAL CURSOR HANDOFF — NO EMPTY STATUS UPDATES
Report branch, SHA, changed paths, actual commands/test results, local demo URLs, available preview (if any), three screenshots, exact P0/P1/blocked distinction, data/rights limitations, offline/camera/browser findings, and next actions for Andrius/Mark/Luna. If blocked, deliver the working P0 subset with a precise blocker, not a fictional completion claim.

ARTISTIC STANDARD: Every object is allowed to be curious; none is allowed to impersonate historical evidence. The moment of wonder is the network opening. The moment of critique is when evidence interrupts it. The moment of return is a person looking back at the real object differently.
