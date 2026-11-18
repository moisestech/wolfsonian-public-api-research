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
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1}),errors=[],external=[],voiceRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{const url=req.url();if(!url.startsWith(base)&&!url.startsWith('blob:')&&!url.startsWith('data:')&&!url.startsWith('https://res.cloudinary.com/'))external.push(url);if(url.includes('/api/archive-society/voice'))voiceRequests.push(url);});
  const open=async()=>{
    await page.goto(base+'/demo/archive-society/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('#room-question')?.textContent);
  };
  const selectEdge=async index=>{await page.locator('.conversation-edge').nth(index).focus();await page.keyboard.press('Enter');};
  const screenshot=async name=>page.screenshot({path:new URL('artifacts/archive-society-'+name+'.png',root).pathname,fullPage:true});
  await mkdir(new URL('artifacts/',root),{recursive:true});
  await open();
  assert.ok(await page.locator('.graph-node').count()>=2);
  assert.equal(await page.locator('.conversation-edge').count(),6);
  assert.equal(await page.locator('#admin-toggle,#space-stop,#add-images,#clear-images').count(),0);
  assert.equal(await page.locator('#room-question').innerText(),'Who pays the price of progress?');
  assert.equal(await page.locator('#room-header').getAttribute('data-mode'),'CURATED_SCRIPT');
  assert.match(await page.locator('#room-rationale').innerText(),/Shared motif: Machines/);
  assert.equal(await page.locator('#room-participants .object-inspect').count(),2);
   assert.equal(await page.locator('#room-participants .object-portrait-media').count(),2);
   assert.equal(await page.locator('#room-participants .object-portrait-meta').count(),2);
  assert.equal(await page.locator('.turn').count(),5);
  assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
  assert.equal(voiceRequests.length,0,'No autoplay or unsolicited provider calls');
  assert.equal(await page.locator('.encounter-orientation').getAttribute('open'),null);
  await screenshot('room-1280');

  // Topic, two identities and two complete messages must be above the dock.
  for(const width of [320,390,768]){
    await page.setViewportSize({width,height:844});
    const fold=await page.evaluate(()=>{
      const scroll=document.querySelector('.rail-scroll').getBoundingClientRect();
      const dock=document.querySelector('#space-bar').getBoundingClientRect();
      const bubbles=[...document.querySelectorAll('.turn')].slice(0,2).map(x=>x.getBoundingClientRect());
      const controls=[...document.querySelector('.top-nav').querySelectorAll('button,a')].map(x=>x.getBoundingClientRect());
      return {fits:bubbles.length===2&&bubbles.every(b=>b.top>=scroll.top-1&&b.bottom<=Math.min(scroll.bottom,dock.top)+1),
        singleRow:controls.every(b=>Math.abs(b.top-controls[0].top)<2),
        navFits:controls.every(b=>b.left>=0&&b.right<=innerWidth),
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        dockVisible:dock.bottom<=innerHeight+1,
        bounds:bubbles.map(b=>({top:b.top,bottom:b.bottom})),scrollBottom:scroll.bottom};
    });
    assert.ok(fold.fits,'Two complete opening messages at '+width+'px: '+JSON.stringify(fold));
    assert.ok(fold.singleRow&&fold.navFits,'Four controls stay on one row at '+width+'px');
    assert.ok(fold.dockVisible&&!fold.overflow,'Dock and content fit at '+width+'px');
    await screenshot('room-'+width);
  }
  // Five persistent mobile destinations share the original dock space.
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#space-bar .space-tab').count(),5);
  assert.equal(await page.locator('#space-bar[aria-label="Mobile archive navigation"]').count(),1);
  assert.equal(await page.locator('#space-conversation[aria-current="page"]').count(),1);
  assert.equal(await page.locator('#space-evidence').count(),0,'Evidence is available in the room header, not a redundant dock action');
  await page.locator('#space-feed').click();
  assert.equal(await page.locator('#path-timeline').isVisible(),true);
  assert.equal(await page.locator('#space-feed[aria-current="page"]').count(),1);
  assert.equal(await page.locator('#space-bar').isVisible(),true,'Bottom navigation stays available in feed');
  await page.locator('#space-conversation').click();
  assert.equal(await page.locator('#room-question').isVisible(),true);
  assert.equal(await page.locator('#space-conversation[aria-current="page"]').count(),1);
  await page.locator('#space-record').click();
  assert.equal(await page.locator('#record-panel').isVisible(),true);
  assert.equal(await page.locator('#space-record[aria-current="page"]').count(),1);
  await page.locator('#space-conversation').click();
  await page.locator('#space-room').click();
  assert.equal(await page.locator('#stage').isVisible(),true);
  assert.equal(await page.locator('#space-room[aria-current="page"]').count(),1);
  const navAndMap=await page.evaluate(()=>({
    nav:document.querySelector('#space-bar').getBoundingClientRect().top,
    map:document.querySelector('.atlas-panel').getBoundingClientRect().bottom,
    width:document.documentElement.scrollWidth
  }));
  assert.ok(navAndMap.map<=navAndMap.nav+1,'Map never obscures persistent bottom navigation');
  assert.ok(navAndMap.width<=390+1,'Mobile tabs must not overflow');
  await page.locator('#space-conversation').click();
  assert.equal(await page.locator('#room-question').isVisible(),true);
  // The image panels lead to exact-accession conversations, not arbitrary related tags.
  assert.ok(await page.locator('#room-participants .object-more').count()>=1,'At least one speaker has another curated room');
  await page.locator('#room-participants .object-more').first().click();
  assert.match(await page.locator('#timeline-title').innerText(),/More conversations with /);
  assert.ok(await page.locator('#timeline-list .path-post').count()>0,'Related room list should not be empty');
  await page.locator('#questions-back').click();
  assert.equal(await page.locator('#room-question').innerText(),'Who pays the price of progress?');
  assert.equal(await page.locator('#space-room').innerText(),'Map');
  // Exact record inspection is independent of selecting/recentering an episode.
  const episodeId=await page.locator('#room-header').getAttribute('data-episode');
  await page.locator('#room-participants .object-inspect').nth(1).click();
  assert.match(await page.locator('#record-content').innerText(),/TD1989\.318\.1/);
  assert.equal(await page.locator('#room-header').getAttribute('data-episode'),episodeId);
  for(const width of [320,390]){
    await page.setViewportSize({width,height:740});
    const picker=await page.locator('.record-object-picker').boundingBox();
    const card=await page.locator('.record-frame').boundingBox();
    assert.ok(card.y>=picker.y+picker.height-1 && card.width>=width-50,'Full-width record below picker at '+width);
  }
  await screenshot('mobile-record');
  await page.locator('[data-panel=conversation]').click();
  await page.locator('#conversation-head').click();
  assert.match(await page.locator('#episode-evidence').innerText(),/not historical speech or live autonomous AI/);
  assert.match(await page.locator('#episode-evidence').innerText(),/85\.4\.64\.43[\s\S]*TD1989\.318\.1/);
  await page.locator('#sheet-close').click();
  await page.locator('#space-leave').click();
  assert.equal(await page.locator('#timeline-title').innerText(),'Choose a question');
  assert.match(await page.locator('#timeline-list').innerText(),/Authored scene/);
  const card=page.locator('.path-post').first();
  assert.equal(await card.locator('.question-card-portraits img').count(),2);
  assert.ok(await card.locator('.preview-line').innerText());
  for(const width of [320,390]){
    await page.setViewportSize({width,height:844});
    const bounds=await page.locator('.path-post').nth(1).boundingBox();
    assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width+1 && bounds.y+bounds.height<=844,'Two complete rooms fit at '+width);
  }
  await screenshot('question-cards-390');
  await page.locator('#timeline-list section').first().locator('button').last().click();
  assert.notEqual(await page.locator('#room-header').getAttribute('data-episode'),episodeId);
  await page.locator('#space-leave').click();
  await page.locator('#timeline-list button').filter({hasText:'Who pays the price of progress?'}).click();
  assert.equal(await page.locator('#room-header').getAttribute('data-episode'),episodeId);
  await page.getByRole('button',{name:'More questions with these objects'}).click();
  assert.equal(await page.locator('#timeline-title').innerText(),'Follow these objects');
  assert.equal(await page.locator('#timeline-list button').filter({hasText:'Who pays the price of progress?'}).count(),0);
  await page.locator('#timeline-list button').filter({hasText:'What does a monument owe the hands that built it?'}).click();
  assert.equal(await page.locator('#room-kind').textContent(),'AI-assisted script');
  await page.getByRole('button',{name:'More questions with these objects'}).click();
  await page.locator('#timeline-list button').filter({hasText:'Who builds the future?'}).click();
  assert.equal(await page.locator('#room-question').innerText(),'Who builds the future?');
  await page.locator('#source-info').click();
  await page.waitForURL('**/demo/about/');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await screenshot('mobile-about');
  await open();

  // Test selection coherently on the graph; unedited pairs never get fake dialogue.
  await page.setViewportSize({width:1280,height:900});
  const pairIds=new Set();let promptIndex=-1;
  for(let i=0;i<6;i++){
    await selectEdge(i);
    pairIds.add(await page.locator('#room-header').getAttribute('data-episode'));
    const mode=await page.locator('#room-header').getAttribute('data-mode');
    const focused=(await page.locator('#stage').getAttribute('data-pair')).split('|');
    const labels=await page.locator('#room-participants .object-inspect').evaluateAll(buttons=>buttons.map(b=>b.getAttribute('aria-label')));
    for(const accession of focused.filter(Boolean))assert.ok(labels.some(label=>label.includes(accession)));
    if(mode==='RESEARCH_PROMPT'){
      promptIndex=i;
      assert.equal(await page.locator('.turn').count(),0);
      assert.equal(await page.locator('#play').isDisabled(),true);
      assert.match(await page.locator('#conversation-content').innerText(),/no edited dialogue/);
    }else assert.ok(await page.locator('.turn').count()>=3);
  }
  assert.equal(pairIds.size,6,'Each pair has its own episode identity');
  assert.ok(promptIndex>=0,'Include a real unedited-pair fallback');
  await selectEdge(promptIndex);await screenshot('research-prompt');
  await page.locator('.conversation-edge[data-accession="TD1989.318.1"]').focus();await page.keyboard.press('Enter');
  const script=await page.locator('.chat').innerText();
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="worker"]').click();
  await page.locator('.conversation-edge[data-accession="TD1989.318.1"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.chat').innerText(),script,'A perspective never rewrites authored text');
  await page.locator('#room-rationale').click();
  assert.match(await page.locator('#episode-evidence').innerText(),/does not change its script/);
  await page.locator('#sheet-close').click();

  // Playback stays explicit and cancels when a different pair is selected.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class MockUtterance{constructor(text){this.text=text;}}});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{name:'Test local',lang:'en-US',localService:true}],speak:()=>{},cancel:()=>{}}});
  });
  await page.locator('#space-play').click();
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#room-participants .speaking').count(),1);
  await page.locator('#space-play').click();
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'false');
  await page.locator('#space-play').click();
  await page.locator('#space-leave').click();await page.locator('.path-post').nth(1).click();
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#room-participants .speaking').count(),0);

  // Route and voice boundaries remain covered against an actual authored scene.
  await page.setViewportSize({width:1280,height:900});await open();await selectEdge(0);
  await page.locator('#admin').evaluate(el=>{el.hidden=false;});
  await page.selectOption('#voice-mode','elevenlabs');await page.locator('#play').evaluate(button=>button.click());
  assert.match(await page.locator('#voice-status').textContent(),/approval/);assert.equal(voiceRequests.length,0);
  await page.fill('#access-token','TEST_ONLY_PRIVATE_DEMO_TOKEN_12345');await page.locator('#check-services').click();
  await page.waitForFunction(()=>document.querySelector('#service-status').textContent.includes('ElevenLabs: disabled'));
  await page.locator('#external-approved').check();await page.locator('#play').evaluate(button=>button.click());
  await page.waitForFunction(()=>document.querySelector('#voice-status').textContent.includes('not enabled'));
  assert.equal(voiceRequests.length,1);
  await page.locator('#admin-close').click();
  await page.locator('#reading-toggle').click();await page.locator('[data-lens="archivist"]').click();
  assert.equal(await page.locator('#external-approved').isChecked(),false);

  // Following an object is an explicit new investigation, with an in-memory return.
  const oldTitle=await page.locator('#atlas-title').innerText();
  await page.locator('[data-follow-object]').click();
  assert.notEqual(await page.locator('#atlas-title').innerText(),oldTitle);
  await page.locator('[data-return-object]').click();
  assert.equal(await page.locator('#atlas-title').innerText(),oldTitle);

  // Local CSV and saved JSON retain source identity and safe text rendering.
  const csv=await readFile(new URL('examples/archive-society.synthetic.csv',root),'utf8');
  const hostile=csv.replace('Invented household radio','<img src=x onerror=globalThis.__archiveXss=1>');
  await page.locator('#csv-file').setInputFiles({name:'synthetic-test.csv',mimeType:'text/csv',buffer:Buffer.from(hostile)});
  await page.waitForFunction(()=>document.querySelector('#import-status').textContent.includes('4 CSV'));
  assert.equal(await page.evaluate(()=>globalThis.__archiveXss),undefined);
  assert.match(await page.locator('#atlas-title').innerText(),/<img src=x/);
  const lookup=[{'Accession Number':'TEST2026.101',Title:'TEST ONLY',Date:'TEST_DATE_NOT_HISTORY'}];
  await page.locator('#snapshot-file').setInputFiles({name:'synthetic-lookup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(lookup))});
  await page.waitForFunction(()=>document.querySelector('#snapshot-content').textContent.includes('EXACT_PRIMARY_ACCESSION'));
  assert.match(await page.locator('#snapshot-content').textContent(),/EXACT_PRIMARY_ACCESSION/);
  assert.equal(await page.locator('#room-header').getAttribute('data-mode'),'RESEARCH_PROMPT');
  assert.equal(await page.locator('.turn').count(),0);
  assert.match(await page.locator('#snapshot-content').textContent(),/TEST_DATE_NOT_HISTORY/);
  for(const path of ['/.env.local','/server/archive-services.mjs'])assert.equal((await page.request.get(base+path)).status(),404);
  for(const path of ['/demo/about/','/demo/discovery-lab/'])assert.equal((await page.request.get(base+path)).status(),200);

  await open();
  const corpusCount=await page.locator('#seed option').count();
  await page.locator('#atlas-mode').check();assert.equal(await page.locator('.graph-node').count(),Math.min(100,corpusCount),'Overview must use the loaded corpus, without inventing nodes to reach 100');
  const scaleOf=()=>page.locator('#stage').evaluate(el=>Number(el.dataset.scale));
  const fitted=await scaleOf();
  await page.locator('#zoom-toggle').click();await page.locator('[data-stop="100"]').click();assert.ok(await scaleOf()>fitted);
  await page.locator('#zoom-toggle').click();await page.locator('#fit').click();assert.ok(Math.abs(await scaleOf()-fitted)<0.02);
  await page.locator('#atlas-mode').uncheck();
  await page.locator('#theme-toggle').click();await page.locator('#theme-choices [data-theme="Domestic life"]').click();
  assert.equal(await page.locator('#stage').getAttribute('data-theme'),'Domestic life');

  // 200% desktop zoom has half the CSS viewport. Check reflow and reachability.
  await open();await page.setViewportSize({width:640,height:450});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#conversation-content .turn').last().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#conversation-content .turn').last().evaluate(el=>{const b=el.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  await screenshot('zoom-200-reflow');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#space-room').click();
  assert.ok(await page.locator('#stage').isVisible());
  await screenshot('mobile-map');
  await page.locator('#room-back').click();
  assert.ok(await page.locator('#room-question').isVisible());
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('Archive Society browser checks passed: question-first rooms at 320/390/768/1280; two visible messages; selected-pair and exact-record identity; authored vs research prompts; lens semantics; no autoplay; playback cancellation; source/XSS/service boundaries; graph/Map; reduced-motion and 200% reflow.');
} finally {await browser?.close();child.kill('SIGTERM');}
