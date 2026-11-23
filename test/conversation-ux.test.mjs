import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CURATED_EDGE_SCENES,sceneForConfirmedEdge} from '../src/curated-edge-scenes.mjs';
import {conversationFor} from '../src/archive-society.mjs';
import {tagColor,voiceColors,ARCHIVIST_COLOR} from '../demo/archive-society/conversation-color.mjs';

const repoUrl='../demo/archive-society/';
const scriptedIds=[
  'machines-engine-safety',
  'opening-skilled-work-lottery',
  'opening-skilled-work-engine',
  'machines-vote-engine'
];
test('mobile has one accessible Play/Stop toggle, not simultaneous controls',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 assert.match(html,/<button type="button" id="space-play" class="space-tab space-listen" aria-label="Play conversation" aria-pressed="false"/);
 assert.doesNotMatch(html,/id="space-stop"/);
 assert.doesNotMatch(js,/\$\('space-stop'\)/);
 assert.match(js,/space\.setAttribute\('aria-pressed',String\(playing\)\)/);
 assert.match(js,/label\.textContent=playing\?'Stop':'Listen'/);
 assert.match(js,/\$\('space-play'\)\?\.addEventListener\('click',\(\)=>\$\('play'\)\.click\(\)\)/);
});
test('all app overlay dismissal buttons display × and retain descriptive accessibility labels',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 const elements=['admin-close','sheet-close','prompt-close'];
 for(const id of elements){
   const match=html.match(new RegExp('<button[^>]*id="'+id+'"[^>]*>[^<]*<\\/button>'));
   assert.ok(match,'button exists '+id);
   assert.match(match[0],/class="close-icon"/);
   assert.match(match[0],/aria-label="Close [^"]+"/);
   assert.match(match[0],/>×<\/button>/);
   assert.match(css,new RegExp('#'+id+'\\.close-icon'));
 }
 assert.match(css,/env\(safe-area-inset-top/);
 assert.match(css,/min-height: 48px/);
});
test('four anchor scenes hear one another, while preserving the synthetic-role/source boundary',()=>{
 for(const id of scriptedIds){
  const scene=CURATED_EDGE_SCENES.find(s=>s.id===id);
  assert.ok(scene,id);
  assert.equal(scene.turns.length,5);
  assert.deepEqual(scene.turns.map(t=>t.speakerAccession),[scene.a,scene.b,scene.a,'archivist',scene.b]);
  assert.ok(scene.turns.every(t=>t.kind==='ARTIST_AUTHORED_INTERPRETATION'));
  assert.ok(scene.turns[2].text.length>=25);
  assert.ok(scene.turns[3].text.match(/shared|motif|records|tag|source/i));
  assert.equal(scene.historicalRelationshipEstablished,false);
  const edge={id:'TEST-EDGE',reasons:[{family:scene.requires.family,value:scene.requires.value,sourceColumns:['Staff category'],targetColumns:['Staff category']}]};
  const a={accession:scene.a,title:'Test A'};
  const b={accession:scene.b,title:'Test B'};
  const conversation=conversationFor(a,b,edge,'worker');
  assert.equal(conversation.mode,'CURATED_EDGE_SCENE');
  assert.equal(conversation.turns.length,5);
  assert.ok(conversation.turns.every(t=>!t.citations.length));
  assert.equal(conversation.historicalRelationshipEstablished,false);
  assert.equal(sceneForConfirmedEdge(scene.a,scene.b,[]),null);
 }
});
test('fallback holds a short repartee with a distinct archivist evidence interruption',()=>{
 const a={accession:'SYN-A',title:'Untitled test drawing'};
 const b={accession:'SYN-B',title:'Untitled test program'};
 const edge={id:'TEST',reasons:[{family:'motif',value:'Trees',sourceColumns:['motif'],targetColumns:['motif']}]};
 const c=conversationFor(a,b,edge,'worker');
 assert.equal(c.turns.length,5);
 assert.deepEqual(c.turns.map(x=>x.role),['objectA','objectB','objectA','archivist','objectB']);
 assert.equal(c.resourceLayer,'no_matched_catalog_field');
 assert.equal(c.historicalRelationshipEstablished,false);
 assert.ok(c.turns[3].text.includes('not')||c.turns[3].text.includes('Nothing'));
 assert.match(c.turns[4].text,/question/i);
 assert.ok(c.turns.every(t=>typeof t.text==='string'&&t.text.length>10));
});

