import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir,readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),port=8789,base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['scripts/serve-archive-society.mjs'],{cwd:root,env:{...process.env,PORT:String(port),ARCHIVE_DEMO_ACCESS_TOKEN:'TEST_ONLY_PRIVATE_DEMO_TOKEN_12345',ARCHIVE_ENABLE_LAKEHOUSE:'0',ARCHIVE_ENABLE_ELEVENLABS:'0'},stdio:['ignore','pipe','pipe']});
let browser;
try {
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Local server startup timed out')),10000);
    child.stdout.on('data',b=>{if(b.toString().includes('Archive Society:')){clearTimeout(timer);resolve();}});
    child.once('exit',code=>{clearTimeout(timer);reject(new Error('Server exited before ready: '+code));});
  });
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1}),errors=[],external=[],voiceRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{const url=req.url();if(!url.startsWith(base)&&!url.startsWith('blob:')&&!url.startsWith('data:'))external.push(url);if(url.includes('/api/archive-society/voice'))voiceRequests.push(url);});
  await page.goto(base+'/demo/archive-society/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.graph-node').length>0).catch(error=>{throw new Error((errors.join('\n')||error.message));});
  const cards=await page.locator('.graph-node').count();
  assert.ok(cards>=2&&cards<=7);
  assert.equal(await page.locator('#add-image, #add-images, #photos, #clear-images').count(),0);
  assert.equal(await page.getByText('Lakehouse lookup').count(),0);
  assert.ok(await page.locator('.conversation-edge').count()>0);

  // The current 76-match snapshot should open on the six-script Munitions chapter.
  assert.match(await page.locator('#atlas-title').innerText(),/On Munitions/);
  assert.match(await page.locator('#conversation-content').innerText(),/ARTIST-AUTHORED SCENE/);
  assert.match(await page.locator('#conversation-content').innerText(),/Who gets credit for labor/);
  assert.match(await page.locator('#conversation-content').textContent(),/not a documented relationship/i);


  // Conversation Stage: large text, real speaker focus, graph signal and quiet navigation.
  assert.equal(await page.locator('#turn-navigation').isVisible(),true);
  assert.equal(await page.locator('#conversation-content .bubble.current').count(),1);
  assert.equal(await page.locator('#stage').getAttribute('data-active-role'),'objectA');
  assert.match(await page.locator('#turn-progress').innerText(),/Reading 1 of 3/);
  assert.equal(await page.locator('#previous-turn').isDisabled(),true);
  const firstSpeaker=await page.locator('#stage').getAttribute('data-active-speaker');
  assert.equal(firstSpeaker,'85.4.64.34');
  const dialogueWidth=await page.locator('.evidence-rail').evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(dialogueWidth>=460,'Desktop conversation panel must be legible: '+dialogueWidth);
  const firstFont=await page.locator('#conversation-content .bubble.current p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert.ok(firstFont>=22,'Active dialogue must be large: '+firstFont);
  await page.locator('#next-turn').click();
  assert.equal(await page.locator('#stage').getAttribute('data-active-role'),'objectB');
  const secondSpeaker=await page.locator('#stage').getAttribute('data-active-speaker');
  assert.notEqual(secondSpeaker,firstSpeaker);
  assert.match(await page.locator('#turn-progress').innerText(),/Reading 2 of 3/);
  await page.locator('#next-turn').click();
  assert.equal(await page.locator('#stage').getAttribute('data-active-role'),'archivist');
  assert.equal(await page.locator('#stage').getAttribute('data-active-speaker'),'');
  assert.equal(await page.locator('#next-turn').isDisabled(),true);
  await page.locator('#previous-turn').click();
  assert.equal(await page.locator('#stage').getAttribute('data-active-speaker'),secondSpeaker);
  await page.locator('#previous-turn').click();
  assert.equal(await page.locator('#stage').getAttribute('data-active-speaker'),firstSpeaker);

  // Exercise every actual opening edge, not just one hard-coded scene.
  const openingArcs=new Set();
  assert.equal(await page.locator('.conversation-edge').count(),6);
  for(let i=0;i<6;i++){
    await page.locator('.conversation-edge').nth(i).focus();
    await page.keyboard.press('Enter');
    const content=page.locator('#conversation-content');
    assert.match(await content.innerText(),/ARTIST-AUTHORED SCENE/);
    assert.equal(await content.locator('.bubble.turn').count(),3);
    openingArcs.add((await content.locator('h2').textContent()).trim());
  }
  assert.equal(openingArcs.size,6);
  // Following an edge changes the seed; returning restores the prior inquiry.
  const oldTitle=await page.locator('#atlas-title').innerText();
  await page.locator('[data-follow-object]').click();
  assert.notEqual(await page.locator('#atlas-title').innerText(),oldTitle);
  assert.ok(await page.locator('[data-return-object]').isVisible());
  await page.locator('[data-return-object]').click();
  assert.equal(await page.locator('#atlas-title').innerText(),oldTitle);
  await page.locator('.conversation-edge').first().focus();
  await page.keyboard.press('Enter');

  await mkdir(new URL('artifacts/',root),{recursive:true});
  await page.screenshot({path:new URL('artifacts/archive-society-overview.png',root).pathname,fullPage:true});
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="worker"]').click();
  await page.locator('.conversation-edge').first().focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.turn').count(),3);
  await page.locator('#conversation-content summary').click();
  assert.match(await page.locator('#conversation-content').innerText(),/Thematic Category|Symbols\/Motifs/);
  await page.screenshot({path:new URL('artifacts/archive-society-conversation.png',root).pathname,fullPage:true});
  const csv=await readFile(new URL('examples/archive-society.synthetic.csv',root),'utf8');
  await page.locator('.source-studio').evaluate(el=>{el.open=true;});
  const hostile=csv.replace('Invented household radio','<img src=x onerror=globalThis.__archiveXss=1>');
  await page.locator('#csv-file').setInputFiles({name:'synthetic-test.csv',mimeType:'text/csv',buffer:Buffer.from(hostile)});
  await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('4 CSV'));
  assert.equal(await page.evaluate(()=>globalThis.__archiveXss),undefined);
  assert.match(await page.locator('#atlas-title').innerText(),/<img src=x/);
  const lookup=[{'Accession Number':'TEST2026.101',Title:'TEST ONLY',Date:'TEST_DATE_NOT_HISTORY'}];
  await page.locator('#snapshot-file').setInputFiles({name:'synthetic-lookup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(lookup))});
  await page.waitForFunction(()=>document.querySelector('#snapshot-content').textContent.includes('EXACT_PRIMARY_ACCESSION'));
  await page.locator('[data-panel=conversation]').click();
  assert.match(await page.locator('#conversation-content').innerText(),/TEST_DATE_NOT_HISTORY/);
  await page.locator('#admin-toggle').click();
  await page.selectOption('#voice-mode','elevenlabs');await page.locator('#play').evaluate(button=>button.click());
  assert.match(await page.locator('#voice-status').innerText(),/approval/);assert.equal(voiceRequests.length,0);
  await page.fill('#access-token','TEST_ONLY_PRIVATE_DEMO_TOKEN_12345');await page.locator('#check-services').click();
  await page.waitForFunction(()=>document.querySelector('#service-status').textContent.includes('ElevenLabs: disabled'));
  await page.locator('[data-panel=conversation]').evaluate(button=>button.click());await page.locator('#external-approved').check();await page.locator('#play').evaluate(button=>button.click());
  await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('not enabled'));
  assert.equal(voiceRequests.length,1);
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="archivist"]').click();assert.equal(await page.locator('#external-approved').isChecked(),false);
  await page.locator('#restore').click();
  await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('Invented example restored'));
  assert.equal(await page.locator('.thumbnail').count(),0);
  const about=await page.request.get(base+'/demo/about/');
  assert.equal(about.status(),200);
  assert.match(await about.text(),/Lakehouse lookup/);
  await page.locator('#atlas-mode').check();assert.equal(await page.locator('.graph-node').count(),100);
  const scaleOf=()=>page.locator('#stage').evaluate(el=>Number(el.dataset.scale));
  const fitted=await scaleOf();
  await page.locator('#zoom-in').click();assert.ok(await scaleOf()>fitted);
  await page.locator('#fit').click();assert.ok(Math.abs(await scaleOf()-fitted)<0.02);
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="worker"]').click();
  assert.ok(await page.locator('.graph-node.emphasized').count()>0);
  await page.locator('#theme-toggle').click();await page.selectOption('#theme','Domestic life');
  assert.equal(await page.locator('#stage').getAttribute('data-theme'),'Domestic life');
  assert.ok(await page.locator('.graph-node').count()>0);
  assert.equal((await page.request.get(base+'/.env.local')).status(),404);
  assert.equal((await page.request.get(base+'/server/archive-services.mjs')).status(),404);
  assert.equal((await page.request.get(base+'/demo/discovery-lab/')).status(),200);
  await page.setViewportSize({width:390,height:844});await page.locator('#atlas-mode').uncheck();

  // Readable on phone, without sideways scrolling, even when animations are disabled.
  await page.locator('.conversation-edge').first().focus();await page.keyboard.press('Enter');
  await page.locator('#next-turn').click();
  const phoneFont=await page.locator('#conversation-content .bubble.current p').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  assert.ok(phoneFont>=21,'Active mobile speech must remain large: '+phoneFont);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#conversation-content .bubble.current .say').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#previous-turn').click();
  assert.equal(await page.locator('#stage').getAttribute('data-active-role'),'objectA');
  await page.screenshot({path:new URL('artifacts/archive-society-mobile.png',root).pathname,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('Archive Society browser checks passed: force-graph nodes, conversation edges, local CSV/photos/JSON, XSS, approval reset, service failure, zoom, mobile, private-route denial; no external requests.');
} finally {await browser?.close();child.kill('SIGTERM');}
