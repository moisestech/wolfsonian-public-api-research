import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('visitor nav has exactly Conversations, Record, Object Lens, Info in that order',async()=>{
  const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
  const nav=html.match(/<nav class="top-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav,'a single visitor-facing top navigation must exist');
  assert.match(nav,/data-panel="conversation"[^>]*>Conversations<\/button>/);
  assert.match(nav,/data-panel="record"[^>]*>Record<\/button>/);
  assert.match(nav,/href="\.\.\/object-lens\/"[^>]*aria-label="Open Object Lens"/);
  assert.match(nav,/id="source-info"[^>]*aria-label="Information about this artwork"/);
  const indexes=['data-panel="conversation"','data-panel="record"','href="../object-lens/"','id="source-info"'].map(s=>nav.indexOf(s));
  assert.ok(indexes.every(i=>i>=0));
  assert.deepEqual(indexes,[...indexes].sort((a,b)=>a-b));
  assert.equal((nav.match(/<button\b/g)||[]).length,3);
  assert.equal((nav.match(/<a\b/g)||[]).length,1);
  assert.doesNotMatch(html,/id="admin-toggle"|aria-label="Settings"[^>]*<svg/);
  assert.doesNotMatch(html,/adminPassword|staffPassword|settingsPassword/i,'do not introduce client-side staff authorization');
});
test('top navigation does not wrap its four controls in phone or desktop layouts',async()=>{
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  assert.match(css,/\.top-nav\{display:flex;flex-wrap:nowrap/);
  assert.match(css,/\.top-nav \.tabs\{display:flex;flex:0 1 auto/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/\.top-nav\{width:100%;justify-content:space-between/);
  assert.match(css,/min-height:44px/);
});
