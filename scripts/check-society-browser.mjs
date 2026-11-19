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
  browser=await chromium.launch({headless:true,args:['--force-prefers-reduced-motion=no-preference'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
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
  // Cloudinary-backed persona marks preserve the intended small/large roles.
  assert.equal(await page.locator('#room-lens-portrait').getAttribute('data-persona-id'),'family');
  assert.equal(await page.locator('#room-lens-portrait').getAttribute('data-persona-variant'),'compact');
  assert.match(await page.locator('#room-lens-portrait').getAttribute('src'),/\/approved-masks\/nested-family-white-compact-v1\.png$/);
  assert.match(await page.locator('#room-archivist-portrait').getAttribute('src'),/\/archivist-sepia-compact-v2\.png$/);
  assert.match(await page.locator('.chat .turn[data-role="archivist"] img').first().getAttribute('src'),/\/archivist-sepia-compact-v2\.png$/);
  assert.match(await page.locator('.perspective-turn img').getAttribute('src'),/\/approved-masks\/nested-family-white-compact-v1\.png$/);
  assert.match(await page.locator('#reading-popover [data-lens="worker"] img.persona-illustrated').getAttribute('src'),/\/worker-sepia-full-v2\.png$/);
  assert.match(await page.locator('#reading-popover [data-lens="futurist"] img.persona-illustrated').getAttribute('src'),/\/futurist-architectural-white-master-v1\.png$/);
  assert.match(await page.locator('#reading-popover [data-lens="tourist"] img.persona-illustrated').getAttribute('src'),/\/tourist-architectural-white-master-v1\.png$/);
  assert.match(await page.locator('#zoom-stage .plate.persona img').first().getAttribute('src'),/\/(?:approved-masks\/nested-family-white-full-v1|portraits\/[a-z]+-sepia-full-v2)\.png$/);
  // A blocked CDN must render the original inline vector without a broken avatar.
  await page.locator('#room-lens-portrait').evaluate(img=>img.dispatchEvent(new Event('error')));
  assert.match(await page.locator('#room-lens-portrait').getAttribute('src'),/^data:image\/svg\+xml/);
  assert.ok(decodeURIComponent(await page.locator('#room-lens-portrait').getAttribute('src')).includes('#ffffff'));
  assert.equal(await page.locator('#reading-popover [data-lens] img.persona-symbol').count(),11);
  assert.equal(await page.locator('#zoom-stage .plate.persona img.persona-symbol').count()>0,true);
  // The editorial title changes without replacing the accessible archive identity.
  assert.equal(await page.locator('#editorial-phrase').textContent(),'Archive dreams in public.');
  await page.waitForFunction(()=>document.getElementById('editorial-phrase')?.textContent==='Follow a question between objects.',null,{timeout:7500});
  await page.locator('#editorial-phrase').click();
  assert.equal(await page.locator('#editorial-phrase').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#editorial-toggle').count(),0);
  assert.equal(await page.locator('.wordmark').getAttribute('aria-label'),'Archive Dreams in Public — explore conversations');
  assert.ok(await page.locator('.graph-node').count()>=2);
  assert.equal(await page.locator('.conversation-edge').count(),6);
  assert.equal(await page.locator('#admin-toggle,#space-stop,#add-images,#clear-images').count(),0);
  assert.equal(await page.locator('#room-question').innerText(),'Who pays the price of progress?');
  assert.equal(await page.locator('#room-header').getAttribute('data-mode'),'CURATED_SCRIPT');
  assert.match(await page.locator('#room-rationale').innerText(),/Why these two\?/);
  assert.equal(await page.locator('#room-description .link-badge-label').innerText(),'Machines');
  assert.equal(await page.locator('#room-description .link-warning').textContent(),'link unproven');
  const openingPair=await page.locator('#stage').getAttribute('data-pair');
  const openingEdges=await page.locator('.conversation-edge').count();
  await page.locator('#space-leave').click();
  await page.waitForFunction(()=>document.querySelector('#timeline-title')?.textContent==='Townhall');
  assert.equal((await page.locator('#stage').getAttribute('data-pair'))||'','');
  assert.equal(await page.locator('#stage').getAttribute('data-zoom'),'0');
  const listed=await page.locator('#timeline-list .path-post').evaluateAll(cards=>{
    const ids=new Set();
    for(const card of cards){ids.add(card.dataset.source);ids.add(card.dataset.target);}
    return [...ids].sort();
  });
  const drawn=await page.locator('#stage .graph-node').evaluateAll(nodes=>nodes.map(node=>node.dataset.accession).sort());
  assert.deepEqual(drawn,listed);
  assert.ok(listed.length>2,'Townhall draws every listed conversation');
  const townhallCard=page.locator('#timeline-list .path-post').first();
  await townhallCard.hover();
  const expectedPair=await townhallCard.evaluate(node=>[node.dataset.source,node.dataset.target].sort().join('|'));
  const highlighted=((await page.locator('#stage').getAttribute('data-pair-highlight'))||'').split('|').filter(Boolean).sort().join('|');
  assert.equal(highlighted,expectedPair);
  const cluster=(await page.locator('#stage').getAttribute('data-cluster'))||'';
  assert.ok(expectedPair.split('|').every(id=>cluster.split('|').includes(id)),'Hover gathers the objects that share this connection');
  assert.equal(await page.locator('#stage').getAttribute('data-cluster-label'),await townhallCard.getAttribute('data-reason'));
  assert.equal(await page.locator('#cluster-badge').isVisible(),true);
  assert.equal(await page.locator('#cluster-badge-label').evaluate(el=>el.textContent),await townhallCard.getAttribute('data-reason'));
  assert.match(await page.locator('#cluster-badge-meta').innerText(),/objects · \d+ edges?/);
  assert.equal(await townhallCard.evaluate(node=>getComputedStyle(node.querySelector('.question-card-swatch')).backgroundColor),await townhallCard.evaluate(node=>{
    const probe=document.createElement('span');
    probe.style.color=node.style.getPropertyValue('--link');
    document.body.append(probe);
    const color=getComputedStyle(probe).color;
    probe.remove();
    return color;
  }));
  await page.locator('#timeline-title').hover();
  assert.equal((await page.locator('#stage').getAttribute('data-pair-highlight'))||'','');
  assert.equal((await page.locator('#stage').getAttribute('data-cluster'))||'','');
  assert.equal(await page.locator('#cluster-badge').isHidden(),true);
  assert.equal(await page.locator('#stage').getAttribute('data-zoom'),'0');
  assert.equal(await page.locator('#stage').getAttribute('data-dream'),'awake');
  await page.locator('#questions-back').click();
  await page.waitForFunction(()=>document.querySelector('#room-question')?.textContent==='Who pays the price of progress?');
  assert.equal(await page.locator('#stage').getAttribute('data-zoom'),'34');
  assert.equal(await page.locator('[data-stop="34"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.conversation-edge').count(),openingEdges);
  assert.equal(await page.locator('#stage').getAttribute('data-pair'),openingPair);
  assert.equal(await page.locator('#room-participants .object-inspect').count(),2);
   assert.equal(await page.locator('#room-participants .object-portrait-media').count(),2);
   assert.equal(await page.locator('#room-participants .object-portrait-meta').count(),2);
  assert.equal(await page.locator('#room-participants .object-open-arrow').count(),2);
  assert.equal(await page.locator('#scene-replay').getAttribute('aria-label'),'Replay scripted exchange without audio');
  assert.equal(await page.locator('#scene-replay').isDisabled(),false);
  const cardCopy=await page.locator('#room-participants .object-inspect').allInnerTexts();
  assert.ok(cardCopy.every(text=>!(/Collection image|Artist diagram|Record only|Inspect record|^0[12]\s*·/i.test(text))),
    'Card titles should not be crowded by format, serial numbers or record instructions');
  const labels=await page.locator('#room-participants .object-inspect').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
  assert.ok(labels.every(label=>label.startsWith('Inspect collection record: ') && /\d/.test(label)),
    'Accession detail must remain in the accessible action');
  assert.equal(await page.locator('.turn').count(),6);
  assert.match(await page.locator('.perspective-turn').innerText(),/Family/);
  assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
  assert.equal(voiceRequests.length,0,'No autoplay or unsolicited provider calls');
  assert.equal(await page.locator('#conversation-content .chat .turn').count(),6,'Complete authored transcript remains in DOM');
  // The preview is user-triggered and silent; it does not fake a live model or
  // hide lines to produce artificial streaming.
  await page.locator('#scene-replay').click();
  await page.waitForFunction(()=>document.querySelector('#scene-replay')?.getAttribute('aria-pressed')==='true');
  await page.waitForFunction(()=>document.querySelector('#conversation-content .turn.previewing'));
  assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
  assert.equal(voiceRequests.length,0,'Silent choreography must not send audio requests');
  assert.equal(await page.locator('#conversation-content .chat .turn').count(),6);
  await page.waitForFunction(()=>document.querySelector('#scene-replay')?.getAttribute('aria-pressed')==='false');
  assert.equal(await page.locator('.room-participant.previewing, .turn.previewing').count(),0);

  assert.equal(await page.locator('.encounter-orientation').count(),0);
  assert.equal(await page.locator('#conversation-content>details').count(),0);
  assert.equal(await page.locator('#room-header').evaluate(el=>el.classList.contains('is-cast-open')),false);
  const avatar=await page.locator('#room-participants .object-portrait-media').first().evaluate(el=>el.getBoundingClientRect().height);
  assert.ok(avatar>=44&&avatar<=68,'Compact cast avatars: '+avatar);
  await page.locator('#room-cast-toggle').click();
  assert.equal(await page.locator('#room-cast-toggle').getAttribute('aria-expanded'),'true');
  await screenshot('room-1280');

  // Object-first mobile: expansive photographs on arrival, compact when reading.
  for(const width of [320,390,768]){
    await page.setViewportSize({width,height:844});
    await page.locator('.rail-scroll').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
    const opening=await page.evaluate(()=>{
      const scroll=document.querySelector('.rail-scroll'),dock=document.querySelector('#space-bar').getBoundingClientRect();
      const cards=[...document.querySelectorAll('#room-participants .object-portrait-media')];
      const controls=[...document.querySelector('.top-nav').querySelectorAll('button,a')].map(x=>x.getBoundingClientRect());
      return {photoHeight:cards[0].getBoundingClientRect().height,images:cards.length,
        title:document.querySelector('#room-question').textContent,
        headerInScroller:document.querySelector('#room-header').parentElement===scroll,
        singleRow:controls.every(b=>Math.abs(b.top-controls[0].top)<2),
        navFits:controls.every(b=>b.left>=0&&b.right<=innerWidth),
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        dockVisible:dock.bottom<=innerHeight+1};
    });
    assert.equal(opening.images,2,'Two visual object identities at '+width+'px');
    assert.ok(opening.photoHeight>=170,'Large object images on arrival at '+width+'px: '+JSON.stringify(opening));
    assert.ok(opening.headerInScroller,'Heading and dialogue use the same scroll surface');
    assert.ok(opening.singleRow&&opening.navFits,'Four controls stay in one row at '+width+'px');
    assert.ok(!opening.overflow&&opening.dockVisible,'Mobile viewport has no overflow at '+width+'px');
    await screenshot('room-'+width);
    await page.locator('.rail-scroll').evaluate(el=>{el.scrollTop=300;el.dispatchEvent(new Event('scroll'));});
    const reading=await page.evaluate(()=>({
      height:document.querySelector('#room-participants .object-portrait-media').getBoundingClientRect().height,
      compact:document.querySelector('#room-header').classList.contains('is-compact'),
      reachable:document.querySelector('#conversation-content .turn')?.textContent?.length>0,
      scrollTop:document.querySelector('.rail-scroll').scrollTop
    }));
    assert.ok(reading.scrollTop>=150,'Dialogue scroll must advance: '+JSON.stringify(reading));
    assert.ok(reading.height<opening.photoHeight-55,'Object images shrink on reading scroll: '+JSON.stringify(reading));
    assert.ok(reading.compact&&reading.reachable,'Compact masthead leaves conversation accessible');
  }
  await page.locator('.rail-scroll').evaluate(el=>{el.scrollTop=0;el.dispatchEvent(new Event('scroll'));});
  // The perspective is visible in the mobile room and does not rewrite authored dialogue.
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.locator('#room-perspective-toggle').isVisible(),true);
  assert.equal(await page.locator('#room-perspective-name').innerText(),'Family');
  const authoredDialogue=()=>page.locator('.chat .turn:not(.perspective-turn)').allInnerTexts();
  const originalDialogue=await authoredDialogue();
  await page.locator('#room-perspective-toggle').click();
  assert.equal(await page.locator('#mobile-perspective-sheet').isVisible(),true);
  assert.equal(await page.locator('#mobile-perspective-choices button').count(),11);
  // Large illustration cards must remain substantial on real narrow phone viewports.
  const artworkHeight=await page.locator('#mobile-perspective-choices [data-lens="novice"] img.persona-illustrated').evaluate(el=>el.getBoundingClientRect().height);
  assert.ok(artworkHeight>=130,'The Art Novice portrait must be a readable illustration, not a tiny 42px icon');
  await screenshot('illustrated-character-gallery-390');
  assert.equal(await page.locator('#mobile-perspective-choices .approved-mask-tile').count(),4);
  const marks=page.locator('#mobile-perspective-choices .perspective-choice-group .perspective-identity-mark img');
  assert.equal(await marks.count(),11,'Every illustrated persona needs its same-family identity mark');
  for(const image of await marks.all()){
    const src=await image.getAttribute('src');
    assert.match(src,/-(?:white)-compact-v1[.]svg$/);
  }

  for(const [id,label] of [['tourist','Tourist'],['novice','Art novice'],['connoisseur','Art connoisseur'],['futurist','Futurist'],['mourner','Mourner']]){
    const choice=page.locator('#mobile-perspective-choices [data-lens="'+id+'"]');
    assert.equal(await choice.count(),1,'Perspective choice exists: '+label);
    assert.match(await choice.innerText(),new RegExp(label));
    assert.match(await choice.locator('img.persona-illustrated').getAttribute('src'),new RegExp('/'+id+'-architectural-white-master-v1[.]png$'));
  }
  assert.equal(await page.locator('#mobile-perspective-choices .perspective-choice-group-title').count(),3);
  assert.equal(await page.locator('#mobile-perspective-choices [data-lens="worker"] img.persona-illustrated').getAttribute('data-persona-variant'),'full');
  assert.equal(await page.locator('#mobile-perspective-choices [data-lens="worker"] img.persona-illustrated').getAttribute('data-persona-tone'),'white');
  await page.locator('#mobile-perspective-choices [data-lens="worker"]').click();
  assert.equal(await page.locator('#room-perspective-name').innerText(),'Worker');
  assert.equal(await page.locator('#reading-name').innerText(),'Worker');
  assert.deepEqual(await authoredDialogue(),originalDialogue,'Changing perspective does not alter an authored script');
  assert.match(await page.locator('.perspective-turn').innerText(),/Worker/);
  await page.locator('#room-perspective-toggle').click();
  assert.equal(await page.locator('#mobile-perspective-choices [data-lens="worker"]').getAttribute('aria-pressed'),'true');
  await page.locator('#mobile-perspective-choices [data-lens="family"]').click();
  assert.equal(await page.locator('#room-perspective-name').innerText(),'Family');
  await page.locator('#room-perspective-toggle').click();
  await page.locator('#mobile-perspective-choices [data-lens="novice"]').click();
  assert.equal(await page.locator('#room-perspective-name').innerText(),'Art novice');
  assert.deepEqual(await authoredDialogue(),originalDialogue);
  await page.locator('#room-perspective-toggle').click();
  await page.locator('#mobile-perspective-choices [data-lens="family"]').click();
  assert.equal(await page.locator('#room-perspective-name').innerText(),'Family');

  // Five persistent mobile destinations share the original dock space.
  assert.equal(await page.locator('#space-bar .space-tab').count(),5);
  assert.equal(await page.locator('#space-feed .space-tab-label').innerText(),'Society');
  assert.match(await page.locator('#space-feed').getAttribute('aria-label'),/archive society/);
  const appearance=page.locator('#appearance-toggle');
  assert.equal(await appearance.getAttribute('aria-pressed'),'false');
  await appearance.click();
  assert.equal(await page.locator('html').getAttribute('data-color-theme'),'light');
  assert.match(await page.locator('#room-lens-portrait').getAttribute('src'),/\/approved-masks\/nested-family-white-compact-v1\.png$/);
  // The mobile perspective sheet uses the same sepia plate in both themes.
  assert.match(await page.locator('#mobile-perspective-choices [data-lens="family"] img.persona-illustrated').getAttribute('src'),/\/family-sepia-full-v2\.png$/);
  assert.equal(await appearance.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.brand-mark-on-light').isVisible(),true);
  assert.equal(await page.locator('.brand-mark-on-dark').isVisible(),false);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(246, 244, 235)');
  await appearance.click();
  assert.equal(await page.locator('html').getAttribute('data-color-theme'),'dark');
  assert.match(await page.locator('#room-lens-portrait').getAttribute('src'),/\/approved-masks\/nested-family-white-compact-v1\.png$/);
  assert.equal(await page.locator('.brand-mark-on-dark').isVisible(),true);
  assert.equal(await page.locator('#space-bar .space-tab').count(),5);
  assert.equal(await page.locator('#space-bar[aria-label="Mobile archive navigation"]').count(),1);
  assert.equal(await page.locator('#space-conversation[aria-current="page"]').count(),1);
  assert.equal(await page.locator('#space-evidence').count(),0,'Evidence is available in the room header, not a redundant dock action');
  await page.locator('#space-feed').click();
  assert.equal(await page.locator('#path-timeline').isVisible(),true);
  assert.equal(await page.locator('#feed-perspective-toggle').isVisible(),true);
  await page.locator('#feed-perspective-toggle').click();
  await page.locator('#mobile-perspective-choices [data-lens="futurist"]').click();
  assert.equal(await page.locator('#feed-perspective-name').innerText(),'Futurist');
  await page.locator('#feed-perspective-toggle').click();
  await page.locator('#mobile-perspective-choices [data-lens="family"]').click();
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
  assert.equal(await page.locator('#timeline-title').innerText(),'Townhall');
  assert.match(await page.locator('#timeline-list').innerText(),/Conversations/);
  const questionTitles=await page.locator('#timeline-list .question-card-face strong').allTextContents();
  assert.ok(questionTitles.includes('Can a tree connect Paul Robeson to an imagined house?'));
  assert.ok(questionTitles.includes('Can water connect a trade fair to Let the Living Rise?'));
  assert.ok(questionTitles.every(title=>!(/withdraw|reject this connection|editorial/i.test(title))));
  const directoryCardText=await page.locator('#timeline-list .path-post').allInnerTexts();
  assert.ok(directoryCardText.every(text=>!(/Authored scene|Shared motif:|Imagined comparison/i.test(text))),
    'Browse cards should emphasize artwork and actual spoken questions rather than editorial terminology');
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
  await page.locator('#appearance-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-color-theme'),'light');
  await page.locator('#source-info').click();
  await page.waitForURL('**/demo/about/');
  assert.equal(await page.locator('html').getAttribute('data-color-theme'),'light','About inherits the same appearance preference');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.match(await page.locator('h2').allTextContents().then(parts=>parts.join(' | ')),/A conversation between two objects/);
  assert.equal(await page.locator('#how-conversations-are-written').count(),1);
  const aboutWords=await page.locator('h3').allTextContents();
  for(const term of ['Authored scene','Shared motif','Imagined comparison'])assert.ok(aboutWords.includes(term));
  await screenshot('mobile-about');
  await open();
  await page.locator('#appearance-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-color-theme'),'dark');

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
  const script=await page.locator('.chat .turn:not(.perspective-turn)').allInnerTexts();
  await page.locator('#reading-toggle').click();await page.locator('#reading-popover [data-lens="worker"]').click();
  await page.locator('.conversation-edge[data-accession="TD1989.318.1"]').focus();await page.keyboard.press('Enter');
  assert.deepEqual(await page.locator('.chat .turn:not(.perspective-turn)').allInnerTexts(),script,'A perspective never rewrites authored text');
  assert.match(await page.locator('.perspective-turn').innerText(),/Worker/);
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
  assert.equal(await page.locator('#voice-controls').isVisible(),true,'Live speaking activity appears above the mobile navigation');
  assert.equal(await page.locator('#voice-controls').getAttribute('data-speaker'),'objectA');
  assert.match(await page.locator('#audio-speaker').innerText(),/speaking/);
  assert.equal(await page.locator('#audio-elapsed').innerText(),'Turn 1 of 5');
  assert.equal(await page.locator('#voice-controls #play').isVisible(),false,'No duplicate mobile playback control');
  await page.locator('#space-play').click();
  assert.equal(await page.locator('#space-play').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#voice-controls').isVisible(),false,'Waveform disappears when playback stops');
  assert.equal(await page.locator('#voice-controls').getAttribute('data-speaker'),'');
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
  await page.locator('#reading-toggle').click();await page.locator('#reading-popover [data-lens="archivist"]').click();
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
  await page.locator('[data-stop="100"]').click();assert.ok(await scaleOf()>fitted);
  await page.locator('#fit').click();assert.ok(Math.abs(await scaleOf()-fitted)<0.02);
  await page.locator('#atlas-mode').uncheck();
  await page.locator('#theme-toggle').click();await page.locator('#theme-choices [data-theme="Domestic life"]').click();
  assert.equal(await page.locator('#stage').getAttribute('data-theme'),'Domestic life');

  // 200% desktop zoom has half the CSS viewport. Check reflow and reachability.
  await open();await page.setViewportSize({width:640,height:450});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#scene-replay').isVisible(),false,'Reduce-motion visitors use static text without a replay effect');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#conversation-content .turn').last().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#conversation-content .turn').last().evaluate(el=>{const b=el.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;}));
  await screenshot('zoom-200-reflow');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#space-room').click();
  assert.ok(await page.locator('#stage').isVisible());
  await screenshot('mobile-map');
  assert.equal(await page.locator('#room-back').getAttribute('aria-label'),'Back to conversation');
  assert.equal(await page.locator('#room-back svg').count(),1);
  await page.locator('#room-back').click();
  assert.ok(await page.locator('#room-question').isVisible());
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('Archive Society browser checks passed: question-first rooms at 320/390/768/1280; two visible messages; selected-pair and exact-record identity; authored vs research prompts; lens semantics; no autoplay; playback cancellation; source/XSS/service boundaries; graph/Map; reduced-motion and 200% reflow.');
} finally {await browser?.close();child.kill('SIGTERM');}
