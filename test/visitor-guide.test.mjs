import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {visitorGuide} from '../src/visitor-guide.mjs';

const record={title:'On Munitions: Skilled Work',accession:'85.4.64.34',source:'lakehouse'};
const edge={source:'85.4.64.34',target:'TD1989.317.66',reasons:[{family:'motif',value:'Women',sourceColumns:['Symbols/Motifs 1'],targetColumns:['Symbols/Motifs 2']}]};
test('a real catalog + staff tag is shown as two distinct source layers',()=>{
  const g=visitorGuide(record,edge,{visibleCount:7});
  assert.equal(g.kind,'SAVED CATALOG + STAFF TAGS');
  assert.match(g.line,/shared symbol “Women”/);
  assert.match(g.line,/not proof/);
  assert.match(g.subtitle,/partial lookup/);
  assert.equal(g.badge,'7 objects in this view');
  assert.equal(g.hasConnection,true);
  assert.equal(g.accession,'85.4.64.34');
});
test('a fictitious practice object is not mislabeled as museum data',()=>{
  const g=visitorGuide({title:'Imagined machine',accession:'FICTION-01',source:'invented'},edge);
  assert.equal(g.kind,'FICTIONAL EXAMPLE');
  assert.match(g.subtitle,/invented practice example/);
});
test('staff CSV has its own source boundary and empty state does not pretend to connect',()=>{
  const g=visitorGuide({title:'Local item',accession:'X',source:'local-csv'},null);
  assert.equal(g.kind,'LOCALLY IMPORTED RESEARCH');
  assert.equal(g.hasConnection,false);
  assert.match(g.line,/No shared-tag conversation/);
});
test('unknown source fields do not invent provenance or identity',()=>{
  const g=visitorGuide({title:'',accession:'',source:''},{target:'X',reasons:[]});
  assert.equal(g.title,'Choose an object');
  assert.equal(g.hasConnection,false);
  assert.match(g.kind,/SOURCE STATUS TO CONFIRM/);
});
test('visitor-first controls are real, source-aware and advanced tools remain available',async()=>{
  const h=await readFile(new URL('../demo/archive-society/index.html',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/archive-society/society.mjs',import.meta.url),'utf8');
  const css=await readFile(new URL('../demo/archive-society/society.css',import.meta.url),'utf8');
  const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
  for (const id of ['visitor-listen','visitor-evidence','visitor-object','visitor-source','visitor-connection']) {
    assert.ok(h.includes('id="'+id+'"'),'missing visitor control '+id);
    assert.ok(js.includes("'"+id+"'"),'missing runtime wiring '+id);
  }
  assert.match(h,/Meet an object[\s\S]*Hear a conversation[\s\S]*Check the evidence/);
  assert.match(h,/<details class="advanced-map">/);
  assert.match(h,/<summary>More map options<\/summary>/);
  assert.match(h,/id="layer-accession"/);
  assert.match(h,/id="layer-box"/);
  assert.match(h,/id="atlas-mode"/);
  assert.match(h,/id="voice-mode"/);
  assert.match(js,/function updateVisitorGuide/);
  assert.match(js,/visitorGuide\(record\(\),shownEdge\(\)/);
  assert.match(js,/visitInspector\('record'\)/);
  assert.match(js,/void play\(\)/);
  assert.match(css,/\.visitor-guide\{/);
  assert.match(css,/min-height:48px/);
  assert.match(server,/voice-cast\|visitor-guide/);
  assert.ok(!h.includes('autoplay'), 'visitor speech must be initiated by a click');
});
