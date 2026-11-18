import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('phone uses a single transport button with an accessible playing state',async()=>{
 const html=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
 const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
 assert.match(html,/<button type="button" id="space-play" aria-label="Play conversation" aria-pressed="false">▶ Play<\/button>/);
 assert.doesNotMatch(html,/id="space-stop"/);
 assert.doesNotMatch(js,/\$\('space-stop'\)/);
 assert.match(js,/space\.textContent=playing\?'■ Stop':'▶ Play'/);
 assert.match(js,/space\.setAttribute\('aria-pressed',String\(playing\)\)/);
 assert.match(js,/space\.setAttribute\('aria-label',playing\?'Stop conversation':'Play conversation'\)/);
 assert.match(js,/\$\('space-play'\)\?\.addEventListener\('click',\(\)=>\$\('play'\)\.click\(\)\)/);
 assert.match(js,/\$\('play'\)\.addEventListener\('click',\(\)=>\{if\(state\.playing\)\{stop\(\)/);
 assert.match(css,/#space-play\[aria-pressed="true"\]/);
});
