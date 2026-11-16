import { MATRIX_OBJECTS, LAYERS, layoutRoom, conversationFor, objectConversation, sharedTagLinks, conversationColor } from '/src/matrix-room.mjs';
import { focusedPairGraph } from '/src/force-graph-data.mjs';
import { applyLakehouseFields } from '/src/lakehouse-matches.mjs';
import { localImageUrl } from '/src/local-images.mjs';
import { mountForceStage } from '../force-stage.mjs';
import { castLocalConversation, waitForLocalEnglishVoices } from '/src/voice-cast.mjs';

const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
const state = { layer: 'theme', t: 0, scale: 1, fit: 1, panX: 0, panY: 0, room: null, selected: null, objects: MATRIX_OBJECTS };
let playback = 0, currentAudio = null, cancelDevice = null;

const svg = (tag, attrs) => {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
};

function glyph(key, color) {
  const g = svg('g', { fill: 'none', stroke: color, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const add = (tag, attrs) => g.append(svg(tag, attrs));
  if (key === 'plane') add('path', { d: 'M4 28h44l12-8h8l-8 14 8 14h-8l-12-8H4l6-6z' });
  else if (key === 'ship') { add('path', { d: 'M8 30h40l-6 16H16z' }); add('path', { d: 'M30 30V12h14l-8 18' }); }
  else if (key === 'building') { add('path', { d: 'M10 52V22L32 8l22 14v30' }); add('path', { d: 'M24 52V36h16v16M18 28h6M40 28h6M18 38h6M40 38h6' }); }
  else if (key === 'person') { add('circle', { cx: 32, cy: 16, r: 7 }); add('path', { d: 'M16 54c2-14 10-18 16-18s14 4 16 18' }); }
  else if (key === 'train') { add('rect', { x: 8, y: 20, width: 48, height: 22, rx: 4 }); add('path', { d: 'M16 42v8M48 42v8M8 32h48M20 26h8' }); }
  else if (key === 'hand') add('path', { d: 'M20 40V18m8 20V12m8 24V16m8 22V22c8 8 8 20 0 28H24c-8-4-8-12-4-20z' });
  else if (key === 'bulb') { add('circle', { cx: 32, cy: 24, r: 12 }); add('path', { d: 'M24 36h16l-2 12h-12zM26 24h12' }); }
  else if (key === 'animal') add('path', { d: 'M12 40c8-18 32-18 40 0-8 4-14 2-20 2s-12 2-20-2zM18 28c0-8 6-12 10-8M44 22c6-2 10 4 8 10' });
  else if (key === 'map') { add('circle', { cx: 32, cy: 32, r: 18 }); add('path', { d: 'M32 14v36M14 32h36M20 22c8 4 16 4 24 0M20 42c8-4 16-4 24 0' }); }
  else if (key === 'gear') { add('circle', { cx: 32, cy: 32, r: 8 }); add('path', { d: 'M32 12v8M32 44v8M12 32h8M44 32h8M18 18l6 6M40 40l6 6M46 18l-6 6M24 40l-6 6' }); }
  else if (key === 'flag') { add('path', { d: 'M16 52V12h28l-6 8 6 8H16' }); }
  else if (key === 'car') { add('path', { d: 'M10 36h44l-4 10H14z' }); add('path', { d: 'M18 36l6-12h16l6 12' }); add('circle', { cx: 20, cy: 48, r: 4 }); add('circle', { cx: 46, cy: 48, r: 4 }); }
  else if (key === 'weapon') add('path', { d: 'M12 52L40 16m0 0h12M40 16v12M18 34l8 8' });
  else if (key === 'photo') { add('rect', { x: 10, y: 14, width: 44, height: 36, rx: 3 }); add('circle', { cx: 32, cy: 30, r: 7 }); add('path', { d: 'M14 44l12-10 8 6 8-8 8 12' }); }
  else if (key === 'drawing') { add('path', { d: 'M14 50l28-36 8 6L24 54z' }); add('path', { d: 'M38 16l8 6' }); }
  else if (key === 'print') { add('rect', { x: 14, y: 12, width: 36, height: 40, rx: 2 }); add('path', { d: 'M20 22h24M20 30h24M20 38h16' }); }
  else { add('rect', { x: 16, y: 8, width: 32, height: 48, rx: 2 }); add('path', { d: 'M22 20h20M22 28h20M22 36h12' }); }
  return g;
}

function plate(key, color) {
  const holder = document.createElement('div');
  holder.className = 'plate';
  holder.style.border = '2px solid ' + color;
  const icon = document.createElementNS(ns, 'svg');
  icon.setAttribute('viewBox', '0 0 64 64');
  icon.append(glyph(key, color));
  holder.append(icon);
  return holder;
}

function setZoom(t) {
  state.t = Math.min(100, Math.max(0, t));
  graph.setZoomT(state.t);
  $('zoom').value = String(Math.round(state.t));
  for (const button of document.querySelectorAll('[data-stop]')) button.classList.toggle('on', Number(button.dataset.stop) === Math.round(state.t));
}

function stopTalk() {
  playback++;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  window.speechSynthesis?.cancel();
  cancelDevice?.();
  cancelDevice = null;
  document.querySelectorAll('#card .turn.speaking').forEach(el => el.classList.remove('speaking'));
  document.querySelector('#voice-controls')?.classList.remove('playing');
  graph.setSpeaking('');
}

function showCard() {
  stopTalk();
  const card = $('card');
  const selected = state.selected;
  if (!selected) { card.hidden = true; card.replaceChildren(); return; }
  card.hidden = false;
  card.replaceChildren();
  const head = document.createElement('header');
  const shot = selected.kind === 'object' ? localImageUrl(selected.accession) : '';
  if (shot) {
    const img = document.createElement('img');
    img.className = 'photo';
    img.alt = 'Locally supplied image matched to ' + selected.accession;
    img.src = shot;
    head.append(img);
  } else if (selected.kind === 'object') head.append(plate(selected.glyph, selected.color));
  const copy = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = selected.kind === 'object' ? selected.title : selected.label;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = selected.kind === 'object'
    ? [selected.accession, selected.creator, selected.date].filter(Boolean).join(' · ')
    : selected.count + ' objects · ' + state.room.layer.label;
  copy.append(title, meta);
  head.append(copy);
  card.append(head);
  const talk = selected.kind === 'object' ? objectConversation(state.objects, selected.accession) : null;
  if (talk) {
    const linkColor = conversationColor(talk.evidence[0].value);
    const pair = document.createElement('p');
    pair.className = 'pair';
    pair.style.borderLeft = '4px solid ' + linkColor;
    pair.textContent = talk.turns[0].speaker + ' and ' + talk.turns[1].speaker + ' share ' + talk.evidence[0].value;
    card.append(pair);
    const sideColor = ['#2f6fed', '#e07a2f', linkColor];
    for (const [index, turn] of talk.turns.entries()) {
      const line = document.createElement('p');
      line.className = 'turn side-' + ['a', 'b', 'guide'][index];
      line.style.borderLeft = '4px solid ' + sideColor[index];
      const who = document.createElement('b');
      who.textContent = turn.speaker;
      line.append(who, document.createTextNode(' ' + turn.text));
      card.append(line);
    }
    const note = document.createElement('p');
    note.className = 'hint';
    note.textContent = 'A shared tag is not a historical relationship.';
    const bar = document.createElement('div');
    bar.id = 'voice-controls';
    bar.className = 'audio-bar';
    const listen = document.createElement('button');
    listen.id = 'play';
    listen.className = 'play-round';
    listen.type = 'button';
    listen.setAttribute('aria-label', 'Play this conversation');
    listen.textContent = '▶';
    const bars = document.createElement('span');
    bars.className = 'bars';
    bars.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 12; i++) bars.append(document.createElement('i'));
    const elapsed = document.createElement('span');
    elapsed.id = 'audio-elapsed';
    elapsed.textContent = 'Turn 1 of 3';
    const halt = document.createElement('button');
    halt.id = 'stop';
    halt.type = 'button';
    halt.textContent = 'Stop';
    bar.append(listen, bars, elapsed, halt);
    const controls = document.createElement('div');
    controls.className = 'voice';
    const approve = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.id = 'voice-approved';
    approve.append(box, document.createTextNode(' I have approval to send these displayed words to ElevenLabs.'));
    const status = document.createElement('p');
    status.id = 'voice-status';
    status.className = 'hint';
    status.textContent = 'Written transcript. Device voice unless ElevenLabs is enabled.';
    listen.addEventListener('click', () => speak(talk));
    halt.addEventListener('click', () => { stopTalk(); status.textContent = 'Playback stopped.'; });
    controls.append(bar, approve, status);
    card.append(note, controls);
    return;
  }
  const subject = selected.kind === 'object'
    ? { accession: selected.accession, concepts: selected.values }
    : { count: selected.count, concepts: [selected.label] };
  for (const thread of conversationFor(subject, state.layer)) {
    const block = document.createElement('section');
    block.className = 'thread';
    const label = document.createElement('h3');
    label.style.background = '#111';
    label.textContent = thread.layer + ' · ' + thread.concept;
    block.append(label);
    for (const turn of thread.turns) {
      const line = document.createElement('p');
      line.className = 'turn';
      const who = document.createElement('b');
      who.textContent = turn.speaker;
      line.append(who, document.createTextNode(turn.text));
      block.append(line);
    }
    card.append(block);
  }
}

async function speak(conversation) {
  stopTalk();
  const session = playback;
  const approved = $('voice-approved')?.checked;
  const token = sessionStorage.getItem('archive-demo-token') || '';
  const status = $('voice-status');
  let aside = approved && !token ? 'Enter the demo token on the conversational atlas. Using the device voice.' : '';
  let localCast = null;
  try {
    for (const [i, turn] of conversation.turns.entries()) {
      if (session !== playback) return;
      document.querySelectorAll('#card .turn').forEach((el, index) => el.classList.toggle('speaking', index === i));
      document.querySelector('#voice-controls')?.classList.add('playing');
      const elapsed = $('audio-elapsed');
      if (elapsed) elapsed.textContent = 'Turn ' + (i + 1) + ' of ' + conversation.turns.length;
      graph.setSpeaking(turn.role === 'objectA' ? conversation.source : turn.role === 'objectB' ? conversation.target : '');
      if (status) status.textContent = ['Speaking ' + (i + 1) + ' of ' + conversation.turns.length + ' · ' + turn.speaker, aside].filter(Boolean).join(' ');
      let played = false;
      if (approved && token) {
        const response = await fetch('/api/archive-society/voice', {
          method: 'POST',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ text: turn.text, role: turn.role, confirmed: true }),
        });
        if (!response.ok && !aside) {
          let detail = 'ElevenLabs is not available.';
          try { detail = (await response.json()).message || detail; } catch { /* Keep the short fallback. */ }
          aside = detail + ' Using the device voice.';
          if (status) status.textContent = ['Speaking ' + (i + 1) + ' of ' + conversation.turns.length + ' · ' + turn.speaker, aside].join(' ');
        }
        if (response.ok) {
          const url = URL.createObjectURL(await response.blob());
          try {
            if (session !== playback) return;
            const audio = new Audio(url);
            currentAudio = audio;
            await new Promise((resolve, reject) => {
              audio.onended = resolve;
              audio.onerror = () => reject(new Error('Audio playback unavailable.'));
              audio.play().catch(reject);
            });
            played = true;
          } finally {
            URL.revokeObjectURL(url);
            currentAudio = null;
          }
        }
      }
      if (!played) {
        if (!localCast) localCast = castLocalConversation(
          await waitForLocalEnglishVoices(window.speechSynthesis), conversation.turns);
        if (!localCast.available) throw new Error(localCast.disclosure);
        const cast = localCast.turns[i];
        if (status) status.textContent = 'Speaking ' + (i + 1) + ' of ' + conversation.turns.length +
          ' · ' + turn.speaker + ' · ' + cast.voiceName +
          (localCast.distinctVoicesUsed === 1 ? ' · one local voice with varied pacing' : '');
        await new Promise((resolve, reject) => {
          if (!window.speechSynthesis) { reject(new Error('No device speech service. The written transcript remains available.')); return; }
          cancelDevice = resolve;
          const utterance = new SpeechSynthesisUtterance(turn.text);
          utterance.voice = cast.voice;
          utterance.lang = cast.lang;
          utterance.rate = cast.rate;
          utterance.pitch = cast.pitch;
          utterance.onend = () => { cancelDevice = null; resolve(); };
          utterance.onerror = () => { cancelDevice = null; reject(new Error('Device speech stopped or unavailable.')); };
          window.speechSynthesis.speak(utterance);
        });
      }
    }
    if (session === playback && status) status.textContent = 'Finished. This was a scripted interpretation, not historical testimony.';
  } catch (error) {
    if (session === playback && status) status.textContent = error.message;
  } finally {
    if (session === playback) {
      document.querySelectorAll('#card .turn.speaking').forEach(el => el.classList.remove('speaking'));
      document.querySelector('#voice-controls')?.classList.remove('playing');
      graph.setSpeaking('');
    }
  }
}

