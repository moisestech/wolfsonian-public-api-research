import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const port=8797,base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/serve-archive-society.mjs'],{
  cwd:new URL('../',import.meta.url),
  env:{...process.env,PORT:String(port),ARCHIVE_ENABLE_LAKEHOUSE:'0',ARCHIVE_ENABLE_ELEVENLABS:'0'},
  stdio:['ignore','pipe','pipe']
});
let browser;
try{
  await new Promise((resolve,reject)=>{
    const time=setTimeout(()=>reject(new Error('Server not ready')),12000);
    server.stdout.on('data',chunk=>{if(chunk.toString().includes('Archive Society:')){clearTimeout(time);resolve()}});
    server.once('exit',code=>{clearTimeout(time);reject(new Error('Server exited '+code))});
  });
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[],outbound=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith(base)&&!req.url().startsWith('blob:')&&
      !req.url().startsWith('data:'))outbound.push(req.url())});
  const response=await page.goto(base+'/demo/storage-volume/',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  assert.match(await page.title(),/Storage Dream/);
  await page.waitForFunction(()=>!document.querySelector('#render-status').textContent.includes('Preparing'));
  assert.equal(await page.locator('#identity-list button').count(),4);
  assert.equal(await page.locator('#box-list button').count(),6);
  assert.match(await page.locator('#selected-detail').innerText(),/NOT ESTABLISHED/);
  await page.locator('#box-list button').first().click();
  assert.match(await page.locator('#selected-detail').innerText(),/Not an actual Annex box/);
  await page.locator('#identity-list button').first().click();
  assert.match(await page.locator('#selected-source').innerText(),/UNKNOWN/);
  await page.locator('#inquiry').selectOption('systems');
  assert.match(await page.locator('#inquiry-prompt').innerText(),/identities, beliefs, labor, value, and agency/);
  await page.locator('#dialogue-toggle').click();
  assert.equal(await page.locator('#dialogue .turn').count(),9);
  assert.match(await page.locator('#dialogue').innerText(),/no approved record connecting/);
  await page.locator('#level').selectOption('DEMO-L2');
  await page.locator('#show-boxes').uncheck();
  await page.locator('#reset').click();
  assert.equal(await page.locator('#level').inputValue(),'all');
  assert.equal((await page.request.get(base+'/.env.local')).status(),404);
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  assert.deepEqual(outbound,[]);
  console.log('PASS storage cube: accessible list, 9 turns, evidence boundaries, mobile, no remote calls.');
}finally{await browser?.close();server.kill('SIGTERM')}
