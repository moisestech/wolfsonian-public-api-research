# Object selection method (research aid)

This is **not** an automatic ranking algorithm. It is a method for turning simulation contradictions into a preliminary residency object-request list.

## Inputs

- Featured source packets (`data/public/objects/`)
- Interpretation overlays (`data/research/interpretations/`)
- Simulation claims with `CONTRADICTS` / `REQUIRES_ONSITE_RESEARCH` / `FABRICATION_TEST` challenges
- Explicit `missing_fields` and archival “I do not know” lists

## Criteria (qualitative)

1. **Strength of interpretive disagreement** — do bounded agents sustain a real conflict?
2. **Important metadata gaps** — what cannot be resolved from the public packet?
3. **Thematic relevance** — utopia / media domestication / machine ideology / world-making
4. **Value of physical inspection** — material, scale, construction, wear, labels, verso
5. **Relationship density** — links to other featured records
6. **Staff expertise leverage** — would institutional knowledge likely change the reading?
7. **Digital unavailability** — qualities the public representation cannot show

## Output

`data/research/object-request-candidates/sim-001.json` lists candidates with:

- accession, title, source URL
- why we want to see it
- which simulation contradiction generated the request
- specific onsite research questions
- qualitative criteria notes

## Guardrails

- No invented accessions or metadata
- No claim that the list is complete or authoritative
- Counterfeit claims never generate requests as if they were facts; they generate requests to *check* fabrication risk
- Private fellowship/admin correspondence never enters this file
