#!/usr/bin/env node
/**
 * Browser smoke for the generated LOCAL listening room, not public playback.
 * No real audio, service calls, media telemetry or external browser navigation.
 */
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildLocalAudioReview} from './build-audio-lab-review.mjs';

const {file}=await buildLocalAudioReview();
const browser=await chromium.launch({headless:true});
const externalRequests=[];
try{
  const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
  page.on('request',request=>{
    if(/^https?:/i.test(request.url()))externalRequests.push(request.url());
  });
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(file).href);
  assert.match(await page.locator('h1').innerText(),/society sound alive/);
  assert.equal(await page.locator('#scene option').count(),10);
  assert.equal(await page.locator('#turns .turn').count(),8);
  assert.match(await page.locator('#status').innerText(),/P0/);
  assert.equal(await page.locator('#audioA').getAttribute('src'),null);
  assert.equal(await page.locator('#audioB').getAttribute('src'),null);
  assert.equal(await page.locator('#audioA').evaluate(x=>x.autoplay),false);
  assert.equal(await page.locator('#audioB').evaluate(x=>x.autoplay),false);
  await page.locator('select[aria-label="A score: Voice identity"]').selectOption('4');
  await page.locator('select[aria-label="B score: Voice identity"]').selectOption('5');
  await page.locator('#notesA').fill('Natural conversational cadence but verify every specific claim.');
  await page.locator('#next').selectOption('hybrid');

  // An artificial 0.1-second WAV checks the browser file selection without
  // requesting or shipping any real audio asset.
  const wave=Buffer.alloc(44+1600);
  wave.write('RIFF',0,'ascii');wave.writeUInt32LE(wave.length-8,4);
  wave.write('WAVEfmt ',8,'ascii');wave.writeUInt32LE(16,16);
  wave.writeUInt16LE(1,20);wave.writeUInt16LE(1,22);
  wave.writeUInt32LE(8000,24);wave.writeUInt32LE(16000,28);
  wave.writeUInt16LE(2,32);wave.writeUInt16LE(16,34);
  wave.write('data',36,'ascii');wave.writeUInt32LE(1600,40);
  await page.locator('#fileA').setInputFiles({name:'synthetic-silence.wav',mimeType:'audio/wav',buffer:wave});
  assert.match(await page.locator('#audioA').getAttribute('src'),/^blob:/);
  assert.equal(await page.locator('#audioB').getAttribute('src'),null);

  const exportPending=page.waitForEvent('download');
  await page.locator('#export').click();
  const download=await exportPending;
  assert.equal(download.suggestedFilename(),'archive-society-listening-notes.json');

  // A scene change releases the selected local blob URL, and the previous
  // scores remain in memory until the user exports them.
  await page.locator('#scene').selectOption('07-trees-not-proof');
  assert.equal(await page.locator('#fileA').inputValue(),'');
  assert.equal(await page.locator('#audioA').getAttribute('src'),null);
  assert.match(await page.locator('#rights').innerText(),/Do not send unpublished staff metadata/);
  await page.locator('#scene').selectOption('01-household-audience');
  assert.equal(await page.locator('select[aria-label="A score: Voice identity"]').inputValue(),'4');

  for(const width of [320,390,768]){
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),
      'Listening room overflow at '+width+'px');
  }
  assert.deepEqual(externalRequests,[],'The local listening room must not make external requests.');
  assert.deepEqual(errors,[],'The listening room must load without browser errors.');
  console.log('Audio-lab local listening room browser smoke passed at 320, 390, and 768px.');
}finally{await browser.close();}
