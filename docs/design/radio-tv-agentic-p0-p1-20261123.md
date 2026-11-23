# Radio × Television: source-gated agentic pilot

**Research date:** November 23, 2026  
**Status:** PR 1 of 3 — actual local read-only operations, not a live language model.  
**Base main SHA:** f3dadf5d951052fd0a06a20451ac61269a353fb8  
**Related:** issue #70 source-gated agent UI; issue #71 private discovery and rights; issue #25 release rights.

## Artistic contract

The authored room **radio-and-television**, "When does a household become an audience?", compares two public-research packets:

- Television: WOLF-008 / accession 2012.6.1, RCA Victor TRK 12 (1939), source: published Wolfsonian World's Fairs checklist.
- Radio: WOLF-002 / accession XX1990.1484, Sparton 558-C (1937), source: Wolfsonian Designing Deco public page.

This is an **artist-authored curatorial juxtaposition, not a documented historical relationship**. The original two-object script and eleven visitor-listener perspectives are untouched. It is not evidence that the two devices shared an owner, broadcast or audience. Collection photography is excluded.

## Implemented in this review branch

The standalone module src/radio-tv-research-tools.mjs is a browser-compatible ESM public-only tool runner. A caller supplies a loader for the two canonical public JSON packets and the existing authored relationship. It performs actual operations:

1. Validate allowed room and query intent. Unknown intents fail before retrieval.
2. Call inspect_public_record twice against WOLF-008 and WOLF-002, checking identity, accession, public-only status and source URL origin.
3. Create source-field receipts for title, accessionNumber, date, creator and materials with exact packet/field identity, original public URL, retrieved date and SHA-256 of the parsed packet JSON.
4. Call compare_public_records and preserve the existing registry's authored proposal and explicit limitations.
5. Call validate_citation_ids; a fabricated reference blocks the run. This checks reference identity only, **not semantic entailment**.
6. Emit ordered real run.started, tool.started, tool.completed/tool.failed and run.completed/run.blocked/run.failed events. Terminal tool events contain measured durations, and every event is explicitly deterministic_public_only.

The runnable CLI is scripts/demo-radio-tv-research.mjs. The regression tests are test/radio-tv-research-tools.test.mjs. A small console UI change relabels the **legacy prewritten lookup-step list** as "Guided research outline — not a live execution trace" until the real runner is connected.

These events are not fake model thinking, model token streams, AG-UI or OpenTelemetry traces. The tool does not send data to a provider.

### Run on Node 24 from repository root

    node --test test/radio-tv-research-tools.test.mjs
    node scripts/demo-radio-tv-research.mjs compare
    node scripts/demo-radio-tv-research.mjs inspect
    node scripts/demo-radio-tv-research.mjs limits
    node scripts/demo-radio-tv-research.mjs compare --bad-citation

The final command intentionally returns exit code 2 and run.blocked. Also run npm test and npm run build:public on the complete branch before merging. No test outcome is claimed without a real run.

### Test gates

- Exact WOLF-008 / WOLF-002 source identities and relation classification.
- Source-field receipts with reproducible SHA-256 hashes.
- Event sequence and real tool entry/completion/failure transitions.
- Fabricated citation blocked without partial source output.
- Unsupported intent blocked before source fetch.
- Forged accession and untrusted source URL rejected.
- Loader outage visibly fails; no raw exception text leaked into events.
- Unknown history remains not-established **in these packets**, not globally absent.

## PR 2: wire the actual research interface

Do **not** migrate the static Three.js artwork or create a second chat framework.

- Generate an allowlisted browser snapshot for these two packets from authoritative data/public/objects/ source files; prevent data drift and leaking restricted source materials.
- Introduce a validated roomId=radio-and-television context to the existing Vite/React research-console route, preserving the existing Sparton World context.
- Render actual runner events in a ToolActivityTrace with pending/complete/blocked/error states. Use the installed assistant-ui runtime, and add shadcn Trace/Code Block only if compatible and valuable.
- Add two-source receipt and PairRationale panels with source field paths, SHA-256, public links and **Historical contact not established**.
- Demonstrate inspect, compare, limits and an unsupported request, plus return to the same authored Townhall room. Browser QA: narrow mobile, keyboard/focus, reduced motion and offline fallback.

**Target flow:** authored Radio/Television dialogue → inspect claim → console → real tool reads and citation gate → inspect receipts and event trace → deliberate unsupported claim → blocked → return. No live LLM needed for this milestone.

## PR 3: conditional model-backed research and human decision

After source/rights and provider approval, optionally add bounded AI SDK-supported composition, typed tools and reviewer-proposed revisions. No automatic edit to authored room scripts, historical source packets, or museum knowledge. Human review must bind to an exact proposed change, and not be a decorative chat "approve" message.

## Museum and career gates

- Public records are artist-prepared packets; neither the original source URL nor SHA-256 proves a historical conclusion.
- Keep staff matrix, private Lakehouse captures, onsite notes, restricted imagery and unauthorized embeddings **out of public builds and model calls**. Respect issues #25 and #71.
- The artwork remains independent; museum endorsement is never implied.
- A recruiter case study must show actual successful and blocked runs, exact commit SHA, evidence receipts, failure policy, and real measured test/evaluation results.
- Do not advertise autonomous multi-agent systems or live API access until such code is deployed and demonstrated.

The quality goal is a **museum-aware investigation that explains what justifies an interpretation and refuses unsupported certainty**, without compromising the authored artwork.
