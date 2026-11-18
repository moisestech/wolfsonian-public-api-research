# First Lakehouse-to-Discovery Probe — Authorized Local Computer Only
Status: Local, read-only, capped 5-row probe. This does NOT publish or fully index the collection.
Endpoint: https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup
Existing observation: scripts/capture-lakehouse-sample.mjs used limit/offset at offsets 57200 and 64800.

## Preparation
- Open Cursor in the existing wolfsonian-public-api-research repository on the authorized Lakehouse network (and institutional VPN, if required).
- Node 24, Git. Never paste API credentials into Cursor chat or into code.
- Fetch and check out feature branch feat/local-lakehouse-discovery-probe-20261118. Preserve all uncommitted work.
- Do not enable the deployed proxy or assume Vercel has the same network access as your computer.
- Do not run a bulk crawl. This is one operator-initiated GET with a hard cap.

## The first commands

~~~bash
node --version
npm run lakehouse:probe -- --dry-run --offset=57200 --limit=5
npm run lakehouse:probe -- --live --offset=57200 --limit=5
~~~

The dry-run prints the request shape but makes no call. The live command makes exactly one GET with only two query parameters: limit and offset. It sends Accept: application/json; redirects are rejected; the timeout is 12 seconds; the body cap is 384 KiB. A non-JSON response or one exceeding five returned records fails closed. No Authorization header is sent.

Expected URL shape (already used in the research capture, NOT verified as an exact-accession filter):

~~~text
https://lakehouse.wolfsonian.org/api/v1/aa_good_lookup?limit=5&offset=57200
~~~

If this is not reachable on your authorized network, stop and examine the official documentation. Do not guess extra parameters, try restricted endpoints, or evade IP controls. If page 57200 is empty but valid and museum access rules permit it, offset 64800 was also observed in prior work; it can be tested as a *separate* bounded request:

~~~bash
npm run lakehouse:probe -- --live --offset=64800 --limit=5
~~~

To test offline without any network request:

~~~bash
npm run lakehouse:probe -- --input=test/fixtures/lakehouse-probe.synthetic.json --limit=5
~~~

Optionally append --query=tomorrow to a live command. That query searches only the downloaded local five-row index; it is NOT sent to Lakehouse.

## Where output is stored
All generated files are in the gitignored .local-research/lakehouse-probe directory, owner-only permissions.

| Filename | Contains | May be shared? |
| --- | --- | --- |
| probe-summary.json | Count, field names observed, three search hit counts | Review and share only nonsensitive counts/field names |
| discovery-index.private.json | Local normalized record fields, IDs, aliases and provenance | NO — private collection-derived text |
| search-preview.private.json | Search results and precise source text excerpts | NO — private, may contain restricted records |

Never move these files into demo/, src/, public-site/, GitHub, Drive, Cloudinary or model prompts without publication/processing approval.

## How the index works
The module src/lakehouse-local-discovery.mjs indexes *every accession-bearing record returned in the page*, even if it has zero tags, zero relationships, no object image and no authored dialogue.

- Exact primary and additional accession queries return real candidates; conflicts return all candidates instead of silently choosing one. Commas within accession values are never split.
- Search literal text in observed title, Subject, Description, Creator and other returned approved fields, with the observed field name in each receipt.
- Archive, Dream and Brain are *artist-authored* word expansion presets (e.g. Dream → tomorrow, future; Brain → signal, perception). They are NOT Lakehouse Subject fields or historical claims.
- Arbitrary user queries and local browse work. No embeddings, similarity API, freeform agent or other provider is called.
- Every candidate is marked private/unreviewed and not evidence of historical contact.
- A semantic channel is explicitly DISABLED until text reuse and model/provider permissions are confirmed.

## Validation

~~~bash
node --test test/lakehouse-local-discovery.test.mjs
node --check scripts/probe-lakehouse-discovery.mjs
node --check src/lakehouse-local-discovery.mjs
npm test
npm run build:public
~~~

The new private module and local script must NEVER appear in the public-site file allowlist. The public build does not make Lakehouse requests.

## What a successful first probe establishes
- The local authorized computer can issue a bounded GET to the observed public lookup endpoint.
- The returned JSON fields and row count are known rather than guessed.
- Every accession-bearing record from that small page is accessible through the local private registry, including silent/unconnected records.
- Archive/Dream/Brain queries produce honest literal or expanded results, including zero-match answers.

It does NOT establish the 301-object private matrix is fully reconciled, that an accession-specific filter exists, that a semantic-search route is authorized, or that any record/image may be published.

## Ask Andrius/Mark before scaling
1. What are the official lookup filtering and pagination parameters, supported count caps, and permissible local cache duration?
2. May Subject and Description be stored/embedded locally? Is any external vector-model provider allowed?
3. Which records or image derivatives may be displayed in a public visitor interface, and under which attribution terms?

Then extend to approved paging or exact lookup, record-level provenance, duplicate resolution, the private 301-node spatial study, and a separately rights-gated public corpus. Keep the current 36 authored conversation rooms and mobile society UI intact.

## Central research question
Why was a connection proposed? What evidence supports it? Where does imagination begin?
