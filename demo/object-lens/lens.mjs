import {resolvePublicAccession,encounterFor,atlasHandoffFor,curatedQuestionsFor,answerCuratedQuestion,curatedPrimaryPageLeadsFor,researchCopiesFor,contemporaneousAccountFor,visitorTopicChoices,answerVisitorQuestion} from '/src/object-lens-core.mjs';
const $=id=>document.getElementById(id);
let stream=null,match=null,encounter=null,activeReader='futurist',activeQuestion=null,activeAnswer=null;
let latestVisitorQuestion=null,latestVisitorAnswer=null;

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
  stopSpeech();clearConversation();match=null;encounter=null;activeQuestion=null;activeAnswer=null;$('confirm').checked=false;
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
  const leads=curatedPrimaryPageLeadsFor(encounter.accession,activeQuestion);
  const pending=$('primary-text-leads');
  pending.hidden=!leads.length;
  const leadRows=leads.map(lead=>{
    const li=document.createElement('li');
    const title=document.createElement('strong');
    title.textContent=lead.label+' · suggested printed p. '+lead.printedPageCandidate;
    const description=document.createElement('p');
    description.textContent=lead.observed;
    const question=document.createElement('p');
    question.textContent='To verify: '+lead.researchQuestion;
    const source=document.createElement('a');
    source.href=lead.source.url;
    source.target='_blank';
    source.rel='noopener noreferrer';
    source.textContent='Open third-party OCR (NOT VERIFIED)';
    li.append(title,description,question,source);
    return li;
  });
  $('primary-leads-list').replaceChildren(...leadRows);
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

function renderOnViewResearch() {
  if(!encounter)return;
  const list=researchCopiesFor(encounter.accession);
  $('on-view-context').hidden=!list.length;
  if(!list.length)return;
  const witness=contemporaneousAccountFor(encounter.accession,activeReader);
  $('witness-status').textContent='1927 PERIOD REVIEW · '+activeReader.toUpperCase()+' INTERPRETATION';
  $('witness-text').textContent=witness.text;
  $('witness-claims').replaceChildren(...witness.claims.map(claim=>{
    const li=document.createElement('li');
    const span=document.createElement('span');
    span.textContent=claim.label+': '+claim.paraphrase+' ';
    const link=document.createElement('a');
    link.href=claim.source.url;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Read the original period review';
    li.append(span,link);
    return li;
  }));
  $('witness-unknowns').textContent='Not established: '+witness.unknowns.join(' ');
  $('on-view-source-list').replaceChildren(...list.map(item=>{
    const li=document.createElement('li');
    const strong=document.createElement('strong');
    strong.textContent=item.label+' — '+item.type.replaceAll('_',' ');
    const p=document.createElement('p');
    p.textContent=item.scope+' Access: '+item.access.replaceAll('_',' ')+'. Reproduction: '+item.reproduction.replaceAll('_',' ')+'.';
    const link=document.createElement('a');
    link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';
    link.textContent='Open external reference';
    li.append(strong,p,link);
    return li;
  }));
}


