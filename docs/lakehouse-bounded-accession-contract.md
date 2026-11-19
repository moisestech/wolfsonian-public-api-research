# Lakehouse bounded accession lookup — contract pending (November 16, 2026)

**Status:** Research/engineering proposal. Not a museum-approved request contract. Do **not** turn on the live proxy from this document alone.

**Public lookup:** `https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup`

## Observed locally (reported from museum network; not committed to GitHub)

- Read-only GET returned JSON with a `data` array, `limit: 50`, `offset: 0`.
- An on-network GET using `?limit=50&offset=50` returned another page. This is an observation of paging behavior, **not** approval for an automated scan.
- Local temporary matching of a bounded subset against an existing staff-matrix accession list yielded catalog fields including accession, title, date and creator. This was research-only; no raw response or staff matrix is checked in.
- `Media: Name` was numeric in sampled rows, not a usable image URL. No permitted box field was present in the observed records.
- Some `Accession Number` strings contain semicolon-separated values, but comma suffixes may be integral to one accession (e.g. `85.7.383a,b`).
- The application proxy currently refuses to query until `LAKEHOUSE_ACCESSION_PARAM` and `LAKEHOUSE_LIMIT_PARAM` are explicitly configured from an **authorized working example**. The museum-network GET results do not change that safety gate.
- The new multi-record enrichment described in the field report is **local/uncommitted**, not demonstrated by `main`. It must not be described as a deployed feature.

## Decision to request from Andrius

1. One complete, approved URL for a **single exact accession** such as `85.5.52.3`, with a supported `limit<=5` and example `data` response. If filtered lookup is not offered, get an approved alternative that does not require an unfiltered crawl.
2. Confirm intended behavior for pagination, stable ordering, missing records, duplicate records and semicolon-separated aliases; preserve accession comma suffixes.
3. Confirm permitted internal room display fields, whether small dated local snapshots may be retained, and whether any off-campus service may access the lookup.
4. Clarify image/thumbnail derivatives, source credits, and whether any safe high-level box association exists. Do not seek internal storage locations or unauthorized routes.
5. Confirm that Lakehouse `Subject` remains semantically distinct from staff-authored Discovery Wall thematic and motif tags unless a documented mapping is explicitly approved.

## Implementation acceptance gates (not yet fulfilled)

- Keep read-only GET proxy disabled by default; fail closed if either supported query parameter is missing.
- Request only the authorized accession and no more than five rows; **abort** if response is oversized (512 KiB), slow (12 s), wrong type, unparseable, or beyond row limit.
- Validate the returned accession identity against the exact requested ID. If the source emits semicolon-delimited values, use an approved parsing rule; **never split on comma** or declare substring/prefix matches exact.
- Distinguish `ZERO_MATCH`, `EXACT_MATCH`, `AMBIGUOUS` and `API_UNAVAILABLE`. Missing is not an evidence-based claim that the object does not exist.
- Store each approved field with system of origin, request timestamp, source field, and display/citation permission. Do not overwrite a staff tag with Lakehouse `Subject`.
- Never treat shared metadata as evidence of actual historical contact; scripted perspectives stay labeled fictional/interpretive.
- No museum photographs, private staff matrix, storage coordinates, bulk lookup dump, access credentials or cloud access claims in this public repository.
- Test no-param refusal, ignored filter/ignored limit, semicolon values, comma suffix, conflicting records and stale/offline fallback before deployment.

## November 19 fallback

Run the local Atlas using approved staff/source records with **no outbound Lakehouse requests**. Display only cleared metadata and locally loaded, session-only approved images. A reviewed small snapshot may enrich an internal card only if its storage and display terms are confirmed.

## Source contexts

- External briefing: independently prepared for Andrius, stored privately in the project's Wolfsonian research folder.
- Mark Osterman (Nov 10): Discovery Wall uses staff-authored broad categories; it is a separate closed system, not integrated with Lakehouse.
- Andrius Aukstuolis (Nov 10, 12): `aa_good_lookup` is the one public projection; internal `/records`, `/search` and `/docs` are not part of the authorized public integration.
- Original project: https://github.com/moisestech/wolfsonian-public-api-research

This document intentionally excludes underlying museum working data and is **not** a representation of an official Wolfsonian API contract.
