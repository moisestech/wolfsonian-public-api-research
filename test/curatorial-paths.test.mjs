import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(await read('data/research/worlds-fairs-critical-records-20261117.json'));

test('six proposals have museum published accession identities and no claims of runtime readiness',()=>{
  assert.equal(data.schema,'archive-dreams-curatorial-candidates-v1');
  assert.equal(data.status,'research_only_not_runtime');
  assert.match(data.source.url,/^https:\/\/wolfsonian\.org\/_assets\/docs\/checklist_worlds-fairs\.pdf$/);
  assert.equal(data.candidates.length,6);
  assert.deepEqual(data.candidates.filter(x=>x.priority==='P0').map(x=>x.accession),
    ['83.2.19','XC2024.03.1.1','83.6.2']);
  assert.equal(new Set(data.candidates.map(x=>x.accession)).size,6);
  for(const entry of data.candidates){
    assert.equal(entry.runtimeStatus,'not_in_active_graph');
    assert.equal(entry.sourceStatus,'published_exhibition_checklist');
    assert.equal(entry.proposedComparisonsAre,'artist_curatorial_hypotheses_not_verified_edges');
    assert.ok(entry.publicSource===data.source.url);
    assert.ok(entry.limits.length>30);
    assert.ok(entry.question.endsWith('?'));
  }
});

test('research comparisons cite only listed public candidates or previously known source packets',()=>{
  const available=new Set([...data.candidates,...data.existingResearchPackets].map(r=>r.accession));
  for(const candidate of data.candidates)
    for(const proposed of candidate.proposedComparisons)
      assert.ok(available.has(proposed),candidate.accession+' refers to unknown '+proposed);
});

test('1939 Futurama spread is not confused with the 1940 booklet',()=>{
  const spread=data.candidates.find(r=>r.accession==='83.2.19');
  const booklet=data.existingResearchPackets.find(r=>r.accession==='XB1992.1640');
  assert.match(spread.title,/book page spread/i);
  assert.match(booklet.title,/1940/);
  assert.notEqual(spread.accession,booklet.accession);
});

test('new research queue is not silently injected into the live graph or staff-derived matrix',async()=>{
  const [matrix,graph,publicAnchors]=await Promise.all([
    read('src/matrix-objects.mjs'),read('src/archive-society.mjs'),read('src/atlas-graph.mjs')
  ]);
  const concat=matrix+'\n'+graph+'\n'+publicAnchors;
  for(const candidate of data.candidates)
    assert.ok(!concat.includes(candidate.accession),'Do not silently publish candidate '+candidate.accession+' as live');
});

test('About explains research agency, prior exhibitions and accurate evidence / rights boundaries',async()=>{
  const [about,atlas,css,readme]=await Promise.all([
    read('demo/about/index.html'),read('demo/archive-society/index.html'),
    read('demo/archive-society/society.css'),read('README.md')
  ]);
  for(const needed of [
    'What if an archive could disagree with itself?',
    'After Utopia'
  ])assert.ok(about.includes(needed));
  assert.match(about,/World's Fairs: Visions of Tomorrow/);
  assert.match(about,/not a verified interaction/i);
  assert.match(about,/not additional conversations currently available/i);
  assert.match(about,/Interpretation is not evidence/);
  assert.match(about,/rights|permission/i);
  assert.match(atlas,/href="\.\.\/about\/" class="about-link"/);
  assert.match(css,/\.top-actions a\.about-link/);
  assert.match(readme,/research candidates\\*\\*, not newly deployed graph nodes/i);
});
