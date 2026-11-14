// Browser smoke for Discovery Lab. No museum spreadsheet, artwork image or network API is loaded.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try{
   let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(path.endsWith('/'))path+='index.html';
   const target=resolve(root,'.'+path);
   if(target!==root && !target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
   const content=await readFile(target);
   res.writeHead(200,{'content-type':types[extname(target)]||'application/octet-stream','cache-control':'no-store'});
   res.end(content);
 }catch{res.writeHead(404);res.end('not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1480,height:960},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:'+port+'/demo/discovery-lab/',{waitUntil:'networkidle'});
 await page.locator('.object-node').first().waitFor();
 await mkdir(join(root,'artifacts'),{recursive:true});
 await page.screenshot({path:join(root,'artifacts','discovery-lab-invented-overview.png'),fullPage:true});
 assert.equal(await page.locator('.persona-item').count(),5,'Everyday personas should show 5');
 assert.ok((await page.locator('.object-node').count())>=3,'The graph should have multiple actual object cards');
 assert.ok((await page.locator('.edge-chip').count())>=1,'Edges should expose their tags');
 await page.locator('#show-archive').click();
 assert.equal(await page.locator('.persona-item').count(),6,'Archive Dreams should show 6 original-role cards in this iteration');
 await page.locator('#reveal-prompt').click();
 assert.equal(await page.locator('#prompt-modal').isVisible(),true);
 assert.match(await page.locator('#prompt-text').textContent(),/ONLY USE:|NEVER:/);
 await page.locator('#close-prompt').click();
 await page.locator('.edge-chip').first().click({force:true});
 assert.match(await page.locator('#connection-panel').textContent(),/METADATA ASSOCIATION/);
 await page.locator('[data-detail="voice"]').click();
 assert.equal(await page.locator('#dialogue .passage').count(),3);
 await page.locator('#object-question').fill('Where was this kept?');
 await page.locator('#ask-object').click();
 assert.match(await page.locator('#object-answer').textContent(),/cannot be inferred/);
 await page.locator('#open-source').click();
 const sample=[
  'Accession Number,Object Display Title (English Translated Title),Geography,Visual Strategy/Style,Thematic Category 1,Thematic Category 2,Thematic Category 3,Symbols/Motifs 1,Symbols/Motifs 2',
  'TEST2026.1,Invented train design,France,Montage,Travel / Transportation,Technology,,Trains,Speed',
  'TEST2026.2,Invented railway poster,Germany,Montage,Travel / Transportation,Technology,,Trains,Speed'
 ].join('\n');
 await page.locator('#csv-import').setInputFiles({name:'private-demo.csv',mimeType:'text/csv',buffer:Buffer.from(sample)});
 await page.waitForFunction(() => document.getElementById('data-chip')?.textContent.includes('2 RECORDS'), null, {timeout:5000});
 assert.match(await page.locator('#data-chip').textContent(),/2 RECORDS/);
 assert.ok((await page.locator('#data-status').textContent()).includes('No CSV contents'));
 await page.locator('#close-source').click();
 const overflow=await page.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight);
 assert.ok(overflow<=4,'Desktop body should fit the viewport; overflow '+overflow);
 assert.deepEqual(errors,[],'No page JavaScript errors');
 await mkdir(join(root,'artifacts'),{recursive:true});
 await page.screenshot({path:join(root,'artifacts','discovery-lab-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:join(root,'artifacts','discovery-lab-mobile.png'),fullPage:true});
 console.log('PASS: persona prompts, labeled graph cards, local CSV, dialogue, responsive screenshots');
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
