import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LENSES} from '../src/archive-society.mjs';
import {CARD_BY_ID,portraitFallbackUrl} from '../src/discovery-personas.mjs';
import {personaAssetUrl,personaCharacterUrl} from '../src/persona-cloudinary-assets.mjs';

const required=['tourist','novice','connoisseur','futurist','mourner'];
const local=async path=>readFile(new URL(path,import.meta.url),'utf8');

test('feedback cast contains all original eleven artist-authored persona identities',()=>{
  assert.equal(LENSES.length,11);
  for(const id of required){
    assert.ok(LENSES.some(p=>p.id===id),id+' must be selectable');
    const card=CARD_BY_ID.get(id);
    assert.ok(card, id+' has a card');
    for(const tone of ['white','ink']){
      for(const variant of ['full','compact']){
        const url=personaAssetUrl(id,{tone,variant});
        assert.match(url,/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/personas\//);
      }
    }
    assert.match(portraitFallbackUrl(card,{tone:'white',variant:'compact'}),/^data:image\/svg\+xml/);
    assert.match(personaCharacterUrl(id),new RegExp('/'+id+'-sepia-compact-v4[.]png$'),'New illustrative portrait replaces v1 in the primary gallery');
  }
  assert.ok(!LENSES.some(p=>p.id==='open'));
});

test('phone and desktop perspective lists share one complete grouped cast',async()=>{
  const code=await local('../demo/archive-society/society.mjs');
  const text=code.match(/const feedbackPerspectiveGroups=\[([\s\S]*?)\];/);
  assert.ok(text,'missing UI persona groups');
  const declared=[...text[1].matchAll(/'([a-z]+)'/g)].map(m=>m[1]);
  assert.equal(new Set(declared).size,11,'perspective duplicated across groups');
  assert.deepEqual(new Set(declared),new Set(LENSES.map(p=>p.id)));
  assert.match(code,/reading-popover'\)\.replaceChildren\(\.\.\.perspectiveSections\(/);
  assert.match(code,/mobile-perspective-choices'\)\?\.replaceChildren\(\.\.\.perspectiveSections\(/);
  assert.match(code,/const label=lens\.id==='museum'\?lens\.label\+' · fictional'/);
  assert.match(code,/perspective-card-grid/);
  assert.match(code,/buildPerspectiveFeature\('desktop'\)/);
  assert.match(code,/buildPerspectiveFeature\('mobile'\)/);
  assert.match(code,/updatePerspectiveGallery\(\)/);
  const html=await local('../demo/archive-society/index.html');
  assert.match(html,/eleven artist-authored viewpoints/);
  assert.match(html,/Shared metadata suggests questions, not proven historical relationships/);
});
