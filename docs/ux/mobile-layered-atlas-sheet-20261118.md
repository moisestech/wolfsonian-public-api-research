# Archive Dreams in Public — Mobile layered atlas
**Design proposal — November 18, 2026. Not yet implemented.**

## Decision
Treat the Three.js object network as a *persistent spatial background*, with one Google Maps–style draggable archive sheet for questions, conversations, and records. Do **not** stack this sheet on top of the current five-tab mobile navigation or create another disconnected screen.

The central interaction should be continuous: **see the relationship → pull up its story → inspect its evidence → drop back into the network.** The map remains the same scene throughout.

## Current implementation and constraints
- `demo/archive-society/index.html` includes the Three.js graph in `#atlas-panel/#stage`, the conversation/record content in `#evidence-rail`, a second `#space-stage` scene, and a five-item mobile `#space-bar`.
- `demo/archive-society/society.mjs` uses `setMobileView('timeline'|'space'|'room')` and `setPanel('conversation'|'record')`. CSS hides the graph by default on mobile, showing it only in `body.show-room`, while `body.show-room .evidence-rail` is hidden.
- `mountForceStage(...)` already owns a single Three.js scene. `stage.setSpeaking(...)` and `markSpeaker(...)` already synchronize the active speaking identity.
- PR #66 implemented a mobile perspective choice and an identity-labeled waveform. Retain the *state and behavior* from that work but move the UI into the unified sheet rather than multiplying controls.
- Editorial integrity stays intact: authored scripts are not rewritten by changing perspective; unscripted pairs are labeled as research prompts; metadata overlap is not evidence of historical contact; ElevenLabs requires user approval.

## The visual system
**Layer 0 — world:** full-viewport Three.js network, never unmounted when navigating questions, scripts, or accession records. A restrained header/logo + About remain over the world. Highlight selected nodes and the edge under discussion. Outside the sheet, touches orbit/select/pinch the world.

**Layer 1 — archive sheet:** one persistent bottom sheet, not three different routes. Its surface contains a drag handle, a compact context title, a lens selector, a contextual action row, and an interior scroll region. The sheet is translucent only enough to preserve spatial continuity without hurting transcript contrast. It has no separate dark backdrop while browsing.

**Layer 2 — focus dialogs:** the native perspective picker, consent, and other exceptional modals. These temporarily interrupt the experience; they are not extra navigation destinations.

### Snap points
| State | Approx. exposed height | Visitor sees | Primary use |
|---|---:|---|---|
| **Peek** | 120–150 px + safe-area bottom | Selected question/pair, small portraits/labels, optional active speaker strip, drag handle | Explore the graph |
| **Read** (initial/default) | 55–60 dVH | Question, selected objects, first lines of conversation or question feed; still enough map visible above | Browse and follow |
| **Focus** | all but 55–75 px from top | Full transcript or record, same sheet and context, reader-first | Read, scrutinize, compare |

Use viewport-relative `clamp`/safe-area calculations instead of a hard-coded full-screen phone size. The first experience opens at **Read**, not Peek, so a first-time visitor understands the project rather than confronting only a graph.

### Sheet content states (orthogonal to height)
- **Questions** — browse other authored conversations and unedited prompts. Graph remains on the selected object/pair. Choosing a question focuses the pair and switches the sheet to Conversation/Read.
- **Conversation** — current question, two object identities, scripted bubbles, mini-player, contextual `Why these two?`. Expanded mode permits larger object artwork and full transcript. Selecting a speaker's object focuses its network node.
- **Record** — exactly the selected accession, source fields, image provenance, and a clear return to the same conversation and reading position. Start in Focus if necessary to make metadata readable.

No separate full-screen `Map` destination is required: **the map is always underneath**. A visible "Show map" button and drag-to-Peek achieve that job. The existing five-tab dock should be retired or consolidated into the sheet's compact **Questions / Conversation / Record** navigation; do not keep both. Listening belongs to the in-sheet mini-player, not a fifth global destination.

### Key interaction flows
1. **Open**: selected connection already highlighted in 3D; sheet opens Read with a readable question, two identities, and conversation preview.
2. **Drag down**: Read → Peek; map takes visual priority without forgetting the question or stopping audio. A second tap on the Peek header restores Read.
3. **Drag up**: Peek → Read → Focus. In Focus, transcript/record scrolls within the sheet. The handle remains reachable.
4. **Tap a node**: graph selects an exact record; sheet moves to Read with related questions. Tap an edge or a question: sheet switches to Conversation and highlights its two endpoints.
5. **Inspect object**: switch sheet to Record/Focus; back returns to the previous Conversation state with preserved transcript scroll.
6. **Change perspective**: use one visible `Perspective · Family ▾` chip in the sheet header. The native picker shows the five named archetypes, selected state, and their questions. It updates the shared `#lens` state; never creates a second mobile-only interpretation model.
7. **Play**: one transport; the active Object A / Object B / Archivist turns update the mini waveform/speaker label, message highlight, and map node halo. The mini-player is visible even at Peek while speech is active. Stop clears all speaker states.
8. **About**: use a discreet information affordance to explain authorship, provenance, and methodology; keep the active room clean.

