import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,mkdtemp,rm,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildLocalAudioReview,safeAudioScenes} from '../scripts/build-audio-lab-review.mjs';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const manifest=JSON.parse(await readFile(new URL('../data/research/audio-lab/experiments.json',import.meta.url),'utf8'));

test('audio reviewer includes ten original fictional scenes and only minimal data',()=>{
  const scenes=safeAudioScenes(manifest);
  assert.equal(scenes.length,10);
  assert.equal(scenes.filter(x=>x.tier==='P0').length,5);
  assert.ok(scenes.every(x=>x.turns.length===8));
  assert.equal(new Set(scenes.map(x=>x.id)).size,10);
  assert.ok(scenes.every(x=>x.turns.every(t=>['objectA','objectB','fictional_archivist'].includes(t.role))));
  assert.equal(JSON.stringify(scenes).includes('sourceClaimType'),false);
  assert.equal(JSON.stringify(scenes).includes('src/curatorial-relationships'),false);
});

test('the reviewer fails closed on unapproved or institutionally voiced material',()=>{
  const bad=JSON.parse(JSON.stringify(manifest));
  bad.experiments[0].institutionalVoice=true;
  assert.throws(()=>safeAudioScenes(bad),/fictional/);
  bad.experiments[0].institutionalVoice=false;
  bad.experiments[0].publicationApproval='approved';
  assert.throws(()=>safeAudioScenes(bad),/unpublished/);
  bad.experiments[0].publicationApproval='not_approved';
  bad.experiments[0].turns[0].voiceRole='historical_person';
  assert.throws(()=>safeAudioScenes(bad),/Unexpected voice role/);
});

test('output is private, standalone, and isolated from Vercel public build',async()=>{
  const base=join(root,'.local-research');
  await mkdir(base,{recursive:true});
  const folder=await mkdtemp(join(base,'audio-audit-'));
  try{
    const out=join(folder,'review.html');
    const result=await buildLocalAudioReview({out});
    assert.equal(result.sceneCount,10);
    assert.equal(result.networkRequests,0);
    assert.equal(result.audioFilesCreated,0);
    const html=await readFile(out,'utf8');
    assert.ok(html.includes('<html lang="en">'));
    assert.ok(html.includes('connect-src &#39;none&#39;')||html.includes("connect-src 'none'"));
    assert.ok(html.includes('No upload, network request, autoplay, or analytics'));
    assert.ok(html.includes('01-household-audience'));
    assert.ok(html.includes('10-invisible-work'));
    assert.equal(html.includes('__SCENES__'),false);
    assert.equal(html.includes('<audio src='),false);
    assert.equal(html.includes('https://api.elevenlabs.io'),false);
    assert.equal(html.includes('https://notebooklm.google.com'),false);
    assert.equal((await stat(out)).mode&0o077,0);
    assert.match((await readFile(new URL('../.gitignore',import.meta.url),'utf8')),/\.local-research\//);
    const publicBuild=await readFile(new URL('../scripts/assemble-public-site.mjs',import.meta.url),'utf8');
    assert.ok(!publicBuild.includes("'tools/audio-lab'"));
    assert.ok(!publicBuild.includes("'data/research/audio-lab'"));
  }finally{await rm(folder,{recursive:true,force:true});}
  await assert.rejects(buildLocalAudioReview({out:join(root,'demo','audio-lab','review.html')}),/ignored/);
});
