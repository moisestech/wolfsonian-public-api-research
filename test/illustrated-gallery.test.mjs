import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LENSES} from '../src/archive-society.mjs';
import {illustratedPersonaUrl,ILLUSTRATED_PERSONAS,APPROVED_DECO_MASK_STUDIES,approvedMaskStudyUrl} from '../src/persona-illustrated-gallery.mjs';
import { personaAssetUrl, PERSONA_ASSET_IDS } from '../src/persona-cloudinary-assets.mjs';
const manifest=JSON.parse(await readFile(new URL('../docs/design/illustrated-persona-gallery-manifest.v1.json',import.meta.url),'utf8'));

test('all eleven active personas have independent artwork rather than a symbol as their main visual',()=>{
  assert.equal(LENSES.length,11);
  assert.deepEqual(new Set(Object.keys(ILLUSTRATED_PERSONAS)),new Set(LENSES.map(x=>x.id)));
  for(const lens of LENSES){
    for(const variant of ['full','compact']){
      const url=illustratedPersonaUrl(lens.id,{variant});
      assert.equal(url,manifest.gallery[lens.id][variant]);
      if(manifest.gallery[lens.id].source==='architectural-mask-geometric-v1'){
        assert.ok(url.includes('/architectural-masks-v1/'));
        assert.ok(url.includes('/f_png/v'));
        assert.ok(url.endsWith('.png'));
        for(const tone of ['white','ink']){
          const selected=illustratedPersonaUrl(lens.id,{tone,variant});
          assert.equal(selected,manifest.gallery[lens.id][tone][variant]);
          assert.ok(selected.includes('/architectural-masks-v1/'));
        }
        assert.ok(manifest.gallery[lens.id].priorIllustration.full.includes('/portraits/'));
      }else if(manifest.gallery[lens.id].source==='approved-nested-family-mask-v1'){
        assert.equal(lens.id,'family');
        assert.ok(url.includes('/approved-masks/nested-family-'));
        for(const tone of ['white','ink']){
          const selected=illustratedPersonaUrl(lens.id,{tone,variant});
          assert.equal(selected,manifest.masks['nested-family'][tone][variant]);
        }
        assert.ok(manifest.gallery[lens.id].priorIllustration.full.includes('/portraits/'));
      }else{
        assert.ok(url.includes('/portraits/'));
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

test('the visible identity mark is a complete, uniform 11-persona vector family',async()=>{
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
  assert.match(js,/personaAssetUrl\(id,\{tone:'white',variant:'compact',format:'svg'\}\)/);
  assert.match(js,/button\.append\(img,personaIdentityMark\(lens\.id\),copy\)/);
  assert.match(js,/button\.append\(portrait,personaIdentityMark\(lens\.id\),copy,check\)/);
  assert.match(css,/\.perspective-identity-mark img/);
});
