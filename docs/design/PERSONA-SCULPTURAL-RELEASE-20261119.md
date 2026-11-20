# Sculptural persona artwork release — November 19, 2026

All eleven identities now use the existing Cloudinary `sculptural-masks-v3` limestone PNG masters: Family, Tourist, Art Novice, Art Connoisseur, Worker, Archivist, Futurist, Mourner, Propagandist, Counterfeit and Museum. Open remains a search mode. This supersedes the earlier same-day incomplete-set status in the audit notes.

The gallery, conversation portraits, zoom stage, compact badges and Discovery Lab share the new artwork. Both themes preserve its sculptural limestone color. Full images render at 1024 pixels and compact images at 192, with automatic delivery format and quality. Original asset IDs and pinned URLs are recorded in the gallery manifest; prior artwork remains available for rollback. Existing SVGs remain failure fallbacks and explicit legacy exports.

The artist requested this integration; this is not institutional endorsement. Museum remains a fictional artist-authored viewpoint. Cloudinary provenance is preserved, with app usage and repository context added to all eleven records. No duplicate uploads were needed.

Validation: 154 unit tests pass; public production build passes; all eleven compact delivery URLs return decodable 192px images. Local Chromium is blocked by the environment, so actual browser acceptance runs in GitHub Actions. Browser checks now verify all eleven images decode in both desktop and mobile galleries and compact badges, along with existing selection, theme and fallback behavior.
