# Wolfsonian persona icon publishing SOP

Owner: Moises Sanabria. Updated: 21 November 2026. Applies to Archive Dreams in Public / Archive Society.

## Current approved family

`flat-circular-v1`: eleven original flat symbols inspired by interwar graphic design, approved by Moises on 21 November 2026. One circular frame, transparent background, white and ink versions. These represent perspectives, not collection objects or institutional endorsements. Museum remains an artist-authored fictional viewpoint. Open is a search mode, not a twelfth persona.

| ID | Symbol |
| --- | --- |
| family | Adult and child beneath a protective arc |
| tourist | Eye, compass arrow and horizon |
| novice | Viewer facing a framed star |
| connoisseur | Classical bust and observing eye |
| worker | Hand, hammer and gear |
| archivist | Eye and open book |
| futurist | Forward profile and rays |
| mourner | Bowed head and tear |
| propagandist | Profile and megaphone |
| counterfeit | Doubled mask profiles |
| museum | Stepped doorway and vase |

## Where each part lives

- Creative archive and review kit: [Wolfsonian flat icon folder](https://drive.google.com/drive/folders/1s9gTLSqWiinu3eATDq3A1mAFZudfupHR). Keep approved ZIPs and review sheets; separate future studies from approved releases.
- Working procedure: [editable SOP](https://docs.google.com/document/d/1-jYKrhOVNCDuZTTh-7-pt0xJkTCXxIIv_PbsylFbfs8/edit). This Markdown copy travels with the code.
- Reproducible SVG masters: `assets/personas/flat-circular-v1/`. Generator: `build_flat_personas.py` in that directory.
- Exact Cloudinary asset IDs, pinned versions and delivery URLs: `docs/design/persona-flat-circular-manifest.v1.json`.
- App selection map: `src/persona-illustrated-gallery.mjs`, mirrored in `docs/design/illustrated-persona-gallery-manifest.v1.json`. Tests require agreement with the flat manifest.
- Cloudinary originals: cloud `dck5rzi4h`, prefix `archive-dreams/brand/personas/flat-circular-v1/`.
- [GitHub repository](https://github.com/moisestech/wolfsonian-public-api-research) records implementation, checks and release history. [Live application](https://wolfsonian-research.vercel.app/demo/archive-society/) serves the released version.

## 1. Define and approve the set

Keep stable persona IDs. Record the proposed visual family, all eleven ID-to-symbol assignments, palette, intended use and approval date. Moises approves the review sheet before production selection. A new artistic direction gets a new family/version; retain earlier source art and provenance.

## 2. Prepare source and exports

Use a 512 × 512 SVG viewBox. Current common ring: center 256,256; radius 222; stroke 24. Colors: white #ffffff and ink #142523. Background stays transparent. Do not bake in the app card background or labels. Retain vector masters and generate PNGs at 32, 48, 128 and 512 pixels.

To reproduce this release, install CairoSVG in a Python environment, then run:

`python assets/personas/flat-circular-v1/build_flat_personas.py /tmp/wolfsonian-flat-review`

The command exports a review sheet and per-persona sources/PNGs. It does not upload or deploy. Compare exported SVGs to the committed masters before publishing any changed artwork.

Inspect the 32px and 48px exports at native size on dark and light fields. Check consistent circles, clean silhouette, no clipped strokes or edge debris, real alpha transparency and distinct identities. Retain adjacent text labels in the application; visual legibility alone does not establish that visitors understand each symbol.

## 3. Publish an immutable Cloudinary family

Use public IDs `<id>-<tone>-master-v<version>` under the versioned family prefix. Upload SVG masters as image/upload resources. Never overwrite an active master for a new drawing; increment the family/version and retain the prior assets for rollback.

Record returned asset ID, public ID and versioned secure URL. Derive PNG deliveries using `c_scale,w_128/f_png` for compact use and `c_scale,w_512/f_png` for full use; keep the returned version component in every URL. Review 32px and 48px derivatives too.

Tag each asset with `archive-dreams`, `persona`, family, identity, tone and approval/release status. Preserve existing metadata when updating tags or context. Include the SOP and release reference. Approval means approval by the artist, not by the institution.

## 4. Wire the app on a GitHub branch

Refresh main before editing. Add the versioned SVG masters and the exact Cloudinary manifest. Update all eleven entries in the shared gallery module and its mirrored manifest. Preserve the previous mapping under priorIllustration so provenance remains inspectable.

Use white on dark surfaces and ink on light surfaces. Both desktop and mobile picker cards stay dark, so they use fixed white artwork even in the light theme. Theme-dependent conversation portraits use the current page tone. Compact badges use 128px PNGs; full picker art uses 512px PNGs. SVGs remain the source masters.

Check the desktop and phone picker, conversation speakers, room lens and Archivist portraits, zoom stage, compact identity badges and Discovery Lab. Keep names, role text and questions. Keep the error fallback chain and accessibility labels. Older approved mask studies remain separate, labeled visual references, not additional speaking personas.

If introducing another source module, include it in public-site assembly and development-server allowlists. Update the object-lens browser network allowlist narrowly for the exact cloud, family, IDs, sizes and formats used.

## 5. Validate and release

Run `node --test test/*.test.mjs` and `npm run build:public`. Restore incidental generated timestamps before committing. Tests cover all eleven mappings, both tones, source masters and legacy fallbacks.

Open a pull request explaining the visible change, approval and source links. Require the discovery/persona checks and object-lens source-first checks to pass. Browser checks must decode all eleven desktop/mobile images, exercise light/dark tones, verify the fixed-white dark picker cards, and test image-error fallback. Review browser screenshots and check native-size exports. Do not call an untested preview a release.

Merge the checked head into main. The connected Vercel project deploys from GitHub. Confirm the production deployment status, fetch the live gallery module and verify all eleven active entries use the new family. Confirm the app responds successfully. A preview or successful merge alone does not prove production updated.

## 6. Close the release record

Keep the approved ZIP and review sheet together in the Drive family folder. Update the Drive manifest in place so its file ID stays stable. Keep earlier ZIP snapshots immutable; a later production status can live in the current manifest and release record without rewriting an approved review package.

Record the PR, merged commit, production URL, validation results, approval date and prior production commit in a dated release note under docs/design. Update Cloudinary context/tags from approved-for-integration to active only after production verification. Future releases should mark this family archived when it is no longer active, while preserving the files.

## Rollback

For an icon-only rollback, restore the previous gallery mappings from priorIllustration in a new branch, keep the current UI changes, run the same checks, merge and verify production. For a full failed release, revert its merge commit through a reviewed PR. Do not delete Cloudinary masters or overwrite old versioned URLs. Update Drive and Cloudinary release status to match what is actually live.

## Release record template

Date; family/version; artist approval; eleven IDs and two tones complete; Drive folder and manifest; Cloudinary prefix; PR and tested head; merged commit; unit/build/browser results; production URL and verification; previous production commit; known limitations; rollback owner.
