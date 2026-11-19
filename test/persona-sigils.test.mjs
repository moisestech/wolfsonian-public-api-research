import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PERSONA_SIGIL_IDS,personaSigilSvg} from '../src/persona-sigils.mjs';
import {personaAssetUrl,decoStudyUrl,DECO_STUDY_IDS,personaCharacterUrl} from '../src/persona-cloudinary-assets.mjs';
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
       assert.equal(portraitUrl(CARD_MAP.get(id),{variant,tone}),p.svg);
       assert.equal(portraitUrl(CARD_MAP.get(id),{variant,tone,source:'local'}),portraitFallbackUrl(CARD_MAP.get(id),{variant,tone}));
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
 assert.deepEqual([...DECO_STUDY_IDS].sort(),Object.keys(manifest.decoWhiteMasks).sort());
 for(const [id,asset] of Object.entries(manifest.decoWhiteMasks)){
   assert.ok(asset.publicId.includes('/deco-'));
   assert.ok(asset.png.includes('/f_png/'));
   assert.equal(decoStudyUrl(id),asset.svg);
   assert.equal(decoStudyUrl(id,{format:'png'}),asset.png);
 }
 assert.throws(()=>personaAssetUrl('aperture-mask'),/Unknown persona symbol/);
 assert.match(manifest.rights,/not museum staff insignia/);
});
test('illustrated portraits preserve approved v2 and expose eight v4 characters',async()=>{
 const portraits=JSON.parse(await readFile(new URL('../docs/design/persona-character-portrait-manifest.v2.json',import.meta.url),'utf8'));
 assert.equal(portraits.counts.total,22);
 assert.equal(portraits.counts.mainPortraitAssets,18);
 assert.equal(portraits.counts.alternateFamilyAssets,4);
 let primary=0;
 for(const [id,group] of Object.entries(portraits.personas)){
  for(const [palette,sizes] of Object.entries(group.variants)){
   for(const [variant,asset] of Object.entries(sizes)){
    primary++;
    assert.equal(personaCharacterUrl(id,{palette,variant}),asset.url);
    assert.match(asset.url,/\/v\d+\/archive-dreams\/brand\/personas\/portraits\//);
   }
  }
 }
 assert.equal(primary,18);
 let alternates=0;
 for(const [id,group] of Object.entries(portraits.alternates)){
  for(const [palette,sizes] of Object.entries(group.variants)){
   for(const [variant,asset] of Object.entries(sizes)){
    alternates++;
    assert.equal(personaCharacterUrl(id,{palette,variant}),asset.url);
   }
  }
 }
 assert.equal(alternates,4);
 assert.equal(personaCharacterUrl('family-deco-mask',{palette:'sepia',variant:'full'}),null);
 const v4=JSON.parse(await readFile(new URL('../docs/design/persona-illustrated-v4-manifest.json',import.meta.url),'utf8'));
 assert.equal(v4.masterIdentityCount,8);
 assert.equal(v4.variantCount,16);
 for(const [id,variants] of Object.entries(v4.personas)){
  for(const [variant,asset] of Object.entries(variants)){
    assert.equal(personaCharacterUrl(id,{palette:'sepia',variant}),asset.url);
    assert.match(asset.url,new RegExp('/'+id+'-sepia-'+variant+'-v4[.]png$'));
  }
 }
 assert.equal(personaCharacterUrl('tourist',{palette:'white',variant:'compact'}),null);
 assert.throws(()=>personaCharacterUrl('family',{palette:'gold'}),/Unsupported persona portrait/);
});
