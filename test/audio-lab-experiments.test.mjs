import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const manifest=JSON.parse(await readFile(new URL('../data/research/audio-lab/experiments.json',import.meta.url),'utf8'));
const scenes=manifest.experiments;

test('the ten-scene audio lab has 5 public-source-first and 5 review-gated experiments',()=>{
  assert.equal(manifest.schemaVersion,1);
  assert.equal(scenes.length,10);
  assert.equal(scenes.filter(s=>s.tier==='P0').length,5);
  assert.equal(scenes.filter(s=>s.tier==='P1').length,5);
  assert.equal(new Set(scenes.map(s=>s.id)).size,10);
  assert.ok(scenes.every(s=>s.question.endsWith('?')));
});
test('each scene is original fiction, not a museum voice or historical testimony',()=>{
  for(const scene of scenes){
    assert.equal(scene.historicalRelationshipEstablished,false);
    assert.equal(scene.institutionalVoice,false);
    assert.equal(scene.audioApproval,'not_reviewed');
    assert.equal(scene.publicationApproval,'not_approved');
    assert.notEqual(scene.a.accession,scene.b.accession);
    assert.ok(scene.turns.length>=6&&scene.turns.length<=12);
    assert.ok(scene.a.title&&scene.b.title);
    assert.ok(scene.turns.every(t=>t.sourceClaimType==='ARTIST_AUTHORED_FICTION'));
    assert.ok(scene.turns.every(t=>t.text.trim().length>=3),'brief audible reactions are intentional');
    assert.equal(new Set(scene.turns.map(t=>t.id)).size,scene.turns.length);
  }
});
test('role IDs align with the exact accession and a third role is explicitly fictional',()=>{
  for(const scene of scenes){
    for(const turn of scene.turns){
      if(turn.role==='A'){
        assert.equal(turn.accession,scene.a.accession);
        assert.equal(turn.voiceRole,'objectA');
      }else if(turn.role==='B'){
        assert.equal(turn.accession,scene.b.accession);
        assert.equal(turn.voiceRole,'objectB');
      }else{
        assert.equal(turn.role,'C');
        assert.equal(turn.accession,null);
        assert.equal(turn.voiceRole,'fictional_archivist');
      }
    }
  }
});
test('initial NotebookLM batches have public source links, later risky material stays gated',()=>{
  for(const scene of scenes){
    assert.ok(scene.sources.every(u=>u.startsWith('https://wolfsonian.org/')));
    if(scene.tier==='P0'){
      assert.ok(scene.sources.length>=1);
      assert.equal(scene.rights,'author_public_only_not_museum_approved');
    }else{
      assert.notEqual(scene.rights,'author_public_only_not_museum_approved');
    }
    assert.ok(['Deep Dive','Debate','Critique'].includes(scene.notebookFormat));
  }
});
test('all ten authored script files correspond to the named scene IDs',async()=>{
  for(const scene of scenes){
    const file=await readFile(new URL('../docs/audio-lab/'+scene.id+'.md',import.meta.url),'utf8');
    assert.ok(file.startsWith('# '+scene.question));
    assert.ok(file.includes(scene.a.accession)&&file.includes(scene.b.accession));
    assert.ok(file.includes('artist-authored'));
    assert.ok(file.includes('NotebookLM'));
    assert.ok(file.includes('ElevenLabs'));
  }
});
