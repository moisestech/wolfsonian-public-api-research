import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),port=8790,base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['scripts/serve-archive-society.mjs'],{
  cwd:root,env:{...process.env,PORT:String(port),ARCHIVE_ENABLE_LAKEHOUSE:'0',ARCHIVE_ENABLE_ELEVENLABS:'0'},
  stdio:['ignore','pipe','pipe']
});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Server startup timed out')),10000);
    child.stdout.on('data',part=>{if(part.toString().includes('Archive Society:')){clearTimeout(timeout);resolve();}});
    child.once('exit',code=>{clearTimeout(timeout);reject(new Error('Server exited '+code));});
  });
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  const publicPhoto=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/archive-dreams\/object-images\//;
  // Allow only version-pinned, artist-owned branding and persona artwork.
  // Museum records, private packets, and browser state must still stay local.
  const identityMark=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/aperture-(?:white|black)-v1\.svg$/;
  const personaMark=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/personas\/(?:family|tourist|novice|connoisseur|worker|archivist|futurist|mourner|propagandist|counterfeit|museum)-(?:white|ink)-(?:full|compact)-v1\.svg$/;
  // V2 portraits are artist-owned, version-pinned static art and cannot convey museum records.
  const personaPortrait=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/personas\/portraits\/(?:family|worker|archivist)-(?:sepia|white|ink)-(?:full|compact)-v2\.png$/;

  // v4 figures are artist-led review studies. These URLs are only public image artwork, not museum records.
  const personaGalleryV4=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/personas\/portraits\/(?:tourist|novice|connoisseur|futurist|mourner|propagandist|counterfeit|museum)-sepia-(?:full|compact)-v4\.png$/;
  // Eight new geometric portrait masters, with PNG delivery transforms restricted to pinned versions.
  const architecturalPortrait=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/c_scale,w_(?:384|1024),h_(?:384|1024)\/f_png\/v\d+\/archive-dreams\/brand\/personas\/architectural-masks-v1\/(?:tourist|novice|connoisseur|futurist|mourner|propagandist|counterfeit|museum)-architectural-(?:white|ink)-master-v1\.png$/;
  // The four user-supplied Deco masks are decorative studies, not named speaker roles.
  const approvedMask=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/v\d+\/archive-dreams\/brand\/personas\/approved-masks\/(?:nested-family|architectural-deco|tiered-deco|halo-deco)-(?:white|ink)-(?:full|compact)-v1\.png$/;

  const sculpturalPortrait=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/c_scale,w_(?:192|1024)\/f_auto\/q_auto\/v\d+\/archive-dreams\/brand\/personas\/sculptural-masks-v3\/(?:family|tourist|novice|connoisseur|worker|archivist|futurist|mourner|propagandist|counterfeit|museum)-limestone-master-v3\.png$/;
  const flatPersona=/^https:\/\/res\.cloudinary\.com\/dck5rzi4h\/image\/upload\/c_scale,w_(?:128|512)\/f_png\/v\d+\/archive-dreams\/brand\/personas\/flat-circular-v1\/(?:family|tourist|novice|connoisseur|worker|archivist|futurist|mourner|propagandist|counterfeit|museum)-(?:white|ink)-master-v1\.png$/;
  page.on('request',request=>{
    const url=request.url();
    if(url.startsWith(base)||url.startsWith('blob:')||url.startsWith('data:')||publicPhoto.test(url)||identityMark.test(url)||personaMark.test(url)||personaPortrait.test(url)||personaGalleryV4.test(url)||architecturalPortrait.test(url)||approvedMask.test(url)||sculpturalPortrait.test(url)||flatPersona.test(url))return;
    external.push(url);
  });

  await page.goto(base+'/demo/object-lens/?accession=XM1999.108.8',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#accession').inputValue(),'XM1999.108.8');
  assert.equal(await page.locator('#confirm').isEnabled(),true);
  assert.equal(await page.locator('#encounter').isVisible(),false,'A URL may propose but cannot confirm an identity');
  await page.locator('#confirm').check();
  await page.locator('#encounter').waitFor({state:'visible'});
  assert.match(await page.locator('#encounter-title').innerText(),/Machine Age Exposition catalogue/);

  assert.equal(await page.locator('#on-view-context').isVisible(),true);
  assert.match(await page.locator('#on-view-heading').innerText(),/on display/);
  assert.equal(await page.locator('#on-view-source-list li').count(),8);
  await page.locator('#on-view-sources').evaluate(details=>{details.open=true;});
  assert.match(await page.locator('#on-view-source-list').innerText(),/HathiTrust/);
  assert.match(await page.locator('#witness-text').innerText(),/1927 visitor/);
  const witnessA=await page.locator('#witness-text').innerText();

  assert.equal(await page.locator('#reader-script').count(),1);
  const futurist=await page.locator('#reader-script').innerText();
  await page.locator('[data-reader="worker"]').click();
  const worker=await page.locator('#reader-script').innerText();

  assert.notEqual(await page.locator('#witness-text').innerText(),witnessA);
  assert.equal(await page.locator('#witness-claims li').count()>=2,true);
  assert.equal(await page.locator('#witness-claims a').count()>=2,true);
  await page.locator('#witness-evidence').evaluate(details=>{details.open=true;});
  assert.match(await page.locator('#witness-unknowns').innerText(),/Not established/);

  assert.notEqual(worker,futurist);
  await page.locator('[data-reader="archivist"]').click();
  const archivist=await page.locator('#reader-script').innerText();
  assert.notEqual(archivist,worker);
  assert.match(archivist,/original pages/);
  assert.match(await page.locator('#evidence-list').innerText(),/XM1999\.108\.8/);
  assert.match(await page.locator('#evidence-list').innerText(),/1927/);

  assert.equal(await page.locator('#question-options button').count(),6);
  assert.match(await page.locator('#question-answer').innerText(),/Fernand Léger/);
  await page.locator('#answer-evidence').evaluate(node=>{node.open=true;});
  assert.match(await page.locator('#answer-citations').innerText(),/cover designer|Cover designer/i);
  assert.equal(await page.locator('#answer-citations a').count()>0,true);
  assert.match(await page.locator('#answer-unknowns').innerText(),/unknown/i);
  await page.locator('[data-question="network"]').click();
  assert.match(await page.locator('#question-answer').innerText(),/Jane Heap/);
  await page.locator('[data-reader="worker"]').click();
  const workerAnswer=await page.locator('#question-answer').innerText();
  await page.locator('[data-reader="archivist"]').click();
  assert.notEqual(await page.locator('#question-answer').innerText(),workerAnswer);
  await page.locator('[data-question="labor"]').click();
  assert.match(await page.locator('#question-answer').innerText(),/Not established/);
  assert.match(await page.locator('#answer-citations').innerText(),/No directly verified claim/);
  assert.match(await page.locator('#answer-unknowns').innerText(),/original/i);

  const leadsText=await page.locator('#primary-leads-list').textContent();
  assert.match(leadsText,/Safety garments and masks appear in exhibit list/);
  assert.match(leadsText,/Labor-related architectural entries/);
  assert.match(leadsText,/Time clock in the exhibit list/);
  assert.match(leadsText,/NOT VERIFIED/);
  const leadLinks=await page.locator('#primary-leads-list a').count();
  assert.ok(leadLinks>=3);
  assert.equal(await page.locator('#visitor-conversation').isVisible(),true);
  await page.locator('#visitor-question').fill('Why did the 1927 reviewer see a future, and who built it?');
  await page.locator('#visitor-question-form button[type="submit"]').click();
  assert.equal(await page.locator('#visitor-transcript > li').count(),2);
  assert.equal(await page.locator('#visitor-transcript .conversation-source').count(),2);
  assert.match(await page.locator('#visitor-transcript').innerText(),/BOUNDED COMPARISON/);
  const reviewed=await page.locator('#visitor-transcript .conversation-source a').evaluateAll(links=>links.map(l=>l.href));
  assert.ok(reviewed.some(url=>url.includes('newyorker.com/magazine/1927')));
  assert.ok(reviewed.some(url=>url.includes('wolfsonian.org')));
  const firstReading=await page.locator('#visitor-transcript .conversation-source .source-reading').first().textContent();
  await page.locator('[data-reader="worker"]').click();
  assert.equal(await page.locator('#visitor-transcript > li').count(),3);
  const otherReading=await page.locator('#visitor-transcript .conversation-reply').last().locator('.source-reading').first().textContent();
  assert.notEqual(firstReading,otherReading,'Changing reader must preserve question while changing interpretation');
  await page.locator('#visitor-question').fill('How many balloons were in the gallery?');
  await page.locator('#visitor-question-form button[type="submit"]').click();
  assert.match(await page.locator('#visitor-transcript .conversation-reply').last().innerText(),/NOT ESTABLISHED/);
  assert.equal(await page.locator('#visitor-transcript .conversation-reply').last().locator('.conversation-source').count(),0);
  await page.locator('#clear-conversation').click();
  assert.equal(await page.locator('#visitor-transcript > li').count(),0);
  assert.equal(await page.locator('#visitor-question').inputValue(),'');
  assert.equal(await page.locator('#visitor-prompt-options button').count()>0,true);

  await page.locator('[data-question="cover"]').click();
  assert.equal(await page.locator('#primary-text-leads').isVisible(),false,'no unsupported primary-page citations for cover');


  assert.equal((await page.locator('#handoff').getAttribute('href')), '../archive-society/?accession=XM1999.108.8');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Phone width should not overflow');
  await mkdir(new URL('artifacts/',root),{recursive:true});
  await page.screenshot({path:new URL('artifacts/object-lens-mobile.png',root).pathname,fullPage:true});

  await page.locator('#handoff').click();
  await page.waitForFunction(()=>document.querySelector('#atlas-title')?.textContent.includes('XM1999.108.8'),null,{timeout:15000});
  assert.match(await page.locator('#atlas-title').innerText(),/XM1999\.108\.8/);
  assert.equal(await page.locator('.conversation-edge').count(),0,'Fallback identity has no invented edges');

  await page.goto(base+'/demo/object-lens/?accession=DOESNOTEXIST',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#confirm').isEnabled(),false);
  assert.equal(await page.locator('#encounter').isVisible(),false);
  await page.goto(base+'/demo/object-lens/?accession=85.7.383a%2Cb',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#confirm').isEnabled(),true);
  assert.equal(await page.locator('#encounter').isVisible(),false);

  assert.deepEqual(errors,[]);
  assert.deepEqual(external,[]);
  console.log('PASS: source-first object lens on mobile, confirmation, three voices, evidence, exact handoff, isolated node, unknown and comma accession.');
}finally{
  await browser?.close();
  child.kill('SIGTERM');
}
