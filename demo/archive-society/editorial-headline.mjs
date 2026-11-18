// Artist-authored editorial statements, not quotes from collection objects.
export const EDITORIAL_PHRASES=Object.freeze([
  'Archive dreams in public.',
  'What could two objects say?',
  'The past imagined futures.',
  'Every connection is a question.',
  'Imagined voices. Real records.',
  'Interpretation is not evidence.'
]);
export const nextEditorialIndex=index=>(index+1)%EDITORIAL_PHRASES.length;

// Motion never changes the accessible name of the archive link.
// Pauses for reduced-motion, tab visibility, hover, keyboard focus, and explicit control.
export function initEditorialHeadline({doc=document,win=window}={}){
  const phrase=doc.getElementById('editorial-phrase');
  const toggle=doc.getElementById('editorial-toggle');
  const area=doc.querySelector('.brand-area');
  if(!phrase||!toggle||!area)return ()=>{};
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,paused=false,hovering=false,focusing=false,tick=null,swap=null,disposed=false;
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
      index=nextEditorialIndex(index);
      phrase.textContent=EDITORIAL_PHRASES[index];
      phrase.classList.remove('is-changing');
      schedule();
    },220);
  };
  const update=()=>{
    clear();
    phrase.classList.remove('is-changing');
    toggle.setAttribute('aria-pressed',String(paused));
    const label=paused?'Resume rotating title':'Pause rotating title';
    toggle.setAttribute('aria-label',label);
    toggle.title=label;
    toggle.firstElementChild.textContent=paused?'▶':'Ⅱ';
    schedule();
  };
  const enter=()=>{hovering=true;update();};
  const leave=()=>{hovering=false;update();};
  const focus=()=>{focusing=true;update();};
  const blur=event=>{if(!area.contains(event.relatedTarget)){focusing=false;update();}};
  const change=()=>{if(reduced.matches){index=0;phrase.textContent=EDITORIAL_PHRASES[0];}update();};
  const click=()=>{paused=!paused;update();};
  area.addEventListener('mouseenter',enter);
  area.addEventListener('mouseleave',leave);
  area.addEventListener('focusin',focus);
  area.addEventListener('focusout',blur);
  toggle.addEventListener('click',click);
  doc.addEventListener('visibilitychange',update);
  reduced.addEventListener?.('change',change);
  phrase.textContent=EDITORIAL_PHRASES[0];
  update();
  return ()=>{
    disposed=true;clear();
    area.removeEventListener('mouseenter',enter);
    area.removeEventListener('mouseleave',leave);
    area.removeEventListener('focusin',focus);
    area.removeEventListener('focusout',blur);
    toggle.removeEventListener('click',click);
    doc.removeEventListener('visibilitychange',update);
    reduced.removeEventListener?.('change',change);
  };
}
