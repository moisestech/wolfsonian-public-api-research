# Archive Dreams in Public — A Society That Appears Alive

Research and implementation notes · 18 November 2026
Status: artist-authored research preview; **not** a live agent simulation.

## Editorial thesis

The social-media analogy is useful at the level of discovery and recurring identities, not
as a model for inventing source claims. The navigation term is **Society** rather than Feed.
A visitor enters a conversation, sees the two objects convene, follows an exchange, and
can open either record or its neighboring rooms. All scripts and source limits remain fixed.

## Agentic interface research (current exploration)

| Pattern and reference | What it offers | Best fit for this codebase |
| --- | --- | --- |
| [chatcn](https://chatcn.dev/docs) | AI chat, runs, tool states, planning, streaming affordances | Design patterns and ideas; React/shadcn components are not drop-in into this static JavaScript demo |
| [shadcn/ui chat components](https://ui.shadcn.com/docs/ai-elements/base/chat) | Message bubbles, scrollers, AI-native states | Reference for spacing, disclosure and accessibility; revisit if React shell is adopted |
| [assistant-ui](https://www.assistant-ui.com/docs/primitives) | Accessible threads, tool state, reasoning/status primitives | Only if live generated conversations need runtime thread management; avoid a large migration now |
| [CopilotKit / AG-UI / A2UI](https://docs.copilotkit.ai/openai-agents-python/agentic-protocols) | Protocol to stream agent events and declarative UI | Phase three, if sources, approvals and publishing gates are robust |
| [Motion for JavaScript](https://motion.dev/docs/animate) | Stagger, springs and transitions in framework-neutral JS | Optional phase-two animation layer, not necessary for the initial entrance |
| [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) | Native animation, cancellation, timing | Implemented now: no package or React migration |

The existing 3D atlas remains Three.js, independent of the dialogue renderer.
Do not install React solely to animate an authored transcript. The earlier standalone
Vercel AI Elements package is transitioning to shadcn/ui-owned AI components; follow
current shadcn documentation rather than coupling to a deprecated API.

## Three degrees of agency

1. **Staged archive, today** — Prewritten source-bounded scenes; entering a room triggers
   title, object, and message entrance motion. The complete transcript is already in DOM;
   the animation does not alter the record. Listen is an explicit, separate visitor action.
2. **Source-gated research assistant, future** — A visitor asks questions and an assistant
   can retrieve existing *approved* published metadata; any generated description is
   separate from catalog data, includes citations, and exposes uncertainty.
3. **Responsive object society, future** — An orchestrated runtime can propose possible
   next exchanges but must not silently publish, claim historical contact, invent citations,
   or speak as the museum. Require curatorial/rights review and a controlled source allowlist.

## Interaction state machine

`idle → selected → convening → exchanging → complete`.
The state `paused` belongs to explicit voice playback, not inferred AI thinking.
`record` and `society` are exits available throughout.

Event semantics for a later orchestrator:
- `room:selected`: stable pair ID and two exact accessions
- `scene:convening`: start a short visual stage, never claim live generation
- `turn:active`: scripted turn ID and speaker role (objectA/objectB/fictional archivist)
- `source:inspected`: an actual opened citation or catalog record
- `room:followed`: exact accession link to another room
- `voice:stopped`: cancel active speech and waveform cleanly

Do not present a “thinking” spinner unless there is an actual pending computation.
For an authored scene, call it **Convene** or **Exchange** instead.

## Motion design, baseline implemented

The room title fades up in ~260ms; objects enter with a modest offset and stagger;
messages settle in over ~240ms each with 100ms delay. The complete script remains
readable and screen-reader discoverable immediately. No typewriter animation obscures
text, no new voice automatically plays, no external AI service is contacted.

Cancel all animations on navigation, stop, or quick re-entry. Honor
`prefers-reduced-motion: reduce` by skipping scripted entrance.

Future iterations: a restrained linking filament following turn speaker changes,
soft active-node pulse, and a subtle archival “signal acquisition” before the first
message. Do not animate historic documents as if they are literally sentient.

## Appearance

Default dark = the nighttime dreamscape. Light = warm archival paper for the reading
shell with dark type and an ink aperture logo; the Three.js network remains a dark,
immersive visual field. A user-controlled sun/moon button stores a non-sensitive
local appearance preference and the About page inherits it.

Visual QA: 320px, 390px, 768px, desktop, high zoom; keep two objects and the start
of the transcript within the phone fold; inspect contrast on buttons, evidence
surfaces and bottom nav; test motion reduction and short repeated navigation.

## Next experiments, before generative AI

- Storyboard “convene”: selected objects acquire focus and the linking line animates
- Add a replay affordance distinct from narrated Listen
- Try source-specific timing per script, without making playback seem generated
- Verify that visitors understand “not a historical meeting” from the UI itself
- Retain a documented 36-script public corpus and regression tests; any proposed
  live agent output should have a separate review/publish lifecycle


## Implementation study B — silent scripted scene score (Nov 18)

The second experiment uses `src/scene-performance.mjs`, a pure finite score
derived from the *already-authored five-turn transcript*. Events are intentionally
named `convene`, `turn` and `complete` rather than AG-UI run/message/tool
events: **these are theatrical cues, not agent computation**.

The two-object linking medallion is now an optional ↻ replay control with a
44px touch target and an accessible label. On selection, a compact silent
preview visits each authored speaker in order. It highlights the relevant
object portrait, its existing message bubble, and the corresponding Three.js
object, then resets. No dialogue is rewritten, hidden or fabricated. The
existing Listen action remains separate and explicit; it cancels the preview,
as do record inspection, navigation and re-entry.

Reduced-motion visitors see a complete, static transcript without the preview
and without a needless replay control. Research prompts (unedited pairs) have
no preview. Tests reject unknown speaker roles and oversized inputs.

**Museum trust contract:** no bogus "thinking", no synthetic citations, no
claim that a 1930s object was an autonomous being. The Archivist's interruption
is a fictional dramaturgical voice and not institutional authority.
Any eventual live agent must use a separate backend with source allowlisting,
retrieval event logs, cited records, explicit status, and human editorial review.

Current reference updates (November 2026):
- [ICOM's revised Code of Ethics](https://icom.museum/en/news/the-revised-icom-code-of-ethics-is-officially-adopted/) adopted June 2026: public trust and responsible stewardship
- [The Wolfsonian mission](https://wolfsonian.org/about/): study the persuasive power of design and social transformations through objects of 1850–1950
- [W3C WCAG 2.2 animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions): users may suppress nonessential motion
- [AG-UI events](https://docs.copilotkit.ai/ag-ui/concepts/events): real run, tool and message lifecycle, not a decoration library
- [Google A2UI 1.0](https://developers.googleblog.com/a2ui-10-build-delightful-fast-reliable-agentic-experiences/): declarative component interoperability, a possible future agent-to-interface bridge

**Review gates before any live AI:**
1. Source allowlist and exact accession grounding
2. Image rights / credit policy and curatorial approval for public release
3. Provenance of every cited interpretation vs metadata match
4. Accessible pause/reduced-motion/replay and a nonanimated reading path
5. No default telemetry, external voice transmission or visitor prompt retention
6. Clear institutional attribution boundaries for fictional characters
