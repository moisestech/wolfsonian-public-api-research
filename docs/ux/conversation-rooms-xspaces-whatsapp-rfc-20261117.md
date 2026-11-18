# Archive Dreams in Public — Conversation Rooms RFC
**Status:** design proposal, **not implemented**. November 17, 2026. Review with artist and curatorial staff before shipping.
**Primary user research:** a cold visitor liked the maps but could not explain what a connection meant, why the speaker archetypes talked, what the dialogue was trying to do, or how selecting another object changed it. The original private messages are NOT reproduced or attached to this repository.
**Current code audited:** `main` at `3714dd144946999382927fb3665731e8bd4154f7`.

## Product thesis
**Replace “I clicked two objects and got a conversation” with “I chose a question, met two designs that disagree, and found out what the collection can actually substantiate.”**

One-sentence explanation for a new visitor:
> Objects in the collection never literally spoke to each other. The artist stages imagined exchanges around documented objects, inviting you to question the futures their designs promised and check where the records support—or do not support—an interpretation.

The answer to **why these two?** must precede Play and remain one tap away from the entire scene. The answer to **what changes?** must be visible when the visitor chooses a different pair or perspective. Not more generic explanatory paragraphs, not a giant modal before joining.

## Design inspiration, without mistaken affordances
**X Spaces** gives the room form: one specific topic, recognizable participants, active speaking emphasis, stable audio controls, a way to enter and leave. We are *not* building an actual live Space. Do not use LIVE, listener counts, microphone permission, “people are here now”, chat request or fake recording indicators.
Reference: https://help.x.com/en/using-x/spaces

**WhatsApp** gives the transcript form: messages are easy to scan, speaker identity is stable, one clear thread at a time, navigation between threads, optional audio playback while remaining oriented. This is a **theatrical transcript**, not actual private correspondence: do not fake timestamps, delivery ticks, human ownership, or consent.
References: https://faq.whatsapp.com/1165411581043811 and https://faq.whatsapp.com/1189188245314343/

**The Wolfsonian** supplies the unique dimension: this is grounded in material objects and responsible catalog practice. Evidence does not become a dramatic claim just because a conversation is compelling. The fiction should provoke scrutiny, not make the museum sound omniscient.

## Concrete audit of the current implementation
- `demo/archive-society/index.html` has four top controls (Conversations, Record, Object Lens, Info), a permanent arrival-guide, a graph, and right-hand conversation rail. Preserve this recent approved header change.
- `demo/archive-society/society.mjs` builds the `encounter-orientation` block (why these two, dramatic question, what changes, methodology) **before** the bubbles. Dense explanatory copy often competes with the actual exchange, particularly in a narrow rail.
- Mobile uses `setMobileView('timeline'|'space'|'room')`; initial screen is `path-timeline`, then a large `space-stage` with transcript below, and `space-bar` Play/Evidence/Room. The `Room` button actually goes to the **graph/map**. Rename that action **Map** without changing its destination.
- `src/archive-society.mjs` has four especially edited source-limited pair scenes, while uncurated pairs use a similarly structured five-turn fallback with repeated reference-to-tag and archivist-caveat language. They are not equally rich. There is no live generative conversation engine here.
- `src/conversation-orientation.mjs` truthfully distinguishes curated vs templated scripts and explains that changing a reading perspective **does not rewrite** a hand-written curated scene. This is good data honesty; make it easier to grasp through the UI and avoid suggesting every control changes the transcript.
- `docs/conversation-dramaturgy-20261117.md` already contains the evidence/fiction boundary. Build on it, do not rewrite the ethics around “engagement”.
- Draft PR #42 (inquiry trail + fictional storage schematic) is **not in main**. Build the question-led interface contract first. Any physical box/cube integration must remain separate, fictitious and clearly labelled until staff-authorized accession-to-box fields exist.

