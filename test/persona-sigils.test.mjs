import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PERSONA_SIGIL_IDS,personaSigilSvg} from '../src/persona-sigils.mjs';
import {personaAssetUrl} from '../src/persona-cloudinary-assets.mjs';
import {CARD_BY_ID as CARD_MAP,portraitUrl,portraitFallbackUrl} from '../src/discovery-personas.mjs';
import {CARD_BY_ID} from '../src/discovery-personas.mjs';
const manifest=JSON.parse(await readFile(new URL('../docs/design/persona-cloudinary-manifest.json',import.meta.url),'utf8'));
test('the archive persona identity family exactly covers the eleven existing perspectives',()=>{
 assert.deepEqual(new Set(PERSONA_SIGIL_IDS),new Set(CARD_BY_ID.keys()));
 assert.deepEqual(new Set(Object.keys(manifest.personas)),new Set(PERSONA_SIGIL_IDS));
 assert.equal(manifest.counts.total,47);
 assert.equal(manifest.assetFolder,'archive-dreams/brand/personas');
});
test('all persona symbols have transparent and theme-aware full and compact assets',()=>{
 for(const id of PERSONA_SIGIL_IDS){
   for(const variant of ['full','compact']){
     for(const tone of ['white','ink']){
       const p=manifest.personas[id][variant][tone];
       assert.ok(p.publicId.startsWith('archive-dreams/brand/personas/'+id+'-'+tone+'-'+variant+'-v1'));
       assert.ok(p.svg.endsWith('.svg'));
       assert.ok(p.png.endsWith('.png'));
       assert.ok(p.png.startsWith('https://res.cloudinary.com/dck5rzi4h/image/upload/'));
       assert.equal(p.size,variant==='compact'?128:512);
       assert.equal(personaAssetUrl(id,{variant,tone}),p.svg);
       assert.equal(personaAssetUrl(id,{variant,tone,format:'png'}),p.png);
       assert.equal(portraitUrl(CARD_MAP.get(id),{variant,tone,source:'cloudinary'}),p.svg);
       assert.equal(portraitUrl(CARD_MAP.get(id),{variant,tone}),portraitFallbackUrl(CARD_MAP.get(id),{variant,tone}));
       assert.match(portraitFallbackUrl(CARD_MAP.get(id),{variant,tone}),/^data:image\/svg\+xml/);
     }
   }
   assert.match(personaSigilSvg(id,{mode:'paper',variant:'full'}),/<svg/);
   assert.match(personaSigilSvg(id,{mode:'ink',variant:'compact'}),/viewBox="352 564 325 327"/);
   assert.throws(()=>personaSigilSvg(id,{variant:'huge'}),/Invalid/);
 }
});
test('white deco variants are real linked assets, not unreviewed museum marks',()=>{
 assert.deepEqual(Object.keys(manifest.decoWhiteMasks).sort(),['aperture-mask','guardian-emblem','mask-emblem']);
 for(const asset of Object.values(manifest.decoWhiteMasks)){
   assert.ok(asset.publicId.includes('/deco-'));
   assert.ok(asset.png.includes('/f_png/'));
 }
 assert.match(manifest.rights,/not museum staff insignia/);
});
