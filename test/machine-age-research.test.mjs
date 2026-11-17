import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {
  MACHINE_AGE_RESEARCH,
  machineAgeQuestions,
  machineAgeClaimLedger,
  machineAgeAnswer
} from '../src/machine-age-research.mjs';
import {curatedQuestionsFor,answerCuratedQuestion} from '../src/object-lens-core.mjs';

const accession='XM1999.108.8';
const readers=['futurist','worker','archivist'];
const sourceUrl='https://wolfsonian.org/_assets/docs/checklist_modern-design-across-borders.pdf';

test('Machine Age facts cite the institution and do not masquerade as original-page reading',()=>{
  const packet=MACHINE_AGE_RESEARCH;
  assert.equal(packet.accession,accession);
  assert.equal(packet.version,'1.0.0');
  assert.equal(packet.sources.length,1);
  assert.equal(packet.sources[0].url,sourceUrl);
  assert.equal(packet.sources[0].kind,'institutional_exhibition_checklist');
  assert.equal(packet.sources[0].originalCataloguePagesInspected,false);
  assert.equal(packet.sources[0].imageUse,'not_cleared');
  assert.equal(packet.editorialState,'artist_authored_not_museum_endorsed');
  const ledger=machineAgeClaimLedger(accession);
  assert.equal(ledger.length,10);
  assert.equal(new Set(ledger.map(x=>x.id)).size,10);
  for(const claim of ledger){
    assert.equal(claim.status,'source_fact');
    assert.equal(claim.approval,'artist_research_not_museum_reviewed');
    assert.equal(claim.source.url,sourceUrl);
    assert.ok(claim.sourceLocator.includes('Machine Age Exposition'));
  }
  assert.equal(ledger.find(x=>x.id==='MA-004').value,'Fernand Léger');
  assert.equal(ledger.find(x=>x.id==='MA-006').value,'Jane Heap');
  assert.equal(ledger.find(x=>x.id==='MA-008').value.includes('Alexander Archipenko'),true);
  assert.deepEqual(machineAgeClaimLedger('not-known'),[]);
});

test('six curated topics and three readers provide distinct authored answers',()=>{
  const questions=machineAgeQuestions(accession);
  assert.equal(questions.length,6);
  assert.deepEqual(machineAgeQuestions('unknown'),[]);
  assert.equal(curatedQuestionsFor(accession).length,6);
  const names=new Set(questions.map(x=>x.id));
  assert.deepEqual([...names],['cover','network','machines','essays','labor','evidence']);
  for(const q of questions){
    const texts=new Set();
    for(const reader of readers){
      const result=answerCuratedQuestion(accession,q.id,reader);
      assert.notEqual(result.status,'NOT_ESTABLISHED');
      assert.equal(result.authored,true);
      assert.equal(result.verifiedHistoricalQuotation,false);
      assert.equal(result.sourceState,'INSTITUTIONAL_CHECKLIST_NOT_ORIGINAL_PAGE');
      assert.equal(result.readerId,reader);
      assert.equal(result.question,q.question);
      assert.ok(result.text.length>60);
      assert.ok(result.unknowns.length>0);
      assert.equal(result.claims.length,result.claimIds.length);
      for(const claim of result.claims){
        assert.ok(result.claimIds.includes(claim.id));
        assert.equal(claim.source.id,'WOLF-EXH-2025-MDAB');
        assert.equal(claim.source.url,sourceUrl);
      }
      texts.add(result.text);
    }
    assert.equal(texts.size,3,'readers must meaningfully differ on '+q.id);
  }
});

test('unsupported objects, questions, and reader roles fail closed',()=>{
  for(const [id,q,lens] of [
    ['unknown','cover','archivist'],
    [accession,'nonexistent','worker'],
    [accession,'cover','historical-witness']
  ]){
    const r=machineAgeAnswer(id,q,lens);
    assert.equal(r.status,'NOT_ESTABLISHED');
    assert.deepEqual(r.claims,[]);
    assert.deepEqual(r.claimIds,[]);
  }
  const labor=machineAgeAnswer(accession,'labor','archivist');
  assert.equal(labor.status,'UNANSWERED_RESEARCH_QUESTION');
  assert.equal(labor.claims.length,0);
  assert.match(labor.text,/Not established/);
  assert.ok(labor.unknowns.some(x=>/original/i.test(x)));
});

test('the original pages and permissions remain explicit open research tasks',()=>{
  const open=MACHINE_AGE_RESEARCH.openResearch;
  assert.equal(open.length,4);
  assert.ok(open.some(item=>/foreword/.test(item.question)&&item.status==='pending_original_page_review'));
  assert.ok(open.some(item=>item.status==='rights_review_required'));
  assert.ok(open.some(item=>/labor|workers/i.test(item.question)));
});

test('the phone provides source-inspectable, prepared questions without external model API',async()=>{
  const html=await readFile(new URL('../demo/object-lens/index.html',import.meta.url),'utf8');
  const ui=await readFile(new URL('../demo/object-lens/lens.mjs',import.meta.url),'utf8');
  const server=await readFile(new URL('../scripts/serve-archive-society.mjs',import.meta.url),'utf8');
  assert.match(html,/id="curated-questions"/);
  assert.match(html,/id="question-options"/);
  assert.match(html,/id="answer-citations"/);
  assert.match(html,/not responses from a live AI model/);
  assert.match(ui,/answerCuratedQuestion/);
  assert.match(ui,/claim\.source\.url/);
  assert.match(ui,/activeAnswer\?\.text \|\| reader\.script/);
  assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|navigator\.sendBeacon|ElevenLabs/);
  assert.match(server,/object-lens-core\|machine-age-research/);
});