## Information hierarchy — every episode
| Rank | Content | Example from an existing reviewed pair | UI rule |
| --- | --- | --- | --- |
| 1 | **A human question** | **Who pays the price of progress?** | Top-most large, one or two lines; an authored prompt, *not* a catalog field |
| 2 | **Two specific objects** | *Making the Engine* × *Grind Safely* safety warning | Legible brief names and visual thumbnails; accession behind Record |
| 3 | **Why paired** | Both are associated with a staff-applied Machines motif; one raises a production question, one raises a warning | One line, and a clear “not historical contact” boundary |
| 4 | **The dialogue** | A voiced disagreement that can genuinely revise one speaker's premise | Immediate, short, readable; voice playback optional |
| 5 | **Evidence and next move** | Inspect the catalog record or follow the question into another object | Inline citation action and meaningful choice, never an inferred historical claim |

Do not force a lengthy title + accession number + taxonomy above the central question. Preserve full title/accession in Record.

## Mobile — X Spaces room + WhatsApp transcript
**Entry (Conversations)**: a short plain-language sentence and an ordered set of questions, each with two tiny object thumbnails, a brief reason, an honest label: **Authored scene**, **Research prompt**, or **Artist-proposed comparison**. Start with a strong editorially curated question, not the currently selected object's raw accession/title.

**Open one room (Listen)**:
```
┌───────────────────────────────────┐
│ ARCHIVE DREAMS           ⓘ       │
│ Conversations  Record   Lens      │  (keep existing four-nav controls)
├───────────────────────────────────┤
│ ‹ All conversations   FICTIONAL   │
│ WHO PAYS FOR PROGRESS?            │  <-- question FIRST
│  [object image] ↔ [object image]   │
│  Making the Engine · Safety notice│  <-- short names, roles clear
│  Shared motif: Machines · Compare │  <-- evidence boundary, tap to inspect
├───────────────────────────────────┤
│ A: The machine gets the headline… │
│ B: But the warning names the cost.│  <-- WhatsApp-like turns, no fake timestamps
│ A: Then I missed the worker…      │
│    [Why these two?] [See record]   │
│                                   │
│   Follow-up: Whose work is seen?  │
├───────────────────────────────────┤
│ ▶ Play / ■ Stop  Evidence   Map    │  <-- persistent bottom dock
└───────────────────────────────────┘
```
**Stage height:** imagery should make this feel like X Spaces *without consuming the screen*. Cap the participant stage at ~24–30% of usable viewport on 390px phones, and ensure at least two message bubbles are visible above the bottom dock **without scrolling**. The current large stage steals too much attention from the speech.

**Controls:** retain single Play/Stop toggle and X close affordances. Button currently called `Room` opens the graph; call it **Map**. Avoid adding both “Evidence” and “Record” as competing destinations with identical purpose: one can open an anchored field drawer, the top Record control switches to the full catalog record. Both should refer to the *currently selected object/claim* with no source confusion.

**Speaker stage:** 2 object portraits/approved images (fallback to a neutral “image unavailable” illustration), short names, active-speaker emphasis, fictional archivist as optional third *reading role*, never misrepresent as staff. Big video-like portraits only when approved media exists. Caption/turn index always available and no automatic audio.

**Transcript:** text remains readable if audio fails; scroll/current utterance visible, consistent bubble alignment and voice identity. **No invented timestamps**; short audio can flow while browsing, if permissions/technical constraints allow.

**Navigation:** back returns to question list with its prior scroll position. A new scene resets active audio and title. The selected inquiry/path can remain ephemeral in memory, without automatically logging visitor history.

## Desktop — graph + persistent conversational right rail
```
┌─────────────────────────┬────────────────────────────────┐
│ COLLECTION / ATLAS      │ [Question + fiction label]     │
│                         │ Object A ↔ Object B (thumbs)   │
│   ○───○───◎             │ Why paired: shared motif       │
│   ┆ ╲  │                │────────────────────────────────│
│   ○───○  ○              │ A: [short statement]           │
│                         │ B: [objection]                 │
│ highlighted pair only   │ A: [revision]                  │
│ others fade; map moves  │ [See source]                   │
│                         │────────────────────────────────│
│                         │ ▶ Play/Stop | Record | Next    │
└─────────────────────────┴────────────────────────────────┘
```
The **map is the discovery surface**, not the explanation. Clicking an edge does four *coherent* things at once: highlight that pair, replace the room question, replace the speaker participants + transcript, and update the source-aware comparison. Do not use a generic “Machines” title as the room's headline. The right rail should not force someone to scroll past three paragraphs before seeing the first message.

