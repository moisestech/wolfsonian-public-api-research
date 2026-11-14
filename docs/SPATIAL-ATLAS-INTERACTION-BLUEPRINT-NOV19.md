# Archive Dreams in Public — Interaction Blueprint
**Proposal, November 14, 2026. Target: November 19 internal demonstration.**
**This is a proposed design, not an implemented feature.** Canonical implementation instructions: [Cursor Master Prompt](CURSOR-MASTER-PROMPT-SPATIAL-ATLAS-OBJECT-LENS-NOV19.md).

## Why it exists
The archive has at least two maps: catalog identity (accession, alternate accession, component) and container/storage context (box). A third map is created by human and machine interpretation. The visitor switches layers and learns that identity, co-storage and historical meaning are NOT interchangeable.

### Desktop / projector 1440–1920w
\`\`\`text
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ ARCHIVE DREAMS IN PUBLIC    [Scene: Promise / Desire / Consequences] [Present] [Help]  │
├─────────────────┬──────────────────────────────────────────┬──────────────────────────────┤
│ WHO IS READING? │ LIVING WORLD — selective node landscape │ WHAT MAKES THIS A CONNECTION?│
│                 │                                          │                              │
│ Family          │  [Sparton]───[theme:Technology]──[Radio] │  Object / Edge / Evidence    │
│ Worker          │       ╲                                  │  Exact accession             │
│ Archivist       │   [industry]  [box? no approved joins]   │  What is known / missing     │
│ Futurist        │                                          │  Shared source/tag columns   │
│                 │  [hover / select / pan / zoom]            │  SCRIPTED dialogue           │
│ RELATIONSHIPS   │                                          │  "What would change this?"   │
│ [x] Accessions  │                                          │                              │
│ [ ] Box/storage │                                          │                              │
│ [x] Shared tags │                                          │                              │
│ [x] Interpret.  │                                          │                              │
└─────────────────┴──────────────────────────────────────────┴──────────────────────────────┘
\`\`\`
No one needs to infer edge meaning from color alone. Each line has on-hover/on-tap edge type and an inspector explanation. An accession can be a displayed ID node; box is a physical grouping node only after approved map. No verified box data => visible empty-state sentence, not secretly synthesized box lines.

### Tablet touch kiosk
Pan/zoom canvas fills top ~65% with an always-visible selected-object chip. A bottom inspector is a swipeable **but button-accessible** drawer, with visible tabs: Connections | Ask | Evidence. A collapsible side filter rail (not a hover menu). Touch targets >=44 CSS px; no cursor dependency. Reset accessible in two taps.

### Phone / Object Lens
\`\`\`text
┌──────────────────────────────┐
│ [<] THE OBJECT LENS   [Help] │
│                              │
│    camera OFF until tap      │
│ [ Enable camera ]            │
│                              │
│   Center the object or its   │
│   accession label in frame   │
│                              │
│ [Capture] [Type accession]   │
├──────────────────────────────┤
│ POSSIBLE MATCH · unverified  │
│ [small source-safe preview]  │
│ Title / accession / source   │
│ [Confirm] [Not this object]  │
│ [Ask]  [See in atlas]        │
└──────────────────────────────┘
\`\`\`
After confirmation: a chat-like but **bounded** dialogue reading of the object. Source citations are always one tap away. A final CTA: "Look back at the object." Do not treat the device camera as a generative historical interpreter.

### Visual system
- Background: keep original generated allegorical \`demo/archive-society/assets/archive-landscape.jpg\` for now; use depth-separated replicas/transparent assets later, never distort or overwrite original image.
- Palette inherited from current 22-slide working deck: paper #F6F4EB, charcoal #142523, teal #326D68, copper #AE6243, sage #DCE6DE; editorial Georgia and Courier accents.
- Source nodes: solid archival card; candidate records: paper-edge hatch/border; private/unavailable images: schematic silhouette; identity nodes: square accession badge; physical boxes: rounded carton marker; interpretations: dashed paths; conversations: moving dots and transcription panel.
- Generated art cannot look like falsely documented historic material; actual museum photos must be provided locally in the presentation environment with credit and image-use scope.
- Default overview density: one highlighted object plus up to six neighbors. Overview max 24. Focus > zoom > inspect > cite; avoid 301-object hairball.

## Content dramaturgy — 90 second demonstrable path
**00:00–00:15 / The object appears.**
Narrator: "This is the Sparton 558-C, accession XX1990.1484. We know how the catalog identifies it. What did this radio promise to bring into a home?"
UI: one object card and its source badge. Collection image only if local, credited, internal-presentation approved; otherwise original schematic.

**00:15–00:35 / Two distinct maps.**
Click Accessions ON: object→identity node with its exact label. Click Box ON: show no verified box joins in publicly permitted dataset, and the honest message: "Box identifiers exist in Lakehouse; this public view has no authorized mapping loaded." Toggle them independently OFF/ON.

**00:35–01:00 / The interpretive society speaks.**
Choose Worker; show a curated *question* that compares the radio's aesthetic promise with production/maintenance; never assert a specific maker's biography. Switch to Futurist. Let the same object remain factual while the reader changes.

**01:00–01:20 / Evidence interrupts.**
Archivist: "The record establishes a designed object, not how one household listened or who assembled this particular set." Open the cited public source packet. Show a traceable \`NOT ESTABLISHED\` state.

**01:20–01:30 / Return.**
"Which object, record or staff account would change this interpretation?" [Look back at object] / [Explore the archive] buttons.

## Secondary experience: Object Lens (90-second kiosk demo)
1. Tap Enable camera; opt-in permission; camera badge clearly visible.
2. Point at a PRINTED/APPROVED TEST CARD or type exact accession. If recognition references aren't loaded, show **not configured**, not a fake match.
3. See candidate with "possible match" and exact source identifier; confirm identity explicitly.
4. Tap Ask: pick Domestic | Worker | Archivist. Show source-bounded scripted dialogue with local TTS optional.
5. Tap See network: open selected object in Atlas; tap Look back at object to close session. Camera track MUST stop on navigation.

## Recommended visual assets / slide integration
- **P0**: capture 3 code-generated UI screenshots using synthetic/sample records: (a) accession ON / box OFF, (b) box ON with empty state and source question, (c) scripted Sparton evidence interruption. Screenshots of restricted photos stay local.
- **P0**: object lens storyboard frame: permission request, candidate confirmation, evidence conversation. Keep all labels native/HTML, not diffusion-baked words.
- **P1**: second 16:9 conceptual background with spatial clearings and two transparent foreground overlays; derive only from original conceptual scene, not an exact Bosch copy. Missing assets should not block functionality.
- Slides 8 (identity/storage), 9 (network), 10 (edge types), 12 (actual lab), 13–14 (object conversation and artificial society), 15–16 (mobile lens and matching), 19 (proof versus proposal) are the natural update slots. Only replace slide visuals with actual tested screenshots or explicitly labeled concepts, never a speculative render labeled "working demo."

## Implementation priority
P0: accession/box layers in existing SVG atlas + evidence inspector + scripted source-bounded dialogue and browser smoke; this alone should carry November 19.
P1: Three.js spatial rendering mode and mobile Object Lens with permission/confirmation/manual fallback.
P2: calibrated on-device visual embeddings, actual authorized box join, external ElevenLabs voice on explicit consent, live source-grounded generative discussion. Never sacrifice reliable P0 to suggest P2 is working.

## Source and ethics gates
- Mark's matrix may be browsed locally but not committed or published wholesale.
- Current Lakehouse public 16-field projection does not identify the box-number field. Ask Andrius for safe join and display permission.
- No actual collection photographs shipped in public static builds under Nov 19 internal-only permission.
- No facial recognition of visitors. No camera frames sent to external models or stored.
- Any simulated object voice must identify itself as artistic interpretation. The museum is a human institution, not an oracle the software can impersonate.
