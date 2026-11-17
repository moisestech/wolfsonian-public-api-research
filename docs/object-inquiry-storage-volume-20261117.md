# Archive Dreams — Object Inquiry + Storage Volume
Working design and implementation note, 17 November 2026. NOT a Wolfsonian finding aid, published Annex plan, or verified digital twin.

## Method from Luna's handout
The three photographed handout pages include a short and a revised "Twenty Questions to Ask an Object," with the expanded version attributed to Susan Garfinkel. It frames observation as an exchange among object, inspector, and setting, and explicitly warns against identifying meaning or use too quickly.

Our own five-phase artistic reorganization preserves all the original question numbers:
- Look before naming: questions 1–5 (sensory, material, human intervention, orientation).
- Use and feeling: questions 6–8 (possible purposes, action, emotion).
- Making and biography: questions 9–12 (production, makers, history, object groups).
- Power and exchange: questions 13–17 (identity, belief, exchange, value, agency).
- Present and reinterpret: questions 18–20 (contemporary relevance, distinctiveness, interpretation).

These five phases are NOT claimed to be Garfinkel's own headings. The implementation uses each as a visitor-selected motive for a separate seven-turn written conversation. One nine-turn example is retained in the module as an editorial reference; do not confuse this with interactive AI generation.

## A conversational dramaturgy, not three speeches
The object can resist an easy name, the visitor can correct their assumption, the worker can complicate who benefits, and the archivist can say which step exceeds the evidence. A question selected by the visitor changes the exchange itself. A varied conversation should include an actual objection and an answer to it, an unexpected but source-permissible detail, and a return to the object. Do not simply add repetitive filler to make the transcript longer.

Roles are fictional theatrical positions. None represent real historical testimony. Every statement should be marked as OBSERVED, CATALOG, CONTEXT, INTERPRETATION, SIMULATION, or UNRESOLVED. The object should not invent who owned it, worked on it, or stored it. Vary cadence, word choice, role order and length; for future scenes permit 2–10 turns depending on the question.

Language direction: use concrete names of materials, techniques and everyday work rather than abstract words like "progress" without a period source. Avoid automatic agreements, generic presenter transitions, and repeated "my title is" exposition. Include skepticism, repair, interruption and genuine unknowns.

## What to learn from NotebookLM / Gemini Notebook
Create a small source packet: an approved museum record, one authorized primary text, and Luna's question method where reuse is permitted. Generate a Deep Dive, then a Debate or Critique format. Host guidance: "one voice notices specific design promises, the other presses on unrecorded use and labor; include real disagreement and corrections; finish with a cited unknown; do not impersonate actual museum staff, makers or users."

Notebook-generated audio is a writing laboratory, NOT evidence or an authorized factual record. Annotate turns for specificity, meaningful objections, source inflation, filler, uncertainty, and successful changes of direction. Rewrite an original script from the *dramatic techniques*, not unverified claims. Keep restricted records out of third-party notebooks without permission.

## Catalog and physical layers are different databases
- Accession identifies a cataloged object or unit.
- Box or container identifier describes physical custody, not an object's intellectual history.
- A storage placement is a time-varying relation to building, floor, room, rack, shelf, and slot, with source, time and access constraints.
- A thematic/metaphorical/conversational edge is a separate interpretive relation; nearby storage does NOT establish historical kinship.

Future approved spatial records need accession, authoritative node key, container identifier, site, floor, zone, rack, shelf, valid-from and valid-to, verified-by, source reference, publication scope, and photograph/location disclosure rights. Cardinality and updates must be investigated with Andrius.

Current limits: the artist's onsite field notes say full Lakehouse contains both accession and box identifiers, but the bounded public lookup provides no confirmed box field; we have no authorized join or true Annex floor/shelf survey to publish.

## Implemented 3D study
Branch: feat/object-inquiry-storage-schematic-nov17
Route: /demo/storage-volume/

The Three.js model contains three invented schematic floors and six sample boxes labeled DEMO-BOX. Their paired DEMO accession identifiers are explicitly fictional. Four existing public catalog identities float outside the building volume, marked UNLOCATED: XX1990.1484, 86.17.1, XM1999.108.8, and 85.7.383a,b. No real box mapping or physical location is inferred.

Visitors can orbit the volume, change the illustrative level, toggle sample boxes or unlocated accessions, inspect items via pointer or keyboard-accessible buttons, choose an inquiry phase, and read a phase-dependent seven-turn authored exchange. A text interface remains if WebGL is unavailable. The source model and tests do not call Lakehouse or external voice services.

Geometry is fixed because shelves and floors should not be shuffled by force simulation; keep the existing three-forcegraph for interpretive relationships. The two views can share the accession key and provenance model while retaining very different spatial grammars.