Suggested desktop layout: left canvas 55–65%, right rail 35–45% with practical `minmax(360px, 520px)` bounds; sticky rail header and audio footer, transcript as independently scrolling middle. At tablet widths, preserve the conversation first and open graph as a separate view; do not squeeze three columns.

## What selecting things ACTUALLY changes
| Action | Truthful result | Never imply |
| --- | --- | --- |
| Choose an **object pair** / path | New central question, pair, rationale, script or honest research-prompt fallback, new active speaker | The objects have a documented historical link |
| Change the **reading perspective** | Changes ranking, available research questions, and uncurated fallback; **existing curated text remains unchanged** unless separately authored variants exist | That the lens writes an entirely new scene when it doesn't |
| Choose **Record / Evidence** | Specific accession, source status, catalog fields/citation as authorized; display absent fields explicitly | That interpretation, the artist's title, or a motif is primary-source evidence |
| Choose **Map** | Locates the chosen objects within the current conceptual/category network | The graph represents actual physical co-location, or a real Annex floor/box |
| Follow a **question** | A visitor-chosen inquiry path between scenes, explicitly marked interpretive | A new historical relationship between the objects |
| Choose a new scene while playing | Cancel prior voice and make the new script visible; the visitor elects to play | Two simultaneous audio rooms or a real live broadcast |

## Content quality: stories, not tags talking to tags
- **Curated episodes:** original, object-specific question, conflict, meaningful revision, source-grounded *limits*, distinctive voices, an optional unresolved ending. The source-bounded fictional archivist does not have to interrupt every episode. Move repeated source warnings into a consistent visible trust rail/drawer, but keep the fiction notice always visible.
- **Research prompt fallback:** for a pair without editorially reviewed content, show “Compare these records” with a question, the shared tag, and open Record actions. **Do not pretend** the fixed five-turn template is a bespoke dramatic encounter. Consider offering text-only rather than auto-play.
- **Voice signature:** tune roles by motive (skeptical, eager, defensive, practical, cautious), speech rhythm and what each speaker *wants*, **not** arbitrary accent, gender, pitch, or ungrounded personal memories.
- **20 questions methodology:** use Luna's supplied object-question practice as the **source of inquiry moves** (observe first, ask how made/used, examine power, challenge interpretation), not a literal 20-question chatbot and not a checklist performed in public.
- **Meaningful selection:** if another pair produces substantially the same plot and final question, it is *not* a distinctive conversation. Prioritize 3–5 excellent curated demo scenes over 100 repetitive fictional speeches.

### Suggested episode schema (not yet in code)
```ts
type Episode = {
 id: string;
 sourceAccession: string; targetAccession: string;
 sourceStatus: 'VERIFIED_CATALOG'|'STAFF_MATRIX'|'ARTIST_PROPOSAL';
 question: string; shortObjectNames: [string,string];
 linkReason: {type:'SHARED_TAG'|'ARTIST_COMPARISON'; term?:string; sourcePointers?:string[]};
 mode: 'CURATED_SCRIPT'|'RESEARCH_PROMPT';
 dramaticConflict?:string;
 turns: Array<{role:'objectA'|'objectB'|'fictionalArchivist';text:string;claimIds:string[]}>;
 claimRegistry: Record<string,{status:'CATALOG'|'CONTEXT'|'OBSERVED'|'INTERPRETATION'|'UNRESOLVED';pointer?:string}>;
 nextQuestion: string;
 editorialStatus: 'DRAFT'|'SOURCE_REVIEWED'|'APPROVED_FOR_DEMO';
 rightsStatus: 'UNCHECKED'|'AUTHORIZED';
};
```
This can be derived from current `conversationFor()` and curated scenes without changing the approved Lakehouse access contract. Do not invent a fake `VERIFIED_CATALOG` status for an item based only on a staff theme tag.