function selectObject(node) {
  state.selected = { kind: 'object', ...node };
  render();
}

function render() {
  const room = state.room;
  const selected = state.selected?.kind === 'object' ? state.selected : null;
  const talk = selected ? objectConversation(state.objects, selected.accession) : null;
  const seen = new Set();
  const nodes = [];
  for (const node of room.nodes) {
    if (!node.accession || seen.has(node.accession)) continue;
    seen.add(node.accession);
    nodes.push({
      id: node.accession,
      label: node.title,
      image: localImageUrl(node.accession),
      color: node.color,
      neighbor: Boolean(talk && node.accession === talk.target),
    });
  }
  const links = selected ? sharedTagLinks(state.objects, selected.accession, 6).map(link => ({ ...link, color: conversationColor(link.label || 'shared') })) : [];
  const built = talk ? focusedPairGraph(nodes, links, talk.source, talk.target) : focusedPairGraph(nodes, links);
  graph.setGraph(built.nodes, built.links);
  if (talk) graph.focusPair(talk.source, talk.target);
  paintLegend();
  showCard();
}

function paintLegend() {
  const bar = $('legend');
  bar.replaceChildren();
  for (const district of state.room.districts) {
    const item = document.createElement('span');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = district.color;
    item.append(swatch, document.createTextNode(district.label));
    bar.append(item);
  }
}

