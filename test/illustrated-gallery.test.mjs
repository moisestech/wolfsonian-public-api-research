import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LENSES} from '../src/archive-society.mjs';
import {illustratedPersonaUrl,ILLUSTRATED_PERSONAS,APPROVED_DECO_MASK_STUDIES,approvedMaskStudyUrl} from '../src/persona-illustrated-gallery.mjs';
import { personaAssetUrl, PERSONA_ASSET_IDS } from '../src/persona-cloudinary-assets.mjs';
const manifest=JSON.parse(await readFile(new URL('../docs/design/illustrated-persona-gallery-manifest.v1.json',import.meta.url),'utf8'));

test('all eleven active personas have independent flat symbols as their main visual',()=>{
  assert.equal(LENSES.length,11);
  assert.deepEqual(new Set(Object.keys(ILLUSTRATED_PERSONAS)),new Set(LENSES.map(x=>x.id)));
  for(const lens of LENSES){
    for(const variant of ['full','compact']){
      const url=illustratedPersonaUrl(lens.id,{variant});
      assert.equal(url,manifest.gallery[lens.id][variant]);
      assert.equal(manifest.gallery[lens.id].source,'diffusion-circular-v1');
      assert.ok(url.includes('/diffusion-circular-v1/'+lens.id+'-raster-master-v1.png'));
      for(const tone of ['white','ink']){
        assert.equal(illustratedPersonaUrl(lens.id,{tone,variant}),manifest.gallery[lens.id][tone][variant]);
      }
      assert.doesNotMatch(url,/\.svg$/);
    }
  }
  assert.equal(illustratedPersonaUrl('open'),null);
});

test('approved masks retain independent provenance; only Nested Family is mapped to a persona',()=>{
  assert.equal(Object.keys(APPROVED_DECO_MASK_STUDIES).length,4);
  for(const [id,mask] of Object.entries(APPROVED_DECO_MASK_STUDIES)){
    assert.equal(mask.identity,id==='nested-family'?'family':null);
    for(const tone of ['white','ink'])for(const variant of ['full','compact']){
      const url=approvedMaskStudyUrl(id,{tone,variant});
      assert.equal(url,manifest.masks[id][tone][variant]);
      assert.match(url,/\/approved-masks\//);
    }
  }
});

test('desktop and mobile gallery use illustrated artwork at full size and preserve labels and source limits',async()=>{
  const source=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  assert.ok(source.includes('image.src=illustratedPersonaUrl(card.id,{variant,tone})'));
  assert.match(source,/function approvedMasksSection\(\)/);
  assert.match(source,/node\('small',lens\.question\)/);
  assert.match(source,/reading-popover'\)\.replaceChildren\(\.\.\.perspectiveSections\(/);
  assert.match(source,/mobile-perspective-choices'\)\?\.replaceChildren\(\.\.\.perspectiveSections\(/);
  assert.match(css,/#reading-popover \.reading-choice img\.perspective-art/);
  assert.match(css,/#mobile-perspective-choices \.mobile-perspective-choice img\.perspective-art/);
  assert.match(source,/Artist-authored viewpoint; not museum staff/);
});

test('legacy vectors remain available while visible identity marks use the flat circular family',async()=>{
  const iconManifest=JSON.parse(await readFile(new URL('../docs/design/persona-cloudinary-manifest.json',import.meta.url),'utf8'));
  assert.deepEqual(new Set(PERSONA_ASSET_IDS),new Set(LENSES.map(l=>l.id)));
  assert.equal(iconManifest.counts.personaAssets,44);
  for(const lens of LENSES){
    for(const tone of ['white','ink'])for(const variant of ['full','compact']){
      const url=personaAssetUrl(lens.id,{tone,variant,format:'svg'});
      assert.equal(url,iconManifest.personas[lens.id][variant][tone].svg);
      assert.match(url,new RegExp('/'+lens.id+'-'+tone+'-'+variant+'-v1[.]svg$'));
    }
  }
  const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  assert.match(js,/function personaIdentityMark\(id\)/);
  assert.match(js,/illustratedPersonaUrl\(id,\{tone:'white',variant:'compact'\}\)/);
  assert.match(js,/button\.append\(img,personaIdentityMark\(lens\.id\),copy\)/);
  assert.match(js,/button\.append\(portrait,personaIdentityMark\(lens\.id\),copy,check\)/);
  assert.match(css,/\.perspective-identity-mark img/);
});

// Prevent the delivery map, archived manifest and approved vector sources drifting apart.
test('flat release preserves all tone mappings and transparent vector masters',async()=>{
  const flat=JSON.parse(await readFile(new URL('../docs/design/persona-flat-circular-manifest.v1.json',import.meta.url),'utf8'));
  for(const lens of LENSES)for(const tone of ['white','ink']){
    const asset=flat.personas[lens.id][tone];
    assert.match(asset.png['512'],/flat-circular-v1/);
    assert.match(asset.png['128'],/flat-circular-v1/);
    const svg=await readFile(new URL('../assets/personas/flat-circular-v1/'+lens.id+'-'+tone+'.svg',import.meta.url),'utf8');
    assert.match(svg,/viewBox="0 0 512 512"/);
    assert.match(svg,/<circle cx="256" cy="256" r="222" fill="none"/);
    assert.doesNotMatch(svg,/<rect|<image/);
  }
});

test('active art uses original PNG masters with traceable diffusion boards',async()=>{
 const raster=JSON.parse(await readFile(new URL('../docs/design/persona-diffusion-circular-manifest.v1.json',import.meta.url),'utf8'));
 for(const lens of LENSES){
  const art=ILLUSTRATED_PERSONAS[lens.id];
  assert.match(art.master,/-raster-master-v1[.]png$/);
  assert.match(art.sourceBoard,/diffusion-circular-v1\/sources\/.+[.]png$/);
  for(const tone of ['white','ink'])for(const variant of ['full','compact'])assert.equal(illustratedPersonaUrl(lens.id,{tone,variant}),raster.personas[lens.id][tone][variant]);
 }
});
