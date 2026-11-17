import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PRIMARY_TEXT_SOURCE,PRIMARY_PAGE_LEADS,primaryPageLeadsFor} from '../src/machine-age-primary-leads.mjs';
import {MACHINE_AGE_RESEARCH,machineAgeAnswer,machineAgeResearchLeads} from '../src/machine-age-research.mjs';

test('page candidates never become verified historical claims or quotations',()=>{
  assert.equal(PRIMARY_TEXT_SOURCE.verification,'OCR_ONLY_NOT_FACSIMILE_VERIFIED');
  assert.equal(PRIMARY_TEXT_SOURCE.relationToWolfsonianCopy,'NOT_ESTABLISHED');
  assert.equal(PRIMARY_TEXT_SOURCE.rights.startsWith('No scans'),true);
  assert.equal(PRIMARY_PAGE_LEADS.length,8);
  const officialClaimIds=new Set(MACHINE_AGE_RESEARCH.claims.map(c=>c.id));
  assert.ok(PRIMARY_PAGE_LEADS.every(lead=>lead.verification==='OCR_ONLY_NOT_FACSIMILE_VERIFIED'));
  assert.ok(PRIMARY_PAGE_LEADS.every(lead=>!officialClaimIds.has(lead.id)));
  assert.ok(PRIMARY_PAGE_LEADS.every(lead=>lead.printedPageCandidate&&lead.sourceTextAnchor));
  assert.ok(PRIMARY_PAGE_LEADS.every(lead=>lead.observed.length>30&&lead.researchQuestion.length>20));
  assert.ok(MACHINE_AGE_RESEARCH.sources.every(s=>s.kind==='institutional_exhibition_checklist'));
});

test('labor sources explicitly complicate an absence-of-labor claim',()=>{
  const labor=primaryPageLeadsFor('XM1999.108.8','labor');
  assert.ok(labor.length>=2);
  assert.ok(labor.some(l=>/safety garments/i.test(l.label)));
  assert.ok(labor.some(l=>/Labor-related architectural/.test(l.label)));
  assert.ok(labor.some(l=>/Time clock/.test(l.label)));
  assert.ok(labor.every(l=>l.source.kind==='third_party_transcription'));
  assert.ok(labor.every(l=>l.source.relationToWolfsonianCopy==='NOT_ESTABLISHED'));
  const answer=machineAgeAnswer('XM1999.108.8','labor','archivist');
  assert.equal(answer.claims.length,0,'OCR leads must not be promoted to verified citations');
  assert.equal(answer.status,'UNANSWERED_RESEARCH_QUESTION');
});

test('reader/question boundaries remain source gated',()=>{
  assert.deepEqual(primaryPageLeadsFor('UNKNOWN','labor'),[]);
  assert.deepEqual(machineAgeResearchLeads('UNKNOWN','machines'),[]);
  assert.equal(machineAgeResearchLeads('XM1999.108.8','essays').length>=2,true);
  const response=machineAgeAnswer('XM1999.108.8','essays','worker');
  assert.ok(response.claims.every(c=>c.source.kind==='institutional_exhibition_checklist'));
});

test('visitor sees OCR research leads separated from factual evidence',async()=>{
  const html=await readFile(new URL('../demo/object-lens/index.html',import.meta.url),'utf8');
  const js=await readFile(new URL('../demo/object-lens/lens.mjs',import.meta.url),'utf8');
  const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
  assert.match(html,/id="primary-text-leads"/);
  assert.match(html,/third-party OCR\/transcription/);
  assert.match(html,/NOT verified against The Wolfsonian/);
  assert.match(js,/curatedPrimaryPageLeadsFor/);
  assert.match(js,/NOT VERIFIED/);
  assert.match(js,/primary-leads-list/);
  assert.match(server,/machine-age-primary-leads/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest/);
});
