# Object Lens P1 — visitor-directed source-bound conversation
2026-11-17 · Archive Dreams in Public · independent research · draft only

## Demonstration
The visitor stands before the 1927 Machine Age Exposition catalogue in the Wolfsonian exhibition. Because the copy is **on view and cannot be handled**, the visitor enters or follows a prefilled exact accession \`XM1999.108.8\` and **manually confirms** identity. Camera preview cannot recognize the object.

The phone then accepts a short visitor question. The deliberately limited local engine routes it to one of eight artist-authored topic packs; visitors can switch Futurist, Worker and Archivist on the same question and inspect factual support/unknowns. Unsupported questions return NOT ESTABLISHED, not generated history. **There is no live LLM conversation.**

### Featured 90-second scene
- Ask: "Why did the 1927 reviewer see a future, and who built it?"
- The response presents **two separately sourced parts**, not a blended omniscient narrative:
  1. E. B. White's 1927 New Yorker account of modern artworks, machine parts and display staging. Source kind: CONTEMPORARY_PUBLISHED_WITNESS; digitized-text caveat.
  2. Wolfsonian's public checklist entry for catalogue \`XM1999.108.8\`. Source kind: INSTITUTIONAL_CURATORIAL_RECORD; cover/initiator and current attribution but **no named production workforce**.
- Switch Worker: keep question and re-answer, this time foregrounding undocumented production/installation labor.
- Switch Archivist: emphasize what each source proves, what neither proves, and that the museum's on-view interior pages have **not** been inspected.
- Ask: "How many balloons were in the gallery?" The response is NOT ESTABLISHED with **zero** fabricated citation links.
- Clear: session-only transcript is gone. Open the Atlas via exact accession; unrelated records are not invented.

## Modules
- \`src/machine-age-visitor-dialogue.mjs\` — \`visitorTopicChoices\`, \`classifyVisitorQuestion\`, \`answerVisitorQuestion\`; eight topics, deterministic rules, bounded follow-up context, documented refusal.
- \`src/machine-age-research.mjs\` — 10 museum checklist claims and curated script material, source checked only to that institutional publication.
- \`src/machine-age-onview.mjs\` — contemporary New Yorker review and an access-status registry for separately held copies/scholarship.
- \`src/object-lens-core.mjs\` — exports visitor dialogue without changing the six-anchor identity resolver.
- \`demo/object-lens/index.html\` — typed question, source separated transcript, suggested questions, no-storage notice.
- \`demo/object-lens/lens.mjs\` — safe \`textContent\` assembly, claim links with \`noopener noreferrer\`, local transcript capped at 14 displayed entries, reader re-answer, clear.
- \`test/machine-age-visitor-dialogue.test.mjs\` and \`scripts/check-object-lens-browser.mjs\` — intent, refusal, source separation, browser interaction, phone dimensions.

## Source-specific contract
For every displayed claim, provide: claim ID, short statement/paraphrase, source title, locator, source type, and original HTTP(S) URL. Keep independent-copy studies and OCR page leads **outside** established institutional checklist claims. Source classifications cannot silently change because a visitor asks a leading question.

\`BOUNDED_COMPARISON\` consists of two segments: (a) 1927 contemporary witness and (b) institutional catalogue checklist. This is deliberate plural evidence. No one source proves who built the gallery, and missing information in one record is **not** proof of historical omission in the original publication.

No source pictures, film, full protected text, museum object manipulation, image-based recognition, uploaded visitor speech, transcript storage, external model calls or automatic TTS. Optional speech uses an available local-only device voice and a readable transcript fallback.

## Safety and failure behavior
- Exact accession confirmation occurs **before** any scripted visitor chat.
- Input is limited to 240 characters; unsupported/invalid/overlength prompts are rejected with no invented claims.
- Unknown object/reader refuses. Short follow-ups use prior *matched topic* only; no unbounded memory.
- Switching readers asks the same question again under the new interpretive frame, without misattributing the period author.
- Clearing wipes rendered local transcript and current conversation state. It never has been sent to a server.
- External source links are followed only when the visitor clicks them.

## Verification
\`\`\`bash
npm ci
node --test test/object-lens-core.test.mjs test/machine-age-research.test.mjs test/machine-age-primary-leads.test.mjs test/machine-age-onview.test.mjs test/machine-age-visitor-dialogue.test.mjs
npm run demo:society
# http://127.0.0.1:8787/demo/object-lens/?accession=XM1999.108.8
\`\`\`
On the branch, the isolated GitHub Actions contract additionally exercises the mobile Chromium flow. **Do not claim an Actions pass until its run succeeds**.

## P2 after curator review
Add edition-verified source passages with human review, provenance and permissions; evaluate retrieval/reranking, bounded structured model output, citation-to-claim checks, adversarial tests, and opt-in voice. Do not automatically convert the current deterministic response into a claim of historical authenticity. Physical Safari/Android, screen reader, and camera-denial review remain required.

## Project references
Private Google Doc: https://docs.google.com/document/d/1QawEhVd-9_etAi14MnYog8V1S6Vpebq-WQKNL8uHF2c/edit
PR: https://github.com/moisestech/wolfsonian-public-api-research/pull/28
Rights gate: https://github.com/moisestech/wolfsonian-public-api-research/issues/25
Roadmap: https://github.com/moisestech/wolfsonian-public-api-research/issues/29

**Release status:** draft PR; not merged, not deployed, no museum or library approval implied.
