# MiroFish comparative experiment (out of tree)

This folder documents a **research benchmark**, not a dependency.

## Why MiroFish is not vendored here

[MiroFish](https://github.com/666ghj/MiroFish) is an open-source multi-agent simulation stack oriented toward prediction and social-media-like environments. Its repository is licensed **AGPL-3.0**.

This project (`wolfsonian-public-api-research`) is **MIT**. We deliberately do **not** copy MiroFish source into this tree, so we do not mix AGPL obligations into the public research notebook without an explicit licensing redesign.

Conceptual patterns we borrow (architecture only):

| MiroFish idea | Archive Dreams mapping |
|---|---|
| Reality seeds | Collection records / research seeds |
| Graph construction | Institutional-memory graph (`npm run build:graph`) |
| Persona generation | Bounded interpretive agents |
| Multi-agent simulation | Precomputed interpretive rounds (Model A) |
| Prediction report | Revision / residency ledger |

What we do **not** borrow: prediction branding, Twitter/Reddit metaphors, follower/like mechanics, thousands of agents, or any claim that emergent LLM behavior equals institutional truth.

## How to run MiroFish separately

Clone and follow upstream docs in a **separate directory outside this repo**:

```bash
cd ~/Documents/experiments
git clone https://github.com/666ghj/MiroFish.git
cd MiroFish
# follow upstream README for Node/Python/LLM/Zep setup
```

Do not `git submodule` it here unless licensing is revisited.

## Suggested comparative prompt

Feed ~10 Wolfsonian public descriptions (copy from `data/research-seeds/` titles + `source_text` only) and ask something like:

> Construct a simulated society whose entire knowledge of technological progress, labor, domesticity, and modernity comes from these archival records. Explore what shared beliefs and contradictions emerge.

Observe:

- which entities it extracts vs our deterministic graph;
- which personas it invents vs our bounded roles;
- where it hallucinates social facts;
- which interactions are useful for residency questions;
- which parts are wrong for institutional-memory research (prediction, social-media behavior, etc.).

Write findings in your own notes; keep AGPL-generated code out of this MIT repository.

## Later evaluation: OASIS

MiroFish credits [OASIS](https://github.com/camel-ai/oasis), an Apache-2.0 LLM social-simulation framework with configurable agents and custom platforms. **Level 3** (after this MVP) may evaluate OASIS directly without inheriting MiroFish’s prediction application. That decision is deferred.

## Relation to this repo’s Level 1

Level 1 (this PR) is a thin MIT-native engine:

- dual-layer packets (`data/research-seeds/` vs `data/interpretations/`);
- deterministic graph;
- authored simulation rounds;
- static GitHub Pages demo.

No LLM API keys are required for the public demo.
