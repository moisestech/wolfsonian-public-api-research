# Thursday, November 19 — Archive Dreams in Public
## Curatorial presentation / rehearsal runbook

**Status:** An artist-authored interactive research instrument. It is not an official Wolfsonian deployment, approved collection product, live Lakehouse interface, or ElevenLabs service. This file accompanies the draft Discovery Lab PR and is intended for an internal curatorial discussion.

### The point of the work

> A museum record describes an object. A box may help locate it. A shared category can suggest a connection. An artificial voice can propose an interpretation. None of these is equivalent to knowing the object's history.

Make that distinction legible **before** introducing an artificial society. Begin with ordinary images and questions, then show the network's provenance, and finally expose its interpretive agents.

### Confirmed opening and image scope — November 14

**Opening anchor:** Sparton 558-C radio, accession **XX1990.1484**. Theme: **domestic modernity**.

**Opening question:** "What did this radio promise to bring into the home—and whose work made that promise possible?" This is an artist-authored research question, not a verified period advertising quotation or a claim about a known household.

**Image permission confirmed by Moises:** **Internal November 19 presentation only.** Use covered collection images from local files with their available exact source credits. Do not put these images in GitHub, public or protected Vercel deployments, social posts, publicly shared recordings, or public CI artifacts. Keep any rehearsal screenshots containing them local. No collection image is added to this repository by this update.

**Evidence boundary:** Verify Sparton through the approved Lakehouse lookup before presenting a live API match. Do not invent its category tags or assume it is in the Discovery Wall matrix. If it cannot yet be loaded into the Lab with verified source fields, show the radio in a local opening slide/source card, then explicitly identify the Lab's invented dataset as a separate interaction demonstration.

**Three readings to compare:** Domestic experience asks what technology promised the household; Worker asks about production and maintenance labor; Archivist asks which sources support either reading. These are questions and lenses until supported by documents.

### The three on-screen regions

| Persistent area | Meaning | Audience action |
|---|---|---|
| **Left: Who is reading?** | A transparent art-authored role with a visual identity, question, and full inspectable prompt | Select *Tourist*, *Art novice*, *Worker*, or *Archivist*. Reveal the entire prompt |
| **Center: What is connected?** | Documented record cards and computed metadata pathways; a category label is not a historical edge | Click an object, tag, or edge; pan and zoom |
| **Right: What justifies this?** | Exact tag/family/column provenance, object metadata, or intentionally scripted dialogue | Inspect shared tags; compare the object panel; ask a typed research question |

**Color language:** Teal = shared theme; copper = motif; violet = visual style; slate = geography. Persona portraits have distinctive palettes, **not** new edge-evidence types. The center graph identifies record cards by title and accession. Original abstract illustrations are *not object photos*.

### 4–6 minute live walkthrough (rehearse without Wi-Fi)

1. **00:00–00:40 — One object: Sparton.** Show the internally permitted Sparton image locally with title, accession and source credit. Ask: "What did this radio promise to bring into the home—and whose work made that promise possible?" Identify the question as the artwork's inquiry; do not imply that an advertisement, owner history or API result has already answered it.
2. **00:40–01:25 — The different readers.** Compare **Family**, **Worker** and **Archivist** perspectives. If Sparton has no verified imported Lab record, announce the switch: "The radio is our research anchor. These invented cards demonstrate how the interface changes a reading." Then switch lenses in the Lab. Do not present the invented graph as Sparton's actual network.
3. **01:25–02:10 — Reveal the rules.** Open **Reveal complete archetype prompt**. Show its reading priorities, source constraints, and blind spots; do **not** claim the prompt is running against an LLM already.
4. **02:10–03:00 — Inspect an edge.** Click a labeled category between two objects. Read the matching thematic/symbol terms and exact spreadsheet column names. Say: "The Discovery Wall uses broad, staff-assigned categories to encourage surprises. This is a different interface for examining those surprises, not a claim that two objects are historically connected."
5. **03:00–03:50 — Objects as voices.** Open **Dialogue**. Play the offline, deterministic scripted scene. Ask a question about labor or storage through the typed prototype. Say: "This voice is a fictional interpretive device. It does not substitute for the object, its maker, the museum's staff, or its documentary record."
6. **03:50–04:45 — The box and the accession.** Open **Object**. Point out the distinct catalog accession ID and missing box data **in this CSV**. Then explain the artist-confirmed fact: **Lakehouse stores both box and accession numbers, whereas this closed Discovery Wall matrix does not provide verified accession→box mappings.** Future research needs the exact authorized field route, join cardinality and permitted disclosure policy.
7. **04:45–05:30 — Return to Sparton.** Ask which advertisement, manual, production/repair record or staff insight could test the domestic-modernity and labor readings. Show the pre-existing BEFORE/ENCOUNTER/AFTER method; do not manufacture a source or an AFTER correction.

