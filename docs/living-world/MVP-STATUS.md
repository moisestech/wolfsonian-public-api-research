# Archive Dreams Living World — MVP status report

**Report date:** 2026-10-17 (America/New_York)  
**Audience:** Moises + coordinating ChatGPT (ops / slides / Airtable) + Cursor (code)  
**Repo:** https://github.com/moisestech/wolfsonian-public-api-research  

---

## 1. Verdict: is it on `main`?

**Yes.** The Living World MVP is on `origin/main`.

| Item | Value |
|---|---|
| **Freeze-candidate / BEFORE SHA** | `abf904333d6c9e7fe44d7467b5fe9abf480500a5` (`abf9043`) |
| Merge path | PR #13 → `research/living-simulation-world` @ `95b14c0` → PR #14 → `main` |
| PR #13 | MERGED — https://github.com/moisestech/wolfsonian-public-api-research/pull/13 |
| PR #14 | MERGED — https://github.com/moisestech/wolfsonian-public-api-research/pull/14 |
| Local verify (2026-10-17) | `npm test` **21/21** PASS; `world/` + `demo/` + vendored Pixi present |

### Production URLs (Vercel tracks `main`)

| Surface | URL | Role |
|---|---|---|
| Research Demo 001 | https://wolfsonian-research.vercel.app/demo/ | Institutional instrument (preserve) |
| Living World 0.1A | https://wolfsonian-research.vercel.app/world/ | Artwork / day-one demo surface |

If `/world/` 404s briefly after merge, wait for Vercel redeploy of `abf9043`.

### Rollback

Revert merge commit `abf9043` on `main` if `/world/` misbehaves. `/demo/` remains the institutional fallback.

---

## 2. What was built (code — done)

### Artistic interaction

- One object: Sparton 558-C Radio · accession **XX1990.1484** · public packet only  
- Two embodied readers: **Futurist** (form as progress) · **Worker** (labor / making)  
- **Archivist** = provenance ring/tether (not a third roaming NPC)  
- Propagandist / Mourner / Counterfeit body: deferred  
- Dramaturgy: WORLD → silent opposition → **CONTRADICTION** (click required) → ≤2 speech fragments → Claim → Evidence → Residency  
- Behavior before language: contradiction does **not** auto-skip into chat  

### Evidence / provenance

Public language in Research View:

- **ESTABLISHED** — fields from `establishedInPublicPacket`  
- **INFERENCE** — agent claim + claimType  
- **NOT ESTABLISHED** — packet limits (explicitly *not* “museum secrecy”)  
- Also shown: materials, `citedAt`, supporting `evidence[]` + `sourceRef`, onsite question  

Implementation: `world/src/world-logic.mjs` → `buildEvidenceViewModel`; rendered in `world/src/overlays.mjs`.

### Reliability

- Sim clock: max dt `1/30`; pause when tab hidden  
- Restart ×2 restores stage, time, contradiction  
- Pixi **vendored**: `world/vendor/pixi.min.mjs` (8.8.1) — not jsDelivr `+esm`  
- No Google Fonts / Cloudinary on critical path (system fonts + letter discs)  
- DOM-first boot if Pixi fails  
- Vercel rewrite: `/world` → `/world/index.html`  

### Tests & evidence artifacts

- `test/world-mvp.test.mjs` — cast, clock, contradiction gate, evidence model, reset, dual-run trace  
- Full suite: **21** tests  
- Stills (committed):  
  - `docs/living-world/evidence/A-world-before.png`  
  - `docs/living-world/evidence/B-contradiction.png` ← **recommended Slide 5**  
  - `docs/living-world/evidence/C-evidence-gate.png`  
- Protocols: `CAPTURE.md`, `OFFLINE.md` in same folder  

### What was intentionally *not* built

- Issues **#9–#12** (AFTER residency, Nov 6, case study)  
- LLM dialogue, 30-record world, four-agent RPG party  
- Agreement architecture, Counterfeit world-building, audio  
- Institutional/Lakehouse adapters with live data  

---

## 3. What is left to do (ops / human — not Cursor feature work)

Ordered by calendar gates:

### Before / at Oct 20 — Demo + deck gate

| Task | Owner | Status |
|---|---|---|
| Cold-viewer Q1–Q5 on production `/world/` | Moises (+ ChatGPT notes) | OPEN |
| Embed **B-contradiction.png** into Slide 5 | Moises / ChatGPT + Slides | OPEN |
| Confirm Vercel `/world/` and `/demo/` both live | Moises | OPEN |
| Spoken narration aligned to actual path | Moises | OPEN |

### Oct 21 — Rehearsal

