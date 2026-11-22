# Original diffusion artwork restoration — 21 November 2026

The production mapping previously served PNG exports of procedural SVG redraws. This did not use the recent artist-selected diffusion boards. The new `diffusion-circular-v1` family uses only crops of those original raster boards; no redraw or new generation was made.

All four boards are preserved in the [source folder](https://drive.google.com/drive/folders/1Y2F2GhmJFsA0clgfOvg9caVyEd4ArTCz). Each identity in `persona-diffusion-circular-manifest.v1.json` records the original board, independent PNG crop, Cloudinary asset ID and pinned 128px/512px white/ink deliveries. The preceding active mapping is retained as `priorIllustration`. Historical SVG files remain archived for rollback.

Conversation cards identify each edge endpoint as Host, and show the selected perspective plus Archivist as Listening, deduplicated when Archivist is selected. All four portraits share 44px dimensions and visible names. Object titles are italic across cards, dialogue, records, maps and paths. Perspective names remain upright. The waveform remains decorative.

The password page replaces a 9px repeating dot pattern with broad teal/copper atmospheric gradients and slow transform animation. Inspiration reviewed: [blurred animated gradient](https://codepen.io/mente-maestra/pen/poXKJLd) and [layered clouds](https://codepen.io/najarro93/pen/NWvmyGQ). The implementation is original CSS with no third-party runtime or image dependency. Reduced-motion settings stop animation; the password flow is unchanged.

Validation: 166 unit checks pass. Public build and CI browser checks must pass before merge; production mapping must be verified before assets are marked active.

Previous production: `89b2abc5c5031b35425257c0362fe4dc68b5d5ea`.