## Release and evidence checklist
1. Browser and unit checks, public build allowlist and mobile fallback must pass.
2. The existing public build must continue excluding the staff matrix and saved internal Lakehouse sample.
3. No exact Annex location, real box identifier, or museum image should enter this public preview without reviewed permission.
4. Discuss one authorized join, the display policy and the physical layout's actual coverage with Andrius and Luna.
5. Demonstrate: question -> contested interpretation -> evidence boundary -> schematic physical archive, explicitly labeled not a floor plan.


## Nov 17 extension — Compounding Inquiry / Mission Alignment
Official museum mission reference: https://wolfsonian.org/about/ . The Wolfsonian–FIU describes using objects to illustrate the persuasive power of art and design; to explore modernity and changes in society, politics and technology; and to encourage people to learn from the past while shaping the present and future. The proposed interaction is an INDEPENDENT ARTIST'S RESPONSE, not institutionally approved museum copy.

### What actually compounds
A question should grow three ways:
1. **Dramaturgically** — a visitor asks one question, another voice objects, the next scene remembers *which line of inquiry* was previously followed, and offers a more specific counterquestion.
2. **Spatially** — the visitor can carry that question to a different catalog identity. The UI represents a VISITOR_QUESTION_PATH, never a documented association between objects. The storage cube remains a distinct physical-schema visualization.
3. **Editorially** — with research and staff review, a question can mature into a source packet with claim IDs, citations, an honest unknown, an authored scene revision and a review state. A visitor's path is **not automatically imported** into a curatorial database, training set, gallery log or institutional record.

### Code now in the same draft PR
- src/inquiry-journey.mjs: five mission-inspired inquiry movements, exactly identified by the same twenty-question editorial stages; four identity-specific opening questions; a role-based transition/bridge built from prior selected question; in-memory visit trail capped at 18; authorized-identity-only path, rejection of DEMO boxes, explicit false historicalRelationshipEstablished, optional JSON export excluding visitor text.
- demo/storage-volume: "Your questions begin to connect" panel; follow next question, compare on another catalog identity, view unresolved questions, clear, and opt-in download. Never sends selected questions to a service, localStorage or analytics.
- Object Lens: conditional link to this separate research study for only a confirmed supported accession. No URL parameter alone confirms an identity; the storage scene only accepts its known public catalog IDs.
- CI: pure provenance and dramaturgy tests plus browser interaction checks for transitions, fictional-box nonlinkage, mobile, build allowlist, absence of outbound requests.

### Editorial voice principles
- Object: a nonhuman fictional viewpoint that may refuse a human's premise; avoid claiming original memories.
- Visitor: interrupts, changes its mind, asks ordinary questions, chooses what comes next.
- Worker: exposes labor and care as questions rather than fabricating worker testimony.
- Archivist: a fictional *research protocol*, not an impersonated Wolfsonian employee; distinguishes catalog entry, period source and unestablished story.
- Setting: an active presence; the questions change if the thing is at home, a World's Fair, a public gallery, or unknown storage — but do NOT infer a true storage history from a visual fiction.

Each object-specific opening is a QUESTION derived from the published identity title, not a historical claim. The machine-era catalogue's actual checked primary sources remain in the existing Object Lens source contract; the new storage scene does not silently reuse those as evidence for unrelated objects.

### Source packet review workflow (human-edited, compounding over time)
A new proposed scene should have: {accession, title, edition/record identity, questionNumber, inquiryMovement, visitorProblem, scriptTurns[], sourceClaims[{id,sourceUri,locator,verbatimQuoteOrParaphrase}], uncertainClaims[], researchNeeded[], permissions, reviewStatus, editorialRevision}.
Claim status begins UNRESOLVED; only an explicit checked source can make an exact historical statement CATALOG or CONTEXT. Separate author/rights approval from research confidence. Mark fictional exchange on every displayed surface. Keep notes on actual visitor questions only with consent and an approved policy; for the demo the default is NO collection.

### Evaluation with Luna / collections
Use three people, 90 seconds each, and ask without prompting: what did they learn, what do they suspect, which statement was supported by an actual source, and which next object/question did they choose? Test one visitor who disagrees with the script. If they leave with a false historical belief, fewer repeated turns, lower the model's apparent authority, or add a clearer citation before making dialogue more immersive. Report the *number of sourced revisions* separately from visitor movement counts.

### Next content priorities
- Compare the same premise across the public Sparton, World's Fair model, Machine Age catalog and Mappemonde using the source packets for each. Do not claim they belonged together or were stored together.
- Add verified object-specific evidence cards only after rights/source review. Distinguish period voice, collection record, and an artist-authored objection.
- Keep the real Annex box/accession join, exact floor geometry and storage permissions off the public surface until confirmed by Andrius and approved for release.
