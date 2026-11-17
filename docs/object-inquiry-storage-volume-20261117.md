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