## Visual/accessibility detail
- On dark background, prioritize grayscale collection images and **one active highlight color** per selected connection; do not color every voice as if it were a verified category.
- Use a small persistent **IMAGINED EXCHANGE** descriptor. Trust is better served by one calm consistent label than caveats repeatedly interrupting the drama.
- Caption readable at 200% text zoom; sensible 16–18px body in rail and ~15–17px on phone; fixed bottom controls 44–48px; support safe-area insets and reduced motion.
- Fallback “Image not available” is better than silently swapping in an AI-generated portrait as if it depicted an archived object.
- No fake LIVE status, participant counts, message delivery ticks, dates of speech, archival quotes, physical storage mapping, or implicit user analytics.

## Implementation plan with separated pull requests
**P0 — first fold and navigation (small, low-risk):** `demo/archive-society/index.html`, `society.mjs`, `society.css`. Human question first, compact paired speaker stage, two visible bubbles at 390px, simple link reason, `Room` button renamed `Map`. Keep four-control header from PR #48. Screenshot comparisons at 320, 390, 768, 1280. No rewrite of source backends. Review as its own PR.

**P1 — episode identity and honest fallbacks:** introduce a pure `src/conversation-episode.mjs` (or extend `src/conversation-orientation.mjs`) mapping actual `conversationFor()` output to immutable `Episode` view models. A missing curated scene becomes `RESEARCH_PROMPT`, not fake personality. Add tests for source-status, pair switch and lens semantics. Keep existing archived data contract.

**P2 — three to five authored hero rooms:** artist and curator review each exact accession and the logic of the juxtaposition; never attach a general source to a different object's story. Separate research review from rights approval. Link issue #44.

**P3 — visitor question paths:** carefully pick out the parts of **draft** PR #42 that allow following a question across objects; do **not** pull in speculative box mapping as if historical. No automatic transcript logging.

**P4 — future voice/live variation:** only with approved source packets, model/voice rights, deterministic evidence/citation gates, safe fallback, privacy policy and explicit representation as a simulation. Audio provider merely renders the script today.

## Cold-reader test / success criteria
- **≤10 seconds:** without explanation, visitor identifies the current question and that the speakers are fictional.
- **≤20 seconds:** visitor describes **why this pair** (a specific tag / artist proposal) and what the relationship does *not* prove.
- **≤40 seconds:** visitor sees at least one substantive reply, not just the introductory warning, and identifies the two object speakers.
- **≤60 seconds:** visitor changes to a different object and accurately names **what changed** (question, speakers, records), then opens a piece of source evidence.
- At least **4/5 cold visitors** succeed in each test; if not, prioritize hierarchy and writing over adding more graph nodes or animations.
- Browser smoke at 320/390/768/1280; focus/back navigation; voice off/on/no local voice; voice cancellation; 200% text zoom; no fake verified claims; zero automatic visitor-profile/analytics collection.
- One staff review: can they separate catalog facts, editorial comparison, and fictional performance? If not, hold release.

## Merge / source boundaries
This RFC is a proposal only. It neither modifies production UI nor grants new Lakehouse access. Do **not** merge draft PR #42 wholesale as a dependency. Existing source contract and access checks continue to govern any actual archival evidence. Obtain relevant staff input before claiming institutional approval.

## Immediate engineering entrypoints
- `demo/archive-society/index.html`: `path-timeline`, `space-view`, `space-stage`, `conversation-content`, `voice-controls`, `space-bar`, four-control header.
- `demo/archive-society/society.mjs`: `paintTimeline()`, `renderConversation()`, `renderJuxtaposition()`, `addEncounterOrientation()`, `setMobileView()`, `paintListeners()`, `followObject()`, voice state.
- `src/conversation-orientation.mjs`: `explainEncounter()` currently covers pair rationale + lens/script truth; fold into compact episode summary instead of three paragraphs.
- `src/archive-society.mjs`: `conversationFor()` currently uses four featured edited pairs + templated fallback; mark the fallback as a research question rather than claiming a distinct dramatic script.
- `src/curated-edge-scenes.mjs`: exact pair editorial content; review with issue #44.
- `scripts/check-society-browser.mjs`: screenshot/geometry/interaction checks; add first-fold transcript and pair-switch assertions.

**Editorial principle:** A compelling artistic fiction makes visitors more curious about the real archive; it never pretends to replace it.