// Keep both object panels, the authored transcript, and focused cross-room navigation.
test('each room gives its two objects a large visual stage and separate ways to inspect or follow',async()=>{
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 assert.match(js,/function objectVisual\(record\)/);
 assert.match(js,/PACKET_STUDIES/);
 assert.match(js,/node\('span',undefined,'object-portrait-media'/);
 assert.match(js,/object-portrait-meta/);
 assert.match(js,/function openObjectQuestions\(accession\)/);
 assert.match(js,/const currentIds=new Set\(relatedAnchor/);
 assert.match(js,/other\.addEventListener\('click',\(\)=>openObjectQuestions\(p\.accession\)\)/);
 assert.match(js,/box\.append\(chat,listenerQuestion\(\)\)/);
 assert.match(css,/\.room-participant \.object-inspect/);
 assert.match(css,/\.object-portrait-media/);
 assert.match(css,/@media\(max-width:360px\)/);
});


test('object speaker cards show only the object title and record arrow',async()=>{
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 assert.match(js,/metadata\.append\(objectTitle\(p\.shortName,'strong'\),arrow\)/);
 assert.match(js,/node\('span','↗','object-open-arrow'\)/);
 assert.match(js,/arrow\.setAttribute\('aria-hidden','true'\)/);
 assert.match(js,/inspect\.setAttribute\('aria-label','Inspect collection record: '/);
 assert.doesNotMatch(js,/metadata\.append\(node\('small',\(i\?'02'/);
 assert.doesNotMatch(js,/p\.accession\+' · Inspect record/);
 assert.doesNotMatch(css,/\.speaker-status/);
 assert.match(css,/\.object-open-arrow/);
});

test('mobile perspective controls share one canonical lens and preserve desktop selector',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 for(const key of ['room','feed'])assert.match(html,new RegExp('id="'+key+'-perspective-toggle"'));
 assert.match(html,/id="mobile-perspective-sheet"/);
 assert.match(html,/id="mobile-perspective-choices"/);
 assert.match(html,/id="reading-toggle"/);
 assert.match(js,/mobilePerspectiveSheet\.showModal\(\)/);
 assert.match(js,/\$\('lens'\)\.dispatchEvent\(new Event\('change'\)\)/);
 assert.match(js,/toggle\.setAttribute\('aria-label','Choose perspective, currently '/);
 assert.match(css,/#room-perspective-toggle/);
 assert.match(css,/#feed-perspective-toggle/);
});
test('speaking waveform is keyed to every scripted voice and cancels cleanly',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 assert.match(html,/id="voice-controls" class="audio-bar" data-speaker=""/);
 assert.match(html,/id="audio-speaker"/);
 assert.match(js,/function updateSpeakingAudio\(turn,index,count\)/);
 assert.match(js,/updateSpeakingAudio\(turn,i,conversation\.turns\.length\)/);
 for(const role of ['objectA','objectB','archivist']){
   assert.match(css,new RegExp('data-speaker="'+role+'"'));
 }
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/body\.show-space \.evidence-rail \.audio-bar\.playing/);
 assert.match(js,/audioBar\.dataset\.speaker=''/);
});


test('Society navigation and appearance controls preserve archive accessibility',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const app=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 assert.match(html,/id="space-feed"[^>]+aria-label="Explore the archive society"/);
 assert.match(html,/<span class="space-tab-label">Society<\/span>/);
 assert.match(html,/id="appearance-toggle"/);
 assert.match(app,/function applyAppearance\(mode\)/);
 assert.match(app,/localStorage\.setItem\(appearanceKey,mode\)/);
 assert.match(app,/document\.documentElement\.dataset\.colorTheme/);
 assert.match(css,/html\[data-color-theme="light"\] body/);
 assert.match(css,/html\[data-color-theme="light"\] #space-bar \.space-tab/);
 assert.match(css,/#appearance-toggle/);
});

test('entering a scripted room stages a brief non-audio entrance with reduced-motion support',async()=>{
 const app=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 assert.match(app,/function startSceneEntrance\(\)/);
 assert.match(app,/function cancelSceneEntrance\(\)/);
 assert.match(app,/state\.episode\?\.mode!=='CURATED_SCRIPT'/);
 assert.match(app,/prefers-reduced-motion: reduce/);
 assert.match(app,/startSceneEntrance\(\);\n}\nfunction onGraphSelect/);
 assert.match(app,/startSceneEntrance\(\);\n}\nfunction render\(\)/);
 assert.match(app,/animate\(element,\[\{opacity:\.35/);
 assert.match(app,/cancelSceneEntrance\(\);\n  playback\+\+/);
});


test('silent scene preview uses a separate role state from actual audio playback',async()=>{
 const app=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 assert.match(app,/import \{ scriptedScenePlan \}/);
 assert.match(app,/function replayScriptedScene\(\)/);
 assert.match(app,/function cancelScriptedPreview\(\)/);
 assert.match(app,/const replay=node\('button','↻','object-cast-link'\)/);
 assert.match(app,/replay\.setAttribute\('aria-label','Replay scripted exchange without audio'\)/);
 assert.match(app,/replay\.disabled=episode\.mode!=='CURATED_SCRIPT'/);
 assert.match(app,/replay\.addEventListener\('click',/);
 assert.match(app,/replayScriptedScene\(\);\n  \}\);\n\}/);
 assert.match(app,/if\(name==='record'\)cancelSceneEntrance\(\)/);
 assert.match(css,/\.room-participant\.previewing/);
 assert.match(css,/\.bubble\.turn\.previewing/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

function hueOf(color){
 return Number(String(color).match(/hsl\((\d+)/)[1]);
}
function hueGap(a,b){
 const delta=Math.abs(a-b)%360;
 return Math.min(delta,360-delta);
}
test('a conversation takes the shared-category color and each speaker keeps a distinct one',async()=>{
 const html=await readFile(new URL(repoUrl+'index.html',import.meta.url),'utf8');
 const js=await readFile(new URL(repoUrl+'society.mjs',import.meta.url),'utf8');
 const css=await readFile(new URL(repoUrl+'society.css',import.meta.url),'utf8');
 const stage=await readFile(new URL('../demo/force-stage.mjs',import.meta.url),'utf8');
 assert.equal(tagColor('Machines'),'hsl(220, 68%, 52%)');
 assert.notEqual(tagColor('Women'),tagColor('Political symbols'));
 const known=['Machines','Technology','Water','Trees','Labor','Factories','Flags','Women','Political symbols','Mythological figures','War / Military'];
 const hues=known.map(label=>hueOf(tagColor(label)));
 for(let i=0;i<hues.length;i++){
  for(let j=i+1;j<hues.length;j++)assert.ok(hueGap(hues[i],hues[j])>=28,known[i]+' and '+known[j]);
 }
 const fallback=['Progress','Archive','Dream','Brain','Copper','Night','Shared'].map(tagColor);
 assert.ok(new Set(fallback).size>=3);
 for(const color of fallback){
  const hue=hueOf(color);
  for(const reserved of hues)assert.ok(hueGap(hue,reserved)>=14,color+' sits on a reserved hue');
 }
 const room=tagColor('Machines');
 const voices=voiceColors('85.4.64.43','TD1989.318.1',room);
 assert.equal(voices.archivist,ARCHIVIST_COLOR);
 assert.notEqual(voices.objectA,voices.objectB);
 assert.ok(hueGap(hueOf(voices.objectA),hueOf(room))>=28);
 assert.ok(hueGap(hueOf(voices.objectB),hueOf(room))>=28);
 assert.ok(hueGap(hueOf(voices.objectA),hueOf(voices.objectB))>=28);
 const again=voiceColors('85.4.64.43','TD1989.318.1',room);
 assert.deepEqual(voices,again);
 const gold=voiceColors('85.4.64.43','TD1989.318.1','#e8d5a3');
 assert.equal(gold.archivist,ARCHIVIST_COLOR);
 assert.notEqual(gold.objectA,gold.objectB);
 assert.match(js,/const linkColor=tagColor\(edge\.reasons\[0\]\.value\)/);
 assert.match(js,/chat\.style\.setProperty\('--link',linkColor\)/);
 assert.match(js,/paintRailLink\(linkColor\)/);
 assert.match(js,/chat\.style\.setProperty\('--link','#e8d5a3'\)/);
 assert.match(js,/bubble\.style\.setProperty\('--speaker',voices\[turn\.role\]\|\|voices\.archivist\)/);
 assert.match(js,/card\.style\.setProperty\('--speaker',voices\[p\.role\]\|\|voices\.archivist\)/);
 assert.match(js,/voice:voices\.objectA/);
 assert.match(js,/withSpeakerColors\(nodes, edge\.source, edge\.target, linkColor\)/);
 assert.match(stage,/accent: node\.voice \|\| accent\.get\(node\.id\)/);
 assert.match(css,/\.link-badge-swatch\{[^}]*background:var\(--link/);
 assert.match(html,/id="room-lens"/);
 assert.match(html,/id="room-prompts"/);
 assert.match(html,/id="prompt-cast"/);
 assert.match(css,/color-mix\(in srgb,var\(--link,#243c37\) 12%,#0c1210\)/);
 assert.match(css,/color-mix\(in srgb,var\(--speaker\) 28%,#14211e\)/);
 assert.match(css,/color-mix\(in srgb,var\(--speaker\) 18%,#f6f4eb\)/);
 assert.match(css,/color-mix\(in srgb,var\(--speaker\) 48%,#142523\)/);
 assert.match(css,/prefers-reduced-motion:reduce\)\{\.bubble\.turn\.speaking \.avatar\{animation:none;box-shadow:0 0 0 3px #111,0 0 0 6px var\(--speaker,#f4f4f4\)\}/);
});