function conversationText(tag,text,className='') {
  const el=document.createElement(tag);
  el.textContent=text;
  if(className)el.className=className;
  return el;
}
function clearConversation(){
  stopSpeech();
  latestVisitorQuestion=null;latestVisitorAnswer=null;
  $('visitor-transcript').replaceChildren();
  $('visitor-question').value='';
  $('visitor-session-status').textContent='Conversation cleared on this device. Nothing was stored or uploaded.';
  $('visitor-prompt-options').replaceChildren();
}
function renderQuestionSuggestions(items){
  const buttons=items.map(({prompt})=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=prompt;
    button.addEventListener('click',()=>{
      $('visitor-question').value=prompt;
      askVisitor(prompt);
    });
    return button;
  });
  $('visitor-prompt-options').replaceChildren(...buttons);
}
function sourceEvidence(segment){
  const box=document.createElement('div');
  box.className='conversation-source';
  box.append(conversationText('h5',segment.label));
  const sourceLink=document.createElement('a');
  sourceLink.href=segment.sourceReference.url;
  sourceLink.target='_blank';
  sourceLink.rel='noopener noreferrer';
  sourceLink.textContent='Open source for context (not proof of every claim)';
  box.append(sourceLink);
  box.append(conversationText('p',segment.text,'source-reading'));
  const disclosure=document.createElement('details');
  disclosure.append(conversationText('summary','Inspect '+segment.claims.length+' sourced claim(s) and unresolved questions'));
  const claims=document.createElement('ol');
  if(!segment.claims.length)
    claims.append(conversationText('li','No directly verified claims in this bounded response.'));
  for(const claim of segment.claims){
    const row=document.createElement('li');
    row.append(conversationText('span',claim.label+': '+claim.statement+' — '+claim.locator+'. '));
    const link=document.createElement('a');
    link.href=claim.url;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.textContent='Open '+claim.sourceTitle;
    row.append(link);
    claims.append(row);
  }
  disclosure.append(claims);
  const pending=conversationText('p','Not established by this source: '+segment.unknowns.join(' '),'small');
  disclosure.append(pending);
  box.append(disclosure);
  return box;
}
function renderVisitorTurn(question,answer,{continuation=false}={}){
  const transcript=$('visitor-transcript');
  if(!continuation){
    const turn=document.createElement('li');
    turn.className='conversation-visitor';
    turn.append(conversationText('strong','Visitor'));
    turn.append(conversationText('p',question));
    transcript.append(turn);
  }
  const reply=document.createElement('li');
  reply.className='conversation-reply';
  const persona=(answer.readerId||activeReader).toUpperCase();
  reply.append(conversationText('strong',persona+' · FICTIONAL READER · '+answer.status.replaceAll('_',' ')));
  if(answer.segments.length){
    for(const segment of answer.segments)reply.append(sourceEvidence(segment));
    reply.append(conversationText('p',answer.text,'small'));
  }else reply.append(conversationText('p',answer.text));
  reply.append(conversationText('p','Artist-authored, source-bounded dialogue; no historical speaker is being simulated as evidence.','small'));
  transcript.append(reply);
  while(transcript.children.length>14)transcript.firstChild.remove();
  reply.scrollIntoView?.({block:'nearest',behavior:'instant'});
  $('visitor-session-status').textContent='Local conversation · '+transcript.children.length+' displayed entries · no remote model, storage or upload';
}
function askVisitor(question,{continuation=false}={}){
  if(!encounter || $('encounter').hidden)return;
  stopSpeech();
  const answer=answerVisitorQuestion(encounter.accession,question,activeReader,{
    previousTopic:latestVisitorAnswer?.topicId||null
  });
  renderVisitorTurn(question,answer,{continuation});
  latestVisitorQuestion=question;
  latestVisitorAnswer=answer;
  renderQuestionSuggestions(answer.nextQuestions);
  $('visitor-question').value='';
}
function enableVisitorConversation(){
  const choices=visitorTopicChoices(encounter.accession);
  $('visitor-conversation').hidden=!choices.length;
  if(choices.length){
    renderQuestionSuggestions(choices.slice(0,5));
    $('visitor-session-status').textContent='Ready for a question. Responses use authored local packets; no transcript saved.';
  }
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
  renderOnViewResearch();
  if(latestVisitorQuestion && latestVisitorAnswer?.topicId){
    askVisitor(latestVisitorQuestion,{continuation:true});
  }
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
  enableVisitorConversation();
}
function confirm(){
  if(!$('confirm').checked||!match){stopSpeech();clearConversation();$('encounter').hidden=true;return;}
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
  const spoken=latestVisitorAnswer?.segments?.length ? latestVisitorAnswer.segments.map(x=>x.text).join(' ') : (latestVisitorAnswer?.text || activeAnswer?.text || reader.script);
  const utterance=new SpeechSynthesisUtterance(spoken);
  utterance.voice=voices[0];utterance.rate=0.94;
  utterance.onend=()=>{$('speech-status').textContent='Reading complete.';};
  utterance.onerror=()=>{$('speech-status').textContent='Speech unavailable; use transcript.';};
  $('speech-status').textContent='Reading the displayed fictional text with a local voice.';
  window.speechSynthesis.speak(utterance);
}
$('visitor-question-form').addEventListener('submit',event=>{
  event.preventDefault();
  askVisitor($('visitor-question').value);
});
$('clear-conversation').addEventListener('click',()=>{
  clearConversation();
  if(encounter)enableVisitorConversation();
});
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
