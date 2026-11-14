# The Conversational Atlas

An independent artist-authored research demo for **Archive Dreams in Public**. A generated allegorical archive landscape sits below object cards. Each selectable edge opens a three-turn scripted conversation and its exact CSV category provenance.

## Run locally

```bash
npm run demo:society
# Open http://127.0.0.1:8787/demo/archive-society/
```

This uses Node's standard library, with no install or account needed for the graph.
The isolated server binds to loopback and serves only the demo, its three source modules, this guide and the synthetic CSV example.
The existing Discovery Lab, Research Demo 001, /world/ and frozen source packets remain separate.

## A 4–6 minute walkthrough

1. Open the invented example. Recognize the radio/card before interpreting its relationships.
2. Select Family, Worker, then Archivist. The reading changes; the source tags do not.
3. Select a conversation edge. Inspect the matching theme/motif and the exact source/target columns. Shared metadata is a navigation route, not historical evidence.
4. Import a local CSV exported from Mark's Object at Scale worksheet. The importer reads its real header after instruction rows; it preserves themes, motifs, styles and geography.
5. Select permitted local PNG/JPEG/WebP images. Files match the exact CSV Image Filename or accession filename. Browser object URLs stay in memory. Use a local converted copy for TIFFs.
6. Load a complete bounded Lakehouse JSON response locally, or enable the authenticated server lookup below. A unique exact primary accession match can quote its Date field in the script, with the JSON pointer visible. Unknowns, component suffixes and disagreements remain visible.
7. Read the transcript, use an installed **local** device voice, or explicitly approve sending just the displayed words to ElevenLabs. Stop interrupts playback. Changing the selected reading/data invalidates external-processing approval.

The synthetic CSV at `examples/archive-society.synthetic.csv` is TEST ONLY and contains no museum records.
An atlas overview shows at most 24 cards; the default shows one object and up to six conversational neighbors.
Save selected conversation JSON downloads a local research record, not an upload. Review its contents before sharing.

## Lakehouse contract

Only `https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup` is allowed.
The proxy never accepts a client-supplied URL, follows redirects, probes internal routes, harvests pages or downloads object photos.

The sixteen public display labels are a documented projection, **not a verified live JSON schema**. The adapter recognizes candidate field aliases/wrappers and reports source pointers. It does not silently call a title similarity a match, split comma-bearing accessions, or infer box data. Additional-accession matches and ambiguous primary identities are not automatically used for spoken field quotations.

First run the existing home-network API prompt. Use the supported query contract from that result to configure an accession filter and a five-row limit. The parameter names deliberately have no guessed defaults. A mismatched/ignored limit, HTML response, error or >512 KiB decoded body fails explicitly. Requests have a twelve-second deadline and no automatic retry. Not returned in this bounded response is not a collection-wide no-match.

The server runtime must have access: a Vercel function does not inherit the laptop's home IP authorization. If cloud access is unavailable, a local bounded JSON file still supports the demonstration.

## Optional server services

Copy `examples/archive-society.env.example` to an untracked `.env.local`. Supply a separate randomly generated demo access token of at least 24 characters. Do not paste provider keys into the browser.

```bash
node --env-file=.env.local scripts/serve-archive-society.mjs
```

In the Services panel, enter only the **demo access token**. It stays in browser memory.

For Lakehouse, configure `ARCHIVE_ENABLE_LAKEHOUSE=1`, `LAKEHOUSE_ACCESSION_PARAM` and `LAKEHOUSE_LIMIT_PARAM` from the verified contract.

For ElevenLabs, configure `ARCHIVE_ENABLE_ELEVENLABS=1`, `ELEVENLABS_API_KEY`, and server-owned role IDs `ELEVENLABS_VOICE_A_ID`, `ELEVENLABS_VOICE_B_ID`, `ELEVENLABS_ARCHIVIST_VOICE_ID`. Model defaults to `eleven_multilingual_v2` and can be configured server-side. The proxy uses the documented POST /v1/text-to-speech/{voice_id} endpoint and returns audio; it does not generate conversation text.

The displayed-script preview and external-processing approval are required even with a configured account. No photograph, complete CSV or interpretive-description corpus is sent. Provider retention follows the account's settings; this demo does not claim zero retention.

Both provider routes fail closed unless explicitly enabled and authenticated. They validate origin, input length and server-owned endpoint/voice configuration, return no-store responses and expose no upstream body/credentials on errors. Per-process request guards limit a local demo (6 lookups/minute, 12 voice turns/minute); they are **not a durable quota across Vercel instances**. Before public service exposure, use deployment protection and a durable provider budget/rate limit. Keys remain server-only.

## Three separate layers

| Layer | What it means |
| --- | --- |
| Local CSV + permitted photographs | Source inputs held in this browser session; image filename is not permission |
| Lakehouse response | A separate candidate catalog snapshot with exact identifier matching and JSON-pointer provenance |
| Conversation edge | An authored interpretation of shared tags; no historical relationship is established |

The background is generated conceptual art, not a museum interior or an accession map. The sample records and schematic thumbnails are invented. Real collection images are supplied locally; the current permission scope is **internal November 19 presentation only**. No institution-only image or working matrix is committed.

The source graph's tag-ranking model is reused rather than inventing a new taxonomy. A future evidence-grounded LLM can consume approved source fields and produce validated turn/citation objects in place of the scripts. This release has **no live LLM or actual multi-agent simulation**. ElevenLabs is optional speech synthesis, not evidence generation.

## Checks and next proof

```bash
npm run test:society
npm run check:society:browser  # requires installed Playwright Chromium
```

Unit tests cover matching ambiguity, component punctuation, field quotations, filters, local photo keys, authenticated/provider gates and streaming caps without live provider calls.
The browser check uses synthetic data only and exercises edges, lenses, CSV, photos, bounded JSON, injection handling, approval reset, no-service fallback, zoom, mobile and private-file denial.

Before Thursday: run on the actual laptop; choose the real Sparton image and credit locally; verify one exact Lakehouse record or document the blocker; test voice/Stop and offline/PDF fallbacks; mark any untested historical claim UNRESOLVED.

References:
- [ElevenLabs speech API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Existing presentation runbook](discovery-lab-nov19-presentation.md)
