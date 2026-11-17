import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {visitorGuide} from '../src/visitor-guide.mjs';

test('cold visitors immediately see purpose, link semantics, and speaker roles',async()=>{
 const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
 const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 const beforeApp=html.slice(0,html.indexOf('<main class="workspace">'));
 assert.match(beforeApp,/<section class="arrival-guide"/);
 assert.match(beforeApp,/This is a map of objects and possible connections/);
 assert.match(beforeApp,/does <em>not<\/em> mean the objects met/);
 assert.match(beforeApp,/Select a line.*Check the <strong>Record<\/strong>/);
 assert.match(beforeApp,/Perspective.*Object voices.*Archivist/);
 assert.match(beforeApp,/not a museum employee/);
 assert.match(beforeApp,/id="arrival-connection"/);
 assert.match(css,/\.arrival-guide\{display:grid/);
 assert.match(css,/@media\(max-width:800px\)\{\.arrival-guide/);
 assert.match(js,/message\('arrival-connection'/);
 assert.match(js,/info\.line/);
 assert.match(js,/Artist-proposed comparison/);
 assert.ok(!beforeApp.includes('autoplay'));
});
test('connection copy remains truthful about a shared theme rather than archival contact',()=>{
 const info=visitorGuide(
  {title:'Demo object',accession:'FICTION-01',source:'invented'},
  {target:'FICTION-02',reasons:[{family:'theme',value:'Labor'}]}
 );
 assert.match(info.line,/shared theme/);
 assert.match(info.line,/not proof that these objects met/);
 assert.equal(info.kind,'FICTIONAL EXAMPLE');
});