### Curatorial questions to invite at the end

- **To Mark:** What kinds of deliberately broad category matches should remain playful, and when does an association become misleading?
- **To collections staff:** What is the first object whose actual physical history would force these agents to revise an interpretation?
- **To Andrius:** Where are accession IDs and box numbers represented, how do they join, and which fields can be published? Can we validate a bounded read-only response on an authorized device?
- **To curators:** What is the minimum visible disclosure for an invented archetype to be productive without becoming a counterfeit institutional voice?
- **To communications:** Which source imagery, credits, conservation photographs, and sound can be reproduced publicly versus shown only internally?

### What is demonstrable versus proposed

| Feature | Current status | Presentation language |
|---|---|---|
| Fixed three-rail stage, large record cards, clickable edge/label inspector | **Implemented in review branch** | Demonstrate in the browser |
| Persona portraits, everyday/Archive Dreams libraries, exact viewable prompt text | **Implemented as original source SVG illustrations** | Artist-authored design system; not historical portraits |
| Mark's column schema (themes/motifs/styles/geography) | **Implemented for local CSV import** | Data remains in the device session, not committed or uploaded |
| Real artwork thumbnails | **Internal Nov 19 display permission confirmed; local covered files and credits required** | Keep collection images local; public/protected hosting and public screenshots are outside this scope |
| Offline object-to-object and typed question scene | **Implemented as deterministic scripts with device text-to-speech** | Not a live LLM; not ElevenLabs |
| Lakehouse public data access | **Not proven from the app or this cloud runtime** | Public endpoint identified by Andrius; actual response/schema to validate from authorized device |
| Lakehouse box ID to accession ID joined edge | **Not implemented** | Artist confirms both exist in Lakehouse; mapping and permissions await verification |
| Real-time visitor speech + evidence-scoped response + ElevenLabs | **Future phase only** | Requires consent, transcription, retrieval guardrails, secure back end and ElevenLabs authorization |
| Production deployment of the review branch | **Not performed** | Existing main remains untouched pending review/approval |

### Monday–Thursday gates

- **Mon Nov 16 / Andrius:** Obtain authorized example output from `/api/v1/aa_good_lookup`; verify field names and safe accession/box mappings. The cloud coding environment could not resolve the Lakehouse hostname and **cannot inherit the user's home IP allowlisting**.
- **Tue Nov 17 / Mark and curatorial feedback:** Prepare the internally permitted Sparton image and exact source credit. Choose an approved record subset or retain the invented Lab dataset; image-display permission does not authorize publication of the private matrix. Keep unapproved imagery illustrative.
- **Wed Nov 18 / artist rehearsal:** Run browser smoke, capture current screenshots, test keyboard navigation and audio; rehearse offline; freeze the SHA and maintain a slide/PDF fallback.
- **Thu Nov 19 / presentation:** Use the app as an artwork/research proposition. Show one tested, source-backed discovery or explicitly state that source evaluation remains open.

### Technical boundary for ElevenLabs

A mature conversation pipeline would be:
`visitor microphone (explicit consent) → speech-to-text → retrieval of approved museum records → a bounded persona prompt with citations and abstention → text response → server-side ElevenLabs TTS → audio + written transcript → discard or retain only as consented`.

Do **not** embed an ElevenLabs API key in `demo/`, GitHub or a client-side Vercel bundle. Do not represent fictional personified object dialogue as a historical voice or as official museum interpretation. The current demo's speech synthesis uses the browser/device only.

### Local preview for curator review

```bash
git checkout feat/explainable-discovery-lab-20261114
npx serve .
# open http://localhost:3000/demo/discovery-lab/
# or any equivalent static server at the repository root
```

If local hosting uses a different port, open the relevant `/demo/discovery-lab/` path. For the local matrix, export the appropriate worksheet to CSV, then import it through the **Source & images** panel. The original `.xlsx` file is deliberately not included in GitHub.

**Review PR:** https://github.com/moisestech/wolfsonian-public-api-research/pull/18

**Existing public research demo (untouched):** https://wolfsonian-research.vercel.app/demo/

**Private project audit and persona requirements:** https://docs.google.com/document/d/1gQaa9kXmFnj8JsjmnEpwap5_rLH6NT_tkRozPM2gGUU/edit
