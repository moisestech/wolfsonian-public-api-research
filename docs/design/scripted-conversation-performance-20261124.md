# Performed Conversations: visual dynamics for Archive Society

**Status:** isolated implementation PR, based on production `main` at `f3dadf5`. This is a visitor-interface change; it does not modify the forty edited conversations, eleven lens definitions, historical source packets, or museum collection data.

## Why

A conversation scene should *feel alive* when someone presses the circular **↻** replay button: object A and object B visually take turns, the words reveal like performed writing, the relevant node glows, the speaker identity appears in the transport strip, and the viewer can inspect why the pairing exists and how their selected fictional perspective frames the question.

The display must not claim that fictional archival objects literally spoke or that a machine is conducting live research when it is only replaying an authored transcript.

## Components and states

| Component | Implementation | Actual behavior |
| --- | --- | --- |
| Performance score | `performedScenePlan` in `src/scene-performance.mjs` | Builds a bounded editorial cue schedule based only on the five existing authored turns. Durations scale with the character count; this is not model latency. |
| Performance transport | `#scene-performance` in `demo/archive-society/index.html` | Real-time progress, role identity, pause/resume, and links to existing Evidence and Perspective interfaces. |
| Visual type reveal | `startPreviewTyping` / `advancePreviewTyping` in `society.mjs` | An `aria-hidden` duplicate of the existing paragraph reveals characters; the *original full paragraph and its source markup remain in the DOM* and accessible. No authored words are replaced or streamed from a model. |
| Speaking gradient | `society.css` | Current object portrait/bubble and graph node share a role-based cue. The gradient advances from actual local replay time. |
| Silent audio-style strip | Existing `#voice-controls` | Displays who is being *performed*, with an explicitly **silent scene** label. Bars are an editorial activity indicator, **not measured audio waveform**. The actual Play button continues to mean audio. |
| Pause and replay | `previewSession` on an animation-frame clock | Pause freezes progress and typing; resume continues. Room changes, record inspection and actual audio start cancel the visual-only run. |
| Inspect why/personality | Existing `#conversation-sheet` / `#prompt-sheet` | The performance dock opens the same evidence and perspective explanations as the current room UI. No duplicated private data or new model instructions. |

### Different kinds of visible activity

- **Authored scene performing:** words and glows follow scripted turns. UI label: `SCRIPTED · SILENT PERFORMANCE`.
- **Actual voice playing:** the existing TTS controls and active-speaker display. External voice processing still needs explicit approval.
- **Actual archival tool execution:** separate, deterministic observed events in draft [PR #103](https://github.com/moisestech/wolfsonian-public-api-research/pull/103) and [PR #104](https://github.com/moisestech/wolfsonian-public-api-research/pull/104). Not integrated with this authored replay by this PR.
- **Model reasoning / autonomous agent:** **not implemented**. Never substitute a fake thinking loader for missing model tool events.

## Design constraints

1. **Full transcript is always in the DOM**; a secondary visual-only `aria-hidden` span animates the copy. No re-generation, auto-insertion of citations, or historical claims.
2. **Accessibility:** respects `prefers-reduced-motion` (original replay is disabled), progress has an accessible label, status updates on turn changes rather than every animation frame, pause/resume is keyboard accessible, and there are no unsolicited sound effects.
3. **Bounded cost:** five approved turns, max 3.5 seconds each, one requestAnimationFrame clock, cleanup on scene changes. No animation libraries needed.
4. **Rights:** no new images, packets, API requests, model calls, or provider credentials. It operates exclusively over current authored scene objects.
5. **Mobile:** keeps the existing bottom navigation as the real audio transport. Silent performance has a separate readable status strip; no second Play button.
6. **User control:** replay is available via the existing central icon; pause/resume and both inspection links are visible alongside progress.

## Learning map

The components are deliberately small and separable:

- A **cue plan** is a pure function. It takes structured authored turns and returns timings without manipulating the DOM.
- A **playback state machine** remembers elapsed time and a paused state. This makes animation honest and interruptible.
- A **view** reads state to update text, speaker glows, progress and controls.
- A **provenance inspector** explains *why* the content exists and what evidence supports it. It is distinct from playback.
- An **agent tool trace** (future integration) should be driven only by genuine retrieval/tool events rather than editorial cue timing.

This implementation uses existing JavaScript, CSS, SVG/Three.js and Web Animations APIs. It does not add React, assistant-ui, Motion, or shadcn to the main society page; that would increase bundle size without changing what this performance actually does.

## Verification

```sh
node --test test/scene-performance.test.mjs test/conversation-ux.test.mjs
npm test
npm run check:society:browser
npm run build:public
```

The browser smoke asserts scripted mode, typed visual duplication, full transcript retention, no voice-provider call, live speaker state, pause/resume, evidence and persona inspector access, eventual cleanup and screenshot output.

Before merging, inspect desktop and 320/390px captures, play actual device speech, switch lens mid-preview, and verify that reduced-motion users get a fully readable static scene. Do not merge just because animated text looks attractive.

## Natural follow-on (separate PR)

Once the existing two public-packet research-console drafts are merged and rights-approved, integrate a **Living Research Dock** into the same room with strictly distinct styling for `tool.started`, `tool.completed`, `run.blocked` and source receipts. Clicking `Why these two?` should be able to open genuine research, while authored speech remains separately indicated. Do not represent a curated pairing as proof of historical contact.
