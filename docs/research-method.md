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

## Demo packets (Trial 001)

While automated requests to the public digital host encounter a human-verification layer, Research Trial 001 uses **manually prepared public-record packets** committed under `demo/data/`. Delivery mechanism (static JSON) is separated from source claim (Wolfsonian public documentation). Packets retain accession numbers, preparation notes, missing-field lists, and links to the public pages used for citation. Interpretive agent text is labeled relative to that evidence; Counterfeit readings are explicitly marked as unsupported fabrication.
