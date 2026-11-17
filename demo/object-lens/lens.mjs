import {resolvePublicAccession,encounterFor,atlasHandoffFor,curatedQuestionsFor,answerCuratedQuestion} from '/src/object-lens-core.mjs';
const $=id=>document.getElementById(id);
let stream=null,match=null,encounter=null,activeReader='futurist',activeQuestion=null,activeAnswer=null;

function stopSpeech(){
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  $('speech-status').textContent='Voice stopped; transcript available.';
}
function stopCamera(){
  for(const track of stream?.getTracks()||[])track.stop();
  stream=null;
  $('preview').srcObject=null;$('preview').hidden=true;
  $('open-camera').hidden=false;$('close-camera').hidden=true;
  $('camera-status').textContent='Camera is off. Tracks stopped. No frames stored.';
}
async function openCamera(){
  $('camera-status').textContent='Requesting camera permission…';
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    $('preview').srcObject=stream;$('preview').hidden=false;
    $('open-camera').hidden=true;$('close-camera').hidden=false;
    $('camera-status').textContent='Camera preview active; recognition remains off.';
  }catch{
    $('camera-status').textContent='Camera unavailable or denied. Enter the accession manually.';
  }
}
function resetConfirmation(){
  stopSpeech();match=null;encounter=null;activeQuestion=null;activeAnswer=null;$('confirm').checked=false;
  $('confirm').disabled=true;$('encounter').hidden=true;
}
function checkAccession(){
  resetConfirmation();
  const found=resolvePublicAccession($('accession').value);
  if(found.status==='EXACT'){
    match=found.record;
    $('result').textContent='Public research identity: '+match.title+' · '+match.accession+'. Not a visual recognition result.';
    $('confirm').disabled=false;
  }else{
    $('result').textContent=found.status==='AMBIGUOUS'
      ?'Multiple records match this identifier. No identity selected.'
      :'Not found in six public research packets. A partial accession is never accepted.';
  }
}
function renderCuratedAnswer(){
  if(!encounter || !activeQuestion){
    activeAnswer=null;
    $('question-panel').hidden=true;
    return;
  }
  const question=curatedQuestionsFor(encounter.accession).find(x=>x.id===activeQuestion);
  activeAnswer=answerCuratedQuestion(encounter.accession,activeQuestion,activeReader);
  $('question-panel').hidden=false;
  $('question-title').textContent=question?.question||'Unknown research question';
  $('question-status').textContent=activeAnswer.status.replaceAll('_',' ')+' · '+activeReader.toUpperCase();
  $('question-answer').textContent=activeAnswer.text;
  const li=activeAnswer.claims.map(claim=>{
    const item=document.createElement('li');
    const text=document.createElement('span');
    text.textContent=claim.label+': '+claim.value+' — '+claim.source.title+', '+claim.source.locator+'. ';
    item.append(text);
    const link=document.createElement('a');
    link.href=claim.source.url;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Inspect public checklist';
    item.append(link);
    return item;
  });
  $('answer-citations').replaceChildren(...li);
  $('answer-unknowns').textContent=activeAnswer.unknowns.length
    ? 'Still unknown: '+activeAnswer.unknowns.join(' ')
    : 'No further unknowns were specified for this prepared question.';
  if(!li.length){
    const item=document.createElement('li');
    item.textContent='No directly verified claim supports this question in the present source packet.';
    $('answer-citations').append(item);
  }
  for(const button of $('question-options').querySelectorAll('button'))
    button.setAttribute('aria-pressed',String(button.dataset.question===activeQuestion));
}

function selectCuratedQuestion(id){
  stopSpeech();
  activeQuestion=id;
  renderCuratedAnswer();
}