### Gesture and accessibility rules
- The **handle** is the guaranteed drag target. At full height, a downward pull from the transcript's very top may collapse, but ordinary scrolling never competes with the map or sheet gesture.
- Use Pointer Events, pointer capture, `touch-action:pan-y` decisions on *specific* surfaces, and `transform:translate3d(...)` with bounded snap points. Choose the destination using nearest snap, optionally modest release velocity; no elastic page overscroll.
- The sheet also exposes explicit accessible controls: `Expand details`, `Show map`, and semantic tabs; gestures must not be the only option. Use 44px touch targets, correct `aria-expanded`/`aria-selected`, focus restoration, keyboard access and Escape dismissal for modal dialogs.
- Keep the single scrollbar in the sheet's content. Preserve per-mode reading position; collapsing should not reset the transcript.
- Respect `prefers-reduced-motion`. In that case snap immediately and use static active-speaker indication.
- Device `speechSynthesis` does not provide reliable raw audio samples. Its bars are **speaking-turn animation**, not real measured loudness. For audio files with accessible byte streams, a future Web Audio `AnalyserNode` could supply actual amplitude after consent, but it is not needed for the first release.
- Default to no autoplay. No new external provider calls, transcripts, access tokens, or collection image permissions are introduced by the layout.

## Implementation architecture
The mobile renderer should have **one** state machine:
```js
mobileUI = {
  sheetSnap: 'peek' | 'read' | 'focus',
  sheetMode: 'questions' | 'conversation' | 'record',
  selectedEpisodeId: string | null,
  selectedAccession: string | null,
  lens: existingState.lens,
  previousSheetMode: null | 'conversation' | 'questions',
}
```
Do not duplicate conversation, record, or persona source data; existing `state.episode`, `state.recordAccession`, `state.lens`, `state.conversation`, and playback remain authoritative. This object only models *mobile presentation*.

Suggested DOM scaffolding:
```html
<div class="mobile-atlas-world"><!-- existing atlas-panel with #stage --></div>
<section id="archive-sheet" data-snap="read">
  <button id="archive-sheet-handle" aria-label="Expand archive details"></button>
  <div class="sheet-context"><!-- question, persona, selection --></div>
  <nav class="sheet-views" aria-label="Archive views">Questions · Conversation · Record</nav>
  <div class="sheet-scroll"><!-- reuse existing timeline, room and record renderers --></div>
  <div class="sheet-player"><!-- one source of truth for playback + speaking --></div>
</section>
```

On mobile, convert the existing `#atlas-panel` and `#evidence-rail` into these visual layers **without mounting a second graph, cloning a transcript, or re-creating Three.js on each snap**. Desktop's two-column layout stays unchanged. Prefer moving the same DOM nodes with responsive lifecycle code over copying transcript content.

**Performance:** never call `stage.resize()` on every pointer move; CSS transforms move only the sheet. Resize the Three.js viewport on actual viewport changes, not drag frames. Recenter camera only after a node/edge selection, not for every sheet motion. Avoid rendering other unrelated nodes at high intensity while a conversation speaks. Use `requestAnimationFrame` for drag updates and a bounded animation duration for snap.

## Implementation sequence: four deliberately small PRs
**1. Shell foundation:** graph persistent under a blankish movable sheet; peek/read/focus snap points, map gestures outside it, keyboard/touch targets, no duplicate nav. Verify 320/390/768 widths and short viewport heights before touching conversation code.

**2. Content migration:** Questions / Conversation / Record share the sheet. Replace `show-timeline/show-space/show-room` screen switches with orthogonal `sheetMode/sheetSnap`. Ensure exact-accession record lookup and return to previous conversation/scroll state.

**3. Audio and perspective integration:** relocate the new PR #66 selector and speaker waveform into the sheet; use existing `markSpeaker`, `stage.setSpeaking`, consent and play/stop state. One transport, speaking node glow, no duplicate controls.

**4. Polish + QA:** focus/keyboard/screen-reader semantics, in-app deep links, reduced motion, iOS safe-area and keyboard handling, graph fallback when WebGL fails, performance on midrange phones.

## Acceptance criteria
- A selected pair remains visible in the network while the visitor reads its conversation and can return to the map with one downward gesture or explicit action.
- No hard mode switch hides/recreates the Three.js world. No WebGL context churn during snaps.
- The sheet can be operated **without gestures**, and sheet drag never steals transcript scrolling.
- The current lens is always discoverable, correctly selected, and shared between mobile/desktop.
- Speaking identity is synchronized across active transcript turn, mini waveform and graph node; inactive speech leaves no false animation. Existing no-autoplay and consent boundaries hold.
- A record belongs to one exact accession; opening/closing it preserves the conversation.
- At 320 px, 390 px and 768 px, controls do not overflow, sheet tabs and graph remain operable, and the bottom safe area is respected.
- Desktop is unchanged; tests include graph selection, drag snaps, room navigation, record return, playback cancellation, and source boundary.

## Deliberate exclusions from first implementation
No physical navigation/map tiles, geolocation, new autonomous conversations, extra floating navigation bars, audio waveform sampling from local TTS, or graphical rebuilding of the whole archive. **This is a spatial interaction refactor, not a new content system.**
