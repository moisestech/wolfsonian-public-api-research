# Initial roadmap

## 0.1 — Connectivity and provenance

- Validate documented endpoint URL construction.
- Detect machine-verification pages instead of saving HTML as JSON.
- Save raw records with retrieval timestamps and endpoint URLs.
- Build a small seed corpus from thematic searches.

**Status (2026-07-21):** URL builders and verification detection are in place. Live automated requests currently receive a Cloudflare Turnstile challenge (`/turnstile-challenge`) instead of JSON. Next step for live 0.1 completion: obtain a browser session cookie locally (`WOLFSONIAN_COOKIE`) or an approved research route, then confirm one successful packet under `data/raw/`.

## 0.2 — Object packets

- Normalize BibID, accession number, title, creator, date, material, format, subjects, and files.
- Track missing fields and record-level uncertainty.
- Add citation-ready source references.

**Status (2026-09-02):** Trial 001 seeds this schema with three **manually prepared** public-record packets under `demo/data/objects/`. Live API-normalized packets remain blocked on connectivity. Missing fields (including BibID where unknown) are tracked explicitly.

## 0.3 — Research demo

- Select a few objects around labor, domestic modernity, propaganda, and technological optimism.
- Give agents bounded interpretive roles.
- Visualize agreement, contradiction, uncertainty, and source grounding.
- Produce a revision ledger for later onsite research.

**Status (2026-09-02):** Research Trial 001 ships as a static GitHub Pages demo:

- Objects: Trylon and Perisphere model (`86.17.1`), Sparton radio 558-C (`XX1990.1484`), Machine Age Exposition catalogue (`XM1999.108.8`)
- Agents: Archivist, Worker, Futurist, Mourner, Propagandist, Counterfeit
- No live API dependency; original SVG representations only
- Ledger + “Why see this object in person?” onsite prompt

Next cluster candidate (not in Trial 001): Mappemonde vase (`85.7.383a,b`).