function renderReader(){
  const reader=encounter?.readers.find(r=>r.id===activeReader);
  if(!reader)return;
  stopSpeech();
  $('reader-label').textContent=reader.icon+' '+reader.label+' · ARTIST-AUTHORED';
  $('reader-script').textContent=reader.script;
  $('reader-prompt').textContent='Prompt: '+reader.prompt;
  $('reader-blindspot').textContent='Blind spot: '+reader.blindSpot;
  for(const b of $('reader-options').querySelectorAll('button'))
    b.setAttribute('aria-pressed',String(b.dataset.reader===activeReader));
  if(activeQuestion)renderCuratedAnswer();
}
function renderEncounter(){
  encounter=encounterFor(match.accession);
  if(!encounter)return;
  $('encounter').hidden=false;
  $('encounter-title').textContent=encounter.title+' · '+encounter.accession;
  $('encounter-question').textContent=encounter.question;
  const controls=encounter.readers.map(reader=>{
    const b=document.createElement('button');
    b.type='button';b.dataset.reader=reader.id;b.textContent=reader.icon+' '+reader.label;
    b.addEventListener('click',()=>{activeReader=reader.id;renderReader();});
    return b;
  });
  $('reader-options').replaceChildren(...controls);
  const questions=curatedQuestionsFor(match.accession);
  $('curated-questions').hidden=!questions.length;
  const qButtons=questions.map(q=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.question=q.id;button.textContent=q.label;
    button.addEventListener('click',()=>selectCuratedQuestion(q.id));
    return button;
  });
  $('question-options').replaceChildren(...qButtons);
  activeQuestion=questions[0]?.id||null;
  activeAnswer=null;
  const dl=$('evidence-list');dl.replaceChildren();
  for(const field of encounter.evidence){
    const dt=document.createElement('dt'),dd=document.createElement('dd');
    dt.textContent=field.field;
    dd.textContent=field.value+' · '+field.status.replaceAll('_',' ').toLowerCase();
    dl.append(dt,dd);
  }
  $('source-link').replaceChildren();
  if(encounter.sourceUrl){
    const link=document.createElement('a');
    link.href=encounter.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Inspect the public source reference';
    $('source-link').append(link);
  }else $('source-link').textContent='More documentation needs review.';
  $('handoff').href=atlasHandoffFor(match.accession)||'../archive-society/';
  activeReader='futurist';renderReader();
}
function confirm(){
  if(!$('confirm').checked||!match){stopSpeech();$('encounter').hidden=true;return;}
  renderEncounter();
}
function speak(){
  const reader=encounter?.readers.find(r=>r.id===activeReader);
  stopSpeech();
  if(!reader||!('speechSynthesis' in window)){
    $('speech-status').textContent='Speech unavailable. Use the transcript.';return;
  }
  const voices=window.speechSynthesis.getVoices().filter(v=>v.localService===true&&/^en/i.test(v.lang));
  if(!voices.length){
    $('speech-status').textContent='No verified local English voice installed. Transcript only; no remote voice requested.';return;
  }
  const utterance=new SpeechSynthesisUtterance(activeAnswer?.text || reader.script);
  utterance.voice=voices[0];utterance.rate=0.94;
  utterance.onend=()=>{$('speech-status').textContent='Reading complete.';};
  utterance.onerror=()=>{$('speech-status').textContent='Speech unavailable; use transcript.';};
  $('speech-status').textContent='Reading the displayed fictional text with a local voice.';
  window.speechSynthesis.speak(utterance);
}
$('open-camera').addEventListener('click',openCamera);
$('close-camera').addEventListener('click',stopCamera);
$('check').addEventListener('click',checkAccession);
$('accession').addEventListener('input',resetConfirmation);
$('confirm').addEventListener('change',confirm);
$('speak').addEventListener('click',speak);
$('stop-speech').addEventListener('click',stopSpeech);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopCamera();stopSpeech();}});
window.addEventListener('pagehide',()=>{stopCamera();stopSpeech();});
const initial=new URLSearchParams(location.search).get('accession');
if(initial){$('accession').value=initial;checkAccession();} // URL does not confirm identity
