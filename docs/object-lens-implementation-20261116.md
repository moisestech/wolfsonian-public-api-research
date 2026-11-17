# Coding sprint — visitor-first Object Lens
2026-11-16 → 2026-11-19 | branch feat/object-lens-source-first-p0-20261116 | DRAFT only

## P0 implemented in this branch (code not yet merged)
- [x] Pure object-lens-core helper using six public anchor identities.
- [x] Machine Age and Sparton concept readings with Futurist/Worker/Archivist; no historic claims beyond source packet.
- [x] Mobile-first exact accession, visitor confirmation, switching, prompt and blind spot, source checks, no automatic recognition.
- [x] Consent-based camera preview; local-only speech and transcript fallback.
- [x] Atlas handoff uses exact accession. If no selected graph neighbor exists, preserve identity as isolated public packet node.
- [x] Targeted source contract and regression tests.
- [ ] Run npm ci and targeted node tests on the actual checkout.
- [ ] Inspect 375px iPhone Safari, 390px Android Chrome, keyboard, screen reader, camera denial, and device-local voices.
- [ ] Resolve issue #25 and review PR #24 and #26 before considering any merge or broader deploy.

## Exact acceptance script (60–90 seconds)
1. Open http://127.0.0.1:8787/demo/object-lens/?accession=XM1999.108.8
2. The URL fills the accession but DOES NOT confirm the identity automatically.
3. Confirm the public research identity. Do not imply a camera match occurred.
4. Switch Futurist to Worker: the research question materially changes; reveal the exact persona prompt and blind spot.
5. Switch Archivist: show what the record establishes and what the original document must still answer.
6. Try local speech; if voices are absent, point to the readable transcript.
7. Open the Atlas: accession XM1999.108.8 is selected even when absent from the 76-match graph. No fabricated relationship appears.
8. Repeat with XX1990.1484; check unknown accession, Mappemonde comma suffix, and denied camera.

## P1 research packets (next)
One verified detail, one contradiction, one source, one interpretive uncertainty for each of 6–8 objects. Document original page sources and exact credit/rights. Prioritize:
- Making the Engine 85.4.64.43 ↔ industrial safety notice TD1989.318.1. Existing metadata shares Machines, not historical causation.
- Machine-Age catalogue XM1999.108.8. Request the original essays/pages from Hannah with their reuse policy.
- X-ray Shoe Sizer XX1990.7. Verify from the exhibition source before adding as a public packet; not yet in saved 76 matches.
- First visitor-owned QR card and camera barcode detection with a no-match state.

## P2 after permission and QA
- Permission-cleared image reference set and calibrated visual candidate matching.
- A source-backed question bank by object and role. Human reviewer can accept/reject/mark unknown.
- Optional LLM answer pipeline with structured claim IDs and actual source pointers; no speculative factual prose.
- Consent-gated ElevenLabs only after the narrated scene is compelling and the data terms are clear.

## Commands
npm ci
node --test test/object-lens-core.test.mjs
npm run demo:society
# open /demo/object-lens/?accession=XM1999.108.8 on localhost
# run npm test only after installing dev dependencies

## Stop conditions
No new staff workbook or saved Lakehouse dataset committed. No collection photographs, box IDs, undocumented accessions, made-up historical quotations, external automatic speech, or public rollout. Link to GitHub issue #25 when requesting review. Preserve existing PR branches and their uncommitted work.
