# November 19 — Three-voice local casting rehearsal

**Research branch:** `feat/multi-voice-local-cast-nov19`
**Review:** https://github.com/moisestech/wolfsonian-public-api-research/pull/24
**Status:** Node syntax/contract checks passed in GitHub Actions. *Audible laptop/browser output has not yet been observed or approved.*

## Why this change matters

The previous archive dialogue reused the **first installed browser voice** for every character and only changed pitch slightly. The updated `src/voice-cast.mjs` selects different **locally installed English voices** per speaker/role where the device provides them, and gives the artist-authored object A, object B, archivist, worker, futurist and other lens roles subtly different pitch/rate profiles.

One installed English local voice => honest on-screen one-voice disclosure, role-differentiated pace/pitch only. No local voice => text transcript; **never** select a remote browser voice to fake offline audio.

This does not make the scripted characters historically authentic, claim museum staff voices, synthesize new claims or create autonomous agents. Same text/source/evidence gates. Voice profiles are a theatrical reading of role, not a demographic or real-person impersonation.

## Rehearse on the machine that will present

1. Check out this review branch; run `npm ci` and `npm run demo:society`.
2. Open `http://127.0.0.1:8787/demo/archive-society/` in the actual presentation browser, select a known source object and visible connection, and click **Play**. In admin, keep provider **Local device voice**. Listen: are three different voices audible, or only cadence changes?
3. Repeat in `/demo/spatial-atlas/` (click an object, then Play) and `/demo/discovery-lab/`.
4. Confirm text-to-voice assignment and that **Stop** interrupts playback. Change object/connection or change reader while speaking and verify cancellation; verify audio never begins by itself.
5. Test airplane/offline mode with the local server already running. The script and local speech use no museum API or external voice. Note actual voice list and system/version in *private* QA notes, without uploading it.
6. Read exact accession, matching catalog Date, and explicit shared-tag disclaimer during a three-turn conversation. If no local English voices are installed, demonstrate the text script rather than silently switching to a remote service.
7. Preserve the no-live-LLM disclosure and museum source/permission boundaries.

## Optional external service (not needed for this rehearsal)

The existing, separate ElevenLabs proxy accepts only the displayed transcript after permission and uses three server-owned role IDs (`ELEVENLABS_VOICE_A_ID`, `ELEVENLABS_VOICE_B_ID`, `ELEVENLABS_ARCHIVIST_VOICE_ID`). Use **three distinct** approved voice IDs if using it; never put the API key in the browser. Merely choosing a different pitch on one voice is not three independent speakers. Check institutional permission, account usage/retention, and API budget before enabling. External-service approval does not authorize museum-photo/CSV uploads.

## Code boundaries and test recipe

```bash
npm ci
node --test test/voice-cast.test.mjs test/matrix-room.test.mjs \
  test/archive-society.test.mjs test/discovery-showcase.test.mjs
npm run demo:society
```

New source module is explicitly allowlisted by the local read-only demo server. Deployment/build pipeline on main is a **separate concern**: current Pages CI fails without installing the Playwright dev dependency and the public site should not be enlarged until staff-matrix and 76-record lookup publication terms are confirmed.

## Next dramatic improvement after Thursday

Keep source fields immutable, but let a visitor choose a counter-reader such as Worker, Futurist, Tourist or Archivist before playback. Vary **which evidence-based question** each asks, not the factual underlying record. A short human-curated library of contradictory source-bounded lines for five especially strange verified objects will be more valuable than 300 invented object personalities.