function load(layer) {
  state.layer = layer;
  state.selected = null;
  state.room = layoutRoom(state.objects, layer);
  for (const button of document.querySelectorAll('[data-layer]')) button.setAttribute('aria-checked', String(button.dataset.layer === layer));
  $('count').textContent = state.room.nodes.length + ' · ' + state.room.layer.label;
  graph.setSpeaking('');
  setZoom(0);
  render();
}

const graph = mountForceStage($('stage'), {
  background: '#f3f3f3',
  linkFocus: '#111111',
  linkIdle: '#bdbdbd',
  onSelect(id) {
    const node = state.room?.nodes.find(item => item.accession === id);
    if (node) selectObject(node);
  },
});
$('zoom').addEventListener('input', () => setZoom(Number($('zoom').value)));
for (const button of document.querySelectorAll('[data-stop]')) button.addEventListener('click', () => setZoom(Number(button.dataset.stop)));
for (const button of document.querySelectorAll('[data-layer]')) button.addEventListener('click', () => load(button.dataset.layer));

try {
  const response = await fetch('/data/lakehouse/project-matches.json');
  if (response.ok) state.objects = applyLakehouseFields(MATRIX_OBJECTS, await response.json());
} catch { /* Unmatched matrix records stay in the room. */ }
load('theme');
