import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EDITORIAL_PHRASES,nextEditorialIndex} from '../demo/archive-society/editorial-headline.mjs';

test('editorial sequence is finite, truthful, and returns to the title',()=>{
  assert.equal(EDITORIAL_PHRASES[0],'Archive dreams in public.');
  assert.equal(new Set(EDITORIAL_PHRASES).size,EDITORIAL_PHRASES.length);
  assert.ok(EDITORIAL_PHRASES.length>=5);
  assert.ok(EDITORIAL_PHRASES.includes('Imagined voices. Real records.'));
  assert.ok(EDITORIAL_PHRASES.includes('Interpretation is not evidence.'));
  assert.equal(nextEditorialIndex(EDITORIAL_PHRASES.length-1),0);
});
test('the archive link retains a stable identity and a separate pause control',async()=>{
  const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
  assert.match(html,/class="wordmark"[^>]*aria-label="Archive Dreams in Public — explore conversations"/);
  assert.match(html,/class="brand-name">ARCHIVE DREAMS IN PUBLIC</);
  assert.match(html,/id="editorial-phrase" aria-hidden="true"/);
  assert.match(html,/id="editorial-toggle"[^>]*aria-pressed="false"/);
  assert.match(html,/initEditorialHeadline\(\)/);
  assert.ok(html.indexOf('id="editorial-toggle"')>html.indexOf('</a>',html.indexOf('class="wordmark"')));
});
test('title motion has mobile layout and reduced-motion safeguards',async()=>{
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/archive-society/editorial-headline.mjs',import.meta.url),'utf8');
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.brand-phrase\.is-changing/);
  assert.match(css,/\.brand-area\{width:100%/);
  assert.match(js,/visibilitychange/);
  assert.match(js,/focusin/);
  assert.match(js,/mouseenter/);
  assert.match(js,/4800/);
});
