# Cursor MVP execution brief — October 14, 2026

**Project:** Archive Dreams in Public (Wolfsonian–FIU Creative Fellowship) · Umbrella: Born into the Machine
**Presentation:** October 26, 10 AM · **Final talk:** November 6, 2 PM (America/New_York)
**Canonical GitHub:** https://github.com/moisestech/wolfsonian-public-api-research
**Source of truth:** [Cursor operating contract](./cursor-residency-master-prompt.md) and GitHub issues [#4](https://github.com/moisestech/wolfsonian-public-api-research/issues/4), [#5](https://github.com/moisestech/wolfsonian-public-api-research/issues/5), [#6](https://github.com/moisestech/wolfsonian-public-api-research/issues/6), [#7](https://github.com/moisestech/wolfsonian-public-api-research/issues/7).

## Read this to Cursor

You are working inside the **existing** GitHub repository. This is a creative-technology artwork *and* an inspectable engineering/research demonstration. Do not create a new repo or scaffold a new project. Do not rename any repo, package, or Vercel deployment without checking origin and asking.

**First resolve the naming confusion:** The user's Cursor environment apparently calls something "Genesis". Do not assert a reason. Run `pwd`, `git rev-parse --show-toplevel`, `git branch --show-current`, `git status --short`, `git remote -v` (redact any token/credentials before quoting output), and inspect `package.json`, any IDE workspace file, and documented Vercel project labels. State whether "Genesis" is (a) a local folder, (b) an IDE workspace, (c) an actual git remote, (d) a deployment name, or (e) not found. The connected project GitHub remote is `moisestech/wolfsonian-public-api-research`. **Do not rename unless instructed.**

**Then execute today's testable MVP slice, not a general roadmap.**

### A. Preserve the working context

1. Fetch latest remote state and inspect commits/branches/PRs. The last connector audit (Oct 14, ~10 AM Miami) found `main` on `4cf6569`; `research/living-simulation-world` three commits ahead, containing docs, Pixi/DOM World 0.1 and no verified October MVP implementation. Do not assume the audit is still current; inspect local/remote.
2. Read the existing `docs/cursor-residency-master-prompt.md`, `docs/living-world/concept.md`, `world/src/{world-state,main,sim-loop,renderer,dom-layer,overlays}.mjs`, `world/index.html`, `world/styles.css`, `vercel.json`, tests and public Sparton data packet. Respect uncommitted work.
3. Do not change `main` or break `/demo/`. Create a small `feat/wolfsonian-4-sparton-mvp` branch off `research/living-simulation-world` if safe after checking `git status`.

### B. The precise artwork

The radio is a shared site of contested memory—not a game arena, KPI dashboard, or generic chat.

- One anchor: **Sparton 558-C radio**, accession **XX1990.1484**, existing public packet.
- **Exactly two embodied readers:** Futurist and Worker. These move toward the radio differently, look at a single object, and reveal a contradiction with minimal text.
- Futurist reads form as streamlined progress (**INFERENCE**). Worker asks whose labor, assembly, wear, repair or care the public record fails to show. **Do not state labor conditions or undocumented history as facts.**
- Archivist = **provenance/verification gate**, not a roaming third character. Propagandist = out of scope before Oct 26.
- Public states: **ESTABLISHED**, **INFERENCE**, **NOT ESTABLISHED**. Evidence must cite accession/public source link; unknown remains honestly unresolved.
- Audience should understand this sequence *visually*: WORLD → ATTENTION → CONTRADICTION → EVIDENCE LIMIT → ONSITE QUESTION. Quiet, contemplative sculpture; avoid unnecessary UI and explanatory text.

### C. First coding increment — finish #4 and a minimum evidence slice from #5

Make the smallest coherent change allowing a 60–90 sec guided sequence from the home screen to a claim/evidence/onsite question, with a clear replay path:
- Initialize only Futurist and Worker in World view. Check all arrays, movement, camera, overlays, labels, claim references and `speakingOrder` so removed agents do not break dependent code.
- Preserve separation between source packet and agent inference. Move Archivist from embodied rendering to a non-character evidence constraint.
- Use the existing world stage machinery; do not rewrite into React, introduce agents via LLM, add more museum objects or generalize to a 30-record world.
- Add a visible **Restart** button that resets stage, positions, simulation clock, spoken index, selected claim, camera/overlays, and can be exercised twice. If full reset touches many modules, design/reset central canonical state rather than ad hoc DOM clearing.
- Keep keyboard/reduced-motion behavior, and ensure the radio, two roles and provenance gate are legible on a presentation screen.
- Don't claim the live demo works until you actually open it in a browser.

### D. Offline failure discovered by repo inspection (critical #7 dependency)

Current `renderer.mjs` has a **static remote import** `https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/+esm`. `world/index.html` pulls Google fonts; agent portraits are remote Cloudinary URLs. This is a **known network dependency**, so do not mark offline DONE.

Assess two implementation options and choose the least disruptive *verified* route: bundle/vendor the exact renderer dependency locally, **or** make remote Pixi loading optional with a truly useful local DOM-only fallback. Source SVG/radio/data and critical CSS/JS must work with Wi-Fi off via local HTTP server. Fonts/portraits should degrade acceptably without third-party hosts.

Report whether this can be done in today's timebox. If not, finish the two-agent artistic slice and create a clearly documented remaining blocker for #7; do not hand-wave offline readiness or claim `file://` will work.

### E. Tests and acceptance

Run real commands with captured exit codes (Node 20+):
```sh
npm install
npm run build:demo
npm test
npx --yes serve .
```
Use the *existing* `/world/` route and `/demo/`. Capture:
1. Start frame: radio and two readers, no third agent; one image.
2. Contradiction frame: their differing attention is unmistakable; one image.
3. Research gate frame: exact accession, what public record establishes, what is interpretive, and what is unknown; one image.
4. Run A and Run B reproducibility; inspect browser console, keyboard path, reset, normal and reduced motion.
5. Wi-Fi off result as separate test (PASS or FAIL, explicitly). A screen recording of the actual guided path if the environment permits.

If UI cannot be inspected in Cursor's environment, say **NOT VERIFIED**, do not fabricate screenshots.

### F. Pull request and audit protocol

A small feature branch/PR should target `research/living-simulation-world`, not `main`. Title: `feat(world): Sparton two-reader encounter (#4)`; reference #5/#6 for only the portions implemented. Draft PR with:
- artistic change explained in 2 sentences,
- before/after screenshots/video,
- exact commands/results,
- public source / interpretive / unknown claims,
- offline status,
- residual bugs,
- SHA/branch/PR URL,
- proposed next step.

No PR auto-merge. Avoid accidentally publishing collection images or unapproved internal information.

## Checkpoint contract

**Today Oct 14 9–11 AM**: minimum acceptable outcome is an honest runnable two-reader vertical slice OR a reliable fault report with exact steps and file locations, not a vague percentage-complete claim. If only source audit fits, return the minimal implementation plan as a 1–2 hour build task; prioritize #4 over speculative #7 styling.

**Oct 20**: build 9-slide first-day deck; **Oct 21**: presentation rehearsal; **Oct 24**: freeze/offline video/PDF; **Oct 26**: first-day staff intro. The presentation is an artwork-first 12–15 minute narrative.

Content Bible:
https://docs.google.com/document/d/1cxW9K9O72xBH2Bar89q_my8pEg3glSUWnqMPouQdNzw/edit

Slides:
https://docs.google.com/presentation/d/1V7T2W-g5_uI8eWk3fdsgL9nl0G6uGVHt3PxM_CsTiCs/edit

## Cursor end-of-session response format (MANDATORY)

```
GENESIS NAME AUDIT (what is it actually?):
GIT REMOTE / BRANCH / SHA:
ISSUE / PR URL:
WORKING MVP (what a visitor can now experience):
FILES CHANGED:
TESTS (real results, include errors):
VISUAL QA (3 frames, actual evidence paths):
SOURCE / INFERENCE / UNKNOWN CHECK:
OFFLINE TEST (PASS, FAIL, NOT TESTED):
SLIDES #4–7 NARRATIVE IMPACT:
NEXT SMALLEST PATCH:
BLOCKER / DECISION FOR HUMAN:
```

All platform synchronization after Cursor is **evidence-based**: a verified PR updates GitHub; a verified milestone updates Airtable; Calendar reserves time; the Google Slides deck depicts only actual behavior. No claim of external integration unless the respective connected tools confirm the write.
