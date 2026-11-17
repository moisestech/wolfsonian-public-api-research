import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MACHINE_AGE_ACCESSION,MACHINE_AGE_ACCESS_STATE,onViewResourcesFor,contemporaryWitnessFor} from '../src/machine-age-onview.mjs';

test('on-view object access does not request handling and independent references are differentiated',()=>{
 assert.equal(MACHINE_AGE_ACCESS_STATE,'ON_VIEW_NO_HANDLING');
 const sources=onViewResourcesFor(MACHINE_AGE_ACCESSION);
 assert.equal(sources.length,8);
 assert.equal(sources.find(s=>s.id==='WOLF-COPY').access,'on_view_no_handling');
 assert.equal(sources.find(s=>s.id==='TEHNE-SURROGATE').verified,'visual_sample_pages_available_other_copy');
 assert.equal(sources.find(s=>s.id==='HATHI-LISTING').verified,'bibliographic_listing_only');
 assert.equal(sources.find(s=>s.id==='HAGLEY-HISTORIC').access,'legacy_link_not_confirmed');
 assert.equal(sources.find(s=>s.id==='NY-REVIEW').type,'contemporary_witness_review');
 assert.equal(sources.find(s=>s.id==='SCRIBD-OCR').verified,'ocr_not_facs_verified');
 assert.ok(sources.every(s=>s.reproduction!=='cleared'));
 assert.deepEqual(onViewResourcesFor('UNKNOWN'),[]);
});

test('1927 review supports different fictional readers without impersonation or image copyright claims',()=>{
 const answers=['futurist','worker','archivist'].map(l=>contemporaryWitnessFor(MACHINE_AGE_ACCESSION,l));
 assert.equal(new Set(answers.map(x=>x.text)).size,3);
 for(const answer of answers){
   assert.equal(answer.status,'SOURCE_BOUNDED_CONTEMPORARY_WITNESS');
   assert.equal(answer.historicalQuotation,false);
   assert.equal(answer.notAnOriginalCataloguePage,true);
   assert.equal(answer.transcriptionCaveat,true);
   assert.equal(answer.claimIds.length,answer.claims.length);
   assert.ok(answer.claims.length>=2);
   assert.ok(answer.claims.every(c=>c.source.id==='NY-REVIEW'));
   assert.ok(answer.claims.every(c=>c.source.url.includes('newyorker.com/magazine/1927')));
   assert.ok(answer.unknowns.length>0);
 }
 assert.equal(contemporaryWitnessFor('UNKNOWN','worker').status,'NOT_ESTABLISHED');
 assert.equal(contemporaryWitnessFor(MACHINE_AGE_ACCESSION,'made-up-reader').status,'NOT_ESTABLISHED');
});

test('visitor UI shows an opt-in source inspector and an independent period witness',async()=>{
 const h=await readFile(new URL('../demo/object-lens/index.html',import.meta.url),'utf8');
 const j=await readFile(new URL('../demo/object-lens/lens.mjs',import.meta.url),'utf8');
 const s=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
 assert.match(h,/ON VIEW · NO PHYSICAL HANDLING/);
 assert.match(h,/id="witness-evidence"/);
 assert.match(h,/id="on-view-source-list"/);
 assert.match(j,/contemporaneousAccountFor/);
 assert.match(j,/Read the original period review/);
 assert.match(j,/reproduction/);
 assert.match(s,/machine-age-onview/);
 assert.doesNotMatch(j,/fetch\(|navigator\.sendBeacon/);
});
