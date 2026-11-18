import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {visitorGuide} from '../src/visitor-guide.mjs';

test('cold visitors get the question first and persistent fiction and record affordances',async()=>{
 const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
 const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 const beforeApp=html.slice(0,html.indexOf('<main class="workspace">'));
 assert.match(beforeApp,/class="arrival-guide"/);
 assert.match(beforeApp,/The voices are imagined\. Check the records\./);
 assert.match(html,/IMAGINED EXCHANGE/);
 assert.match(html,/id="room-question"/);
 assert.match(html,/Why these two\? Open evidence/);
 assert.match(html,/id="space-room" class="space-tab" aria-label="Explore object network"/);
 assert.match(beforeApp,/id="arrival-connection"/);
 assert.match(css,/\.room-header\{/);
 assert.match(js,/not historical speech or live autonomous AI/);
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
