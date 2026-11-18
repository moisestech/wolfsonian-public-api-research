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
  page.on('request',req=>{const url=req.url();if(!url.startsWith(base)&&!url.startsWith('blob:')&&!url.startsWith('data:')&&!url.startsWith('https://res.cloudinary.com/'))external.push(url);if(url.includes('/api/archive-society/voice'))voiceRequests.push(url);});
  await page.goto(base+'/demo/archive-society/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelectorAll('.graph-node').length>0).catch(error=>{throw new Error((errors.join('\n')||error.message));});
  const cards=await page.locator('.graph-node').count();
  assert.ok(cards>=2&&cards<=7);
  assert.equal(await page.locator('#add-image, #add-images, #photos, #clear-images').count(),0);
  assert.equal(await page.getByText('Lakehouse lookup').count(),0);
  assert.ok(await page.locator('.conversation-edge').count()>0);

  // Making the Engine opens on a curated machine-and-body scene, with six paths still clickable.
  assert.match(await page.locator('#atlas-title').innerText(),/Making the Engine/);
  assert.equal(await page.locator('.topbar').getByText('The machine meets the body').count(),0);
  assert.match(await page.locator('#scene-tag').innerText(),/Machines/);
  await page.locator('#conversation-head').click();
  assert.match(await page.locator('#scene-title').getAttribute('title'),/ARTIST-AUTHORED SCENE/);
  assert.match(await page.locator('#conversation-sheet').innerText(),/Machines[\s\S]*The machine meets the body/);
  await page.locator('#sheet-close').click();
  assert.match(await page.locator('#conversation-content').textContent(),/not a documented relationship/i);
  assert.ok(Number(await page.locator('#stage').getAttribute('data-zoom'))>20);

  assert.equal(await page.locator('.conversation-edge').count(),6);
  for(let i=0;i<6;i++){
    await page.locator('.conversation-edge').nth(i).focus();
    await page.keyboard.press('Enter');
    assert.ok((await page.locator('#conversation-content .bubble.turn').count())>=3);
  }
  // Cold-reader contract: each selected pair explains why it speaks,
  // what it explores, and how the content differs from the previous pair.
  await page.locator('.conversation-edge').nth(0).focus();
  await page.keyboard.press('Enter');
  const firstMeaning=await page.locator('.encounter-orientation').innerText();
  assert.match(firstMeaning,/Why these two\?/);
  assert.match(firstMeaning,/What are they exploring\?/);
  assert.match(firstMeaning,/not proof they met/);
  await page.locator('.conversation-edge').nth(1).focus();
  await page.keyboard.press('Enter');
  const secondMeaning=await page.locator('.encounter-orientation').innerText();
  assert.notEqual(firstMeaning,secondMeaning,'Different links require an explicit changed explanation');
  assert.match(secondMeaning,/Previously:/);
  assert.match(secondMeaning,/Now:/);
  assert.match(secondMeaning,/How this conversation was written/);
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
  assert.ok((await page.locator('.turn').count())>=3);
  await page.locator('#conversation-content > details > summary').click();
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
  await page.locator('#restore').click();
  await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('Invented example restored'));
  assert.equal(await page.locator('.thumbnail').count(),0);
  await page.locator('#admin-close').click();
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="archivist"]').click();assert.equal(await page.locator('#external-approved').isChecked(),false);
  const about=await page.request.get(base+'/demo/about/');
  assert.equal(about.status(),200);
  assert.match(await about.text(),/Lakehouse lookup/);
  assert.equal(await page.locator('#more-toggle').count(),0);
  assert.equal(await page.locator('#layer-accession').count(),1);
  assert.equal(await page.locator('#layer-box').count(),1);
  assert.equal(await page.locator('#atlas-mode').count(),1);
  const footerFits=()=>page.locator('.atlas-footer').evaluate(el=>el.scrollHeight<=el.clientHeight+1);
  assert.equal(await footerFits(),true);
  await page.locator('#atlas-mode').check();assert.equal(await page.locator('.graph-node').count(),100);
  const scaleOf=()=>page.locator('#stage').evaluate(el=>Number(el.dataset.scale));
  const fitted=await scaleOf();
  await page.locator('#zoom-toggle').click();
  await page.locator('[data-stop="100"]').click();assert.ok(await scaleOf()>fitted);
  await page.locator('#zoom-toggle').click();
  await page.locator('#fit').click();assert.ok(Math.abs(await scaleOf()-fitted)<0.02);
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="worker"]').click();
  assert.ok(await page.locator('.graph-node.emphasized').count()>0);
  await page.locator('#theme-toggle').click();await page.locator('#theme-choices [data-theme="Domestic life"]').click();
  assert.equal(await page.locator('#stage').getAttribute('data-theme'),'Domestic life');
  assert.ok(await page.locator('.graph-node').count()>0);
  assert.equal((await page.request.get(base+'/.env.local')).status(),404);
  assert.equal((await page.request.get(base+'/server/archive-services.mjs')).status(),404);
  assert.equal((await page.request.get(base+'/demo/discovery-lab/')).status(),200);
  await page.locator('#admin').evaluate(el=>{el.hidden=true;});
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#path-timeline')).display!=='none');
  assert.match(await page.locator('#timeline-list').innerText(),/not a documented relationship|not proof that the histories intersected/i);
  await page.locator('.path-post').first().click();
  assert.ok((await page.locator('#conversation-content .bubble.turn').count())>=3);
  assert.match(await page.locator('.encounter-orientation').innerText(),/Why these two\?/);
  assert.match(await page.locator('.encounter-orientation').innerText(),/What are they exploring\?/);
  assert.ok(await page.locator('.listener').count()>=2);
  assert.equal(await page.locator('#space-stop').count(),0,'No duplicate mobile Stop button');
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'false');
  assert.match(await page.locator('#space-play').innerText(),/Play/);
  await page.evaluate(()=>{
    const voiceMode=document.querySelector('#voice-mode');
    voiceMode.value='device';
    voiceMode.dispatchEvent(new Event('change'));
    Object.defineProperty(window,'SpeechSynthesisUtterance',{
      configurable:true,
      value:class MockUtterance{constructor(text){this.text=text;this.voice=null;}}
    });
    Object.defineProperty(window,'speechSynthesis',{
      configurable:true,
      value:{
        getVoices:()=>[{name:'Test local',lang:'en-US',localService:true}],
        speak:()=>{},
        cancel:()=>{}
      }
    });
  });
  await page.locator('#space-play').click();
  const active=await page.locator('#space-play').getAttribute('aria-pressed');
  assert.equal(active,'true','Mobile playback should be active; status: '+await page.locator('#voice-status').textContent());
  assert.equal(await page.locator('#space-play').getAttribute('aria-label'),'Stop conversation');
  assert.match(await page.locator('#space-play').innerText(),/Stop/);
  await page.locator('#space-play').click();
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#space-play').getAttribute('aria-label'),'Play conversation');
  assert.match(await page.locator('#space-play').innerText(),/Play/);
  for(const [id,description] of [
    ['sheet-close','Close conversation details'],
    ['prompt-close','Close perspective details'],
    ['admin-close','Close settings']
  ]){
    assert.equal((await page.locator('#'+id).textContent()).trim(),'×');
    assert.equal(await page.locator('#'+id).getAttribute('aria-label'),description);
  }
  const railHeight=()=>page.locator('.evidence-rail').evaluate(el=>Math.round(el.getBoundingClientRect().height));
  const beforeSheet=await railHeight();
  await page.locator('#space-evidence').click();
  assert.equal(await page.locator('#conversation-sheet').evaluate(el=>el.hidden),false);
  assert.equal(await railHeight(),beforeSheet);
  await page.locator('#sheet-close').click();
  await page.screenshot({path:new URL('artifacts/archive-society-space.png',root).pathname});
  await page.locator('#space-leave').click();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#path-timeline')).display!=='none');
  await page.locator('#space-room').click();
  assert.equal(await footerFits(),true);
  await page.locator('#atlas-mode').uncheck();
  await page.screenshot({path:new URL('artifacts/archive-society-mobile.png',root).pathname,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('Archive Society browser checks passed: force-graph nodes, conversation edges, local CSV/photos/JSON, XSS, approval reset, service failure, zoom, mobile, private-route denial; no external requests.');
} finally {await browser?.close();child.kill('SIGTERM');}
