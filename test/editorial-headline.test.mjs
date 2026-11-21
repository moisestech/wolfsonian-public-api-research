import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EDITORIAL_PHRASES,PERSPECTIVE_PHRASES,nextEditorialIndex} from '../demo/archive-society/editorial-headline.mjs';
import {PERSONAS} from '../src/discovery-graph.mjs';

test('editorial sequence is finite, truthful, and returns to the title',()=>{
  assert.equal(EDITORIAL_PHRASES[0],'Archive dreams in public.');
  assert.equal(new Set(EDITORIAL_PHRASES).size,EDITORIAL_PHRASES.length);
  assert.ok(EDITORIAL_PHRASES.length>=5);
  assert.ok(EDITORIAL_PHRASES.includes('Follow a question between objects.'));
  assert.ok(EDITORIAL_PHRASES.includes('The voices are imagined.'));
  assert.ok(EDITORIAL_PHRASES.includes('Check the records.'));
  assert.ok(EDITORIAL_PHRASES.includes('Imagined voices. Real records.'));
  assert.ok(EDITORIAL_PHRASES.includes('Interpretation is not evidence.'));
  assert.equal(nextEditorialIndex(EDITORIAL_PHRASES.length-1),0);
});
test('each speaking perspective has its own short lines',()=>{
  const speaking=PERSONAS.map(persona=>persona.id).filter(id=>id!=='open');
  assert.deepEqual(Object.keys(PERSPECTIVE_PHRASES).sort(),speaking.sort());
  for(const lines of Object.values(PERSPECTIVE_PHRASES)){
    assert.ok(lines.length>=4);
    assert.equal(new Set(lines).size,lines.length);
    for(const line of lines){
      assert.ok(line.length>8&&line.length<=48);
      assert.match(line,/^[A-Z]/);
    }
  }
  assert.equal(PERSPECTIVE_PHRASES.family[0],'Archive dreams in public.');
  assert.equal(PERSPECTIVE_PHRASES.museum[1],'This voice is fictional.');
});
test('the archive link retains a stable identity and the title itself pauses',async()=>{
  const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
  assert.match(html,/class="wordmark"[^>]*aria-label="Archive Dreams in Public — explore conversations"/);
  assert.match(html,/class="brand-name">ARCHIVE DREAMS IN PUBLIC</);
  assert.match(html,/id="editorial-phrase"[^>]*aria-pressed="false"/);
  assert.doesNotMatch(html,/id="editorial-toggle"/);
  assert.match(html,/initEditorialHeadline\(\)/);
});
test('title motion has mobile layout and reduced-motion safeguards',async()=>{
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/archive-society/editorial-headline.mjs',import.meta.url),'utf8');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.brand-phrase\.is-changing/);
  assert.match(css,/@media\(max-width:800px\)[\s\S]*?\.brand-area\{width:auto;flex:0 1 auto/);
  assert.match(js,/visibilitychange/);
  assert.match(js,/focusin/);
  assert.match(js,/mouseenter/);
  assert.match(js,/4800/);
});
