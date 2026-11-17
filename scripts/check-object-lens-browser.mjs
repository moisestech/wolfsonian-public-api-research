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
  page.on('request',request=>{
    const url=request.url();
    if(!url.startsWith(base)&&!url.startsWith('blob:')&&!url.startsWith('data:'))external.push(url);
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
