# Research method

## Question

What kind of institutional world can be inferred from a museum's public digital record, and what remains unavailable until code encounters physical objects and the people who care for them?

## Phases

1. **Public record** — query the documented API and preserve raw responses with retrieval timestamps.
2. **Object packets** — normalize source fields, media, citations, missing values, and open questions.
3. **Interpretive experiments** — test relationships among objects without confusing speculation with museum metadata.
4. **Institutional encounter** — compare public records with physical objects, internal context, and staff knowledge.
5. **Revision ledger** — record which computational interpretations were confirmed, complicated, contradicted, or left unresolved.

## Guardrails

- Preserve source URLs and retrieval dates.
- Never write speculative psychographic attributes back into source metadata.
- Distinguish quotation, paraphrase, inference, uncertainty, and fabrication.
- Treat missing metadata as an open research condition, not proof of absence.
- Avoid visitor profiling or personal-data collection.

## Demo packets (Trial 001 / Simulation 001)

While automated requests to the public digital host encounter a human-verification layer, the public demo uses **manually prepared public-record packets**.

**Dual-layer rule:** source identity lives in `data/research-seeds/`; interpretive entities, pressures, and open questions live in `data/interpretations/`. Never mix those objects. Delivery mechanism (static JSON) is separated from source claim (Wolfsonian public documentation).

Interpretive agent text is labeled relative to evidence; Counterfeit readings are explicitly marked as unsupported fabrication. Precomputed simulation rounds are **not** a calibrated agent-based model and are **not** a prediction engine—they expose disagreement, grounding, and residency questions.
