// Artist-authored editorial statements, not quotes from collection objects.
export const EDITORIAL_PHRASES=Object.freeze([
  'Archive dreams in public.',
  'Follow a question between objects.',
  'The voices are imagined.',
  'Check the records.',
  'What could two objects say?',
  'The past imagined futures.',
  'Every connection is a question.',
  'Imagined voices. Real records.',
  'Interpretation is not evidence.'
]);

// Short lines in each artist-authored voice. They ask the way that perspective asks.
// They do not claim a historical fact about an object.
export const PERSPECTIVE_PHRASES=Object.freeze({
  family:Object.freeze([
    'Archive dreams in public.',
    'Who kept the household going?',
    'What changed at home?',
    'Care rarely signs its name.',
    'A poster is not a household.'
  ]),
  tourist:Object.freeze([
    'Where is this inviting you?',
    'The picture sells a destination.',
    'A fair promises elsewhere.',
    'The ticket is not the journey.',
    'Promotion is not the trip.'
  ]),
  novice:Object.freeze([
    'What am I looking at?',
    'Start with what you can see.',
    'A familiar shape is a start.',
    'Ask before you name it.',
    'The motif is not the explanation.'
  ]),
  connoisseur:Object.freeze([
    'Look at how it was made.',
    'Line, type, and silhouette.',
    'What does the picture repeat?',
    'Likeness is not influence.',
    'The making is the question.'
  ]),
  worker:Object.freeze([
    'Who made this, and kept it?',
    'Someone carried this.',
    'The hands are usually offstage.',
    'A labor theme is not a worker.',
    'Use leaves a trace too.'
  ]),
  archivist:Object.freeze([
    'What can the record say?',
    'A shared tag is only an index.',
    'Keep the field off the guess.',
    'Missing information stays missing.',
    'Name the limit.'
  ]),
  futurist:Object.freeze([
    'What future did this promise?',
    'Speed was the argument.',
    'Tomorrow was designed, not lived.',
    'Progress here is a way of speaking.',
    'A machine can sell time.'
  ]),
  mourner:Object.freeze([
    'Who is missing from this picture?',
    'A monument can cover a loss.',
    'What was displaced to make this?',
    'The symbol is not the person.',
    'Survival is not the whole story.'
  ]),
  propagandist:Object.freeze([
    'Who is this trying to recruit?',
    'Belief is being designed.',
    'A flag is an argument.',
    'Notice the appeal, then the gap.',
    'Reading this is not agreeing.'
  ]),
  counterfeit:Object.freeze([
    'What would be easy to invent?',
    'A smooth story is not a source.',
    'If it sounds certain, check it.',
    'Reject the tempting link.',
    'This voice catches inventions.'
  ]),
  museum:Object.freeze([
    'What can be shared responsibly?',
    'This voice is fictional.',
    'The museum here is a role.',
    'Offer the question, not a verdict.',
    'Say what the record withholds.'
  ])
});
export const nextEditorialIndex=(index,length=EDITORIAL_PHRASES.length)=>(index+1)%length;

// Motion never changes the accessible name of the archive link.
// Pauses for reduced-motion, tab visibility, hover, keyboard focus, and explicit control.
let activeHeadline=null;
export function setEditorialPerspective(id){
  activeHeadline?.setPerspective(id);
}
export function initEditorialHeadline({doc=document,win=window}={}){
  const phrase=doc.getElementById('editorial-phrase');
  const area=doc.querySelector('.brand-area');
  if(!phrase||!area)return ()=>{};
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  let phrases=EDITORIAL_PHRASES,index=0,paused=false,hovering=false,focusing=false,tick=null,swap=null,disposed=false;
  const clear=()=>{
    if(tick!==null)win.clearTimeout(tick);
    if(swap!==null)win.clearTimeout(swap);
    tick=null;swap=null;
  };
  const allowed=()=>!disposed&&!paused&&!reduced.matches&&!doc.hidden&&!hovering&&!focusing;
  const schedule=()=>{
    if(allowed())tick=win.setTimeout(advance,4800);
  };
  const advance=()=>{
    tick=null;
    if(!allowed())return;
    phrase.classList.add('is-changing');
    swap=win.setTimeout(()=>{
      swap=null;
      index=nextEditorialIndex(index,phrases.length);
      phrase.textContent=phrases[index];
      phrase.classList.remove('is-changing');
      schedule();
    },220);
  };
  const update=()=>{
    clear();
    phrase.classList.remove('is-changing');
    phrase.setAttribute('aria-pressed',String(paused));
    const label=paused?'Resume rotating title':'Pause rotating title';
    phrase.setAttribute('aria-label',label);
    phrase.title=label;
    schedule();
  };
  const enter=()=>{hovering=true;update();};
  const leave=()=>{hovering=false;update();};
  const focus=()=>{focusing=true;update();};
  const blur=event=>{if(!area.contains(event.relatedTarget)){focusing=false;update();}};
  const change=()=>{if(reduced.matches){index=0;phrase.textContent=phrases[0];}update();};
  const setPerspective=id=>{
    const next=PERSPECTIVE_PHRASES[id]||EDITORIAL_PHRASES;
    if(next===phrases)return;
    phrases=next;
    index=0;
    phrase.textContent=phrases[0];
    update();
  };
  const click=()=>{paused=!paused;update();};
  area.addEventListener('mouseenter',enter);
  area.addEventListener('mouseleave',leave);
  area.addEventListener('focusin',focus);
  area.addEventListener('focusout',blur);
  phrase.addEventListener('click',click);
  doc.addEventListener('visibilitychange',update);
  reduced.addEventListener?.('change',change);
  phrase.textContent=phrases[0];
  update();
  const api={setPerspective};
  activeHeadline=api;
  return ()=>{
    disposed=true;
    if(activeHeadline===api)activeHeadline=null;
    clear();
    area.removeEventListener('mouseenter',enter);
    area.removeEventListener('mouseleave',leave);
    area.removeEventListener('focusin',focus);
    area.removeEventListener('focusout',blur);
    phrase.removeEventListener('click',click);
    doc.removeEventListener('visibilitychange',update);
    reduced.removeEventListener?.('change',change);
  };
}