| Task | Owner | Status |
|---|---|---|
| Full 12–15 min talk + 5 min technical | Moises | OPEN |
| Restart twice in rehearsal; note wall-clock | Moises | OPEN |
| Projection readability (16:9 / room) | Moises | OPEN |
| Record 60–90s walkthrough → `.tmp/` (local) | Moises | OPEN |

### Oct 24 — Hard freeze

| Task | Owner | Status |
|---|---|---|
| Wi-Fi off / DevTools Offline full path after cache flush | Moises | OPEN (`OFFLINE.md` = NOT TESTED for full offline) |
| 2–3 min fallback video → `.tmp/` | Moises | OPEN |
| Deck PDF + provenance rights check | Moises / ChatGPT | OPEN |
| Lock BEFORE SHA in Airtable / notes = `abf9043` (or later hotfix tip) | Moises / ChatGPT | OPEN |
| Close GitHub #4–#7 only after above pass | Moises | OPEN |

### Oct 26 — Staff presentation

| Task | Owner | Status |
|---|---|---|
| Present BEFORE state; do not rewrite baseline mid-talk | Moises | OPEN |
| Capture institutional questions / research leads | Moises | OPEN (#9 protocol) |

### After Oct 26 (do not squeeze into this weekend)

Issues **#9–#12**: institutional encounter logging, rights adapter, BEFORE/AFTER narrative, Nov 6 final + public case study.

### Non-code ops (outside Cursor)

Fingerprinting / background form Airtable follow-up (was ~Oct 19) — human ops only.

---

## 4. Judgments for Moises + ChatGPT (not code)

1. **Visual accept?** Is Futurist↑ / Worker↓ / CONTRADICTION stamp good enough for Oct 26, or one composition correction before freeze?  
2. **Offline bar?** Is “local HTTP + Wi-Fi off + recorded fallback” sufficient for Oct 24, or also require a git tag?  
3. **Issue hygiene:** Close #4–#7 after Oct 20 cold-viewer, or hold until Oct 24 freeze?  
4. **Airtable / Calendar:** Sync milestone to “on main @ `abf9043`; human gates remaining” — Cursor does not write Airtable.  
5. **Slides:** Replace storyboard on Slide 5 with `B-contradiction.png` from repo path above.  

### Slide 5 copy (ready to paste)

**One-liner:** Two opposed readings of one archival radio become visible as spatial tension before any sentence has to explain them.

**Staff question:** In person, which traces of making, repair, or use on the Sparton 558-C would most change whether “streamlined progress” remains a responsible reading of this public record?

---

## 5. Platform ownership (do not duplicate tickets)

| System | Owns |
|---|---|
| **GitHub** | Code, PRs, tests, SHA history (`abf9043`) |
| **Vercel** | Deploy of `main` → `/demo` + `/world` |
| **Google Slides** | Nine-slide day-one talk |
| **Google Calendar** | Oct 20 / 21 / 24 / 26 gates |
| **Airtable Life OS** | Outcomes, risks, career leverage — update from this report |
| **Content Bible** | Conceptual narrative |
| **Cursor** | Implementation only when asked; not Airtable/Slides |

---

## 6. Key file map (for ChatGPT / Cursor handoffs)

| Path | Purpose |
|---|---|
| `world/` | Living World runtime |
| `world/src/world-logic.mjs` | Pure clock / evidence / stage guards |
| `world/vendor/pixi.min.mjs` | Offline Pixi |
| `demo/` | Research Demo 001 (do not destabilize) |
| `docs/living-world/evidence/` | Stills + capture/offline protocols |
| `docs/cursor-residency-master-prompt.md` | Engineering operating contract |
| `test/world-mvp.test.mjs` | World-specific tests |
| `vercel.json` | `/world` rewrite |

---

## 7. Sync packet for ChatGPT → Airtable / Calendar

```text
STATUS: Living World MVP ON main
SHA: abf9043 (abf904333d6c9e7fe44d7467b5fe9abf480500a5)
PRS: #13 MERGED (→ research), #14 MERGED (→ main)
TESTS: 21/21 PASS
URLS: /demo/ preserved; /world/ shipped
CODE: DONE for Oct 26 vertical slice
LEFT: cold-viewer, Slide 5 media, rehearsal, Oct 24 offline+video, issue close
JUDGMENT: visual accept? offline bar? when to close #4–#7?
NEXT GATE: Oct 20 Demo + deck integration
DO NOT: invent AFTER residency outcomes; do not reopen 30-record scope
```

---

## 8. Continuity note

This file is the durable “deep report.” Update it only when a gate changes (freeze SHA, issue close, offline PASS). Prefer appending a dated subsection rather than rewriting history.
