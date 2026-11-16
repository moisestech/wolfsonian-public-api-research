import { MATRIX_OBJECTS, LAYERS, layoutRoom, linksFor, conversationFor, zoomScale, detailFor } from '/src/matrix-room.mjs';

const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
const state = { layer: 'theme', t: 0, scale: 1, fit: 1, panX: 0, panY: 0, room: null, selected: null };

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

function worldPoint(clientX, clientY) {
  const rect = $('map').getBoundingClientRect();
  const vx = ((clientX - rect.left) / rect.width) * 1600;
  const vy = ((clientY - rect.top) / rect.height) * 900;
  return [800 + (vx - 800 - state.panX) / state.scale, 450 + (vy - 450 - state.panY) / state.scale];
}

function frame(x, y, t) {
  state.t = t;
  state.scale = zoomScale(t, state.fit);
  state.panX = -(x - 800) * state.scale;
  state.panY = -(y - 450) * state.scale;
  syncZoom();
}

function setZoom(t) {
  const prev = state.scale || state.fit;
  const wx = 800 - state.panX / prev;
  const wy = 450 - state.panY / prev;
  state.t = Math.min(100, Math.max(0, t));
  state.scale = zoomScale(state.t, state.fit);
  state.panX = -(wx - 800) * state.scale;
  state.panY = -(wy - 450) * state.scale;
  syncZoom();
}

function syncZoom() {
  $('zoom').value = String(Math.round(state.t));
  const detail = detailFor(state.scale, state.fit);
  $('map').dataset.detail = detail;
  for (const button of document.querySelectorAll('[data-stop]')) button.classList.toggle('on', Number(button.dataset.stop) === Math.round(state.t));
  applyCamera();
  paintMini();
}

function applyCamera() {
  const camera = document.querySelector('#map .camera');
  if (camera) camera.setAttribute('transform', 'translate(' + state.panX + ' ' + state.panY + ') translate(800 450) scale(' + state.scale + ') translate(-800 -450)');
}

function paintMini() {
  const mini = $('mini');
  const { bounds } = state.room;
  mini.setAttribute('viewBox', bounds.minX + ' ' + bounds.minY + ' ' + bounds.maxX + ' ' + bounds.maxY);
  mini.replaceChildren();
  for (const district of state.room.districts) mini.append(svg('rect', { x: district.x, y: district.y, width: district.w, height: district.h, fill: district.color, opacity: 0.85 }));
  const wx = 800 - state.panX / state.scale;
  const wy = 450 - state.panY / state.scale;
  mini.append(svg('rect', { class: 'viewport', x: wx - 800 / state.scale, y: wy - 450 / state.scale, width: 1600 / state.scale, height: 900 / state.scale }));
  const arm = Math.max(bounds.maxX, bounds.maxY) * 0.025;
  mini.append(svg('path', { d: 'M ' + (wx - arm) + ' ' + wy + ' H ' + (wx + arm) + ' M ' + wx + ' ' + (wy - arm) + ' V ' + (wy + arm), fill: 'none', stroke: '#142523', 'stroke-width': arm / 5 }));
}

function showCard() {
  const card = $('card');
  const selected = state.selected;
  if (!selected) { card.hidden = true; card.replaceChildren(); return; }
  card.hidden = false;
  card.replaceChildren();
  const head = document.createElement('header');
  if (selected.kind === 'object') head.append(plate(selected.glyph, selected.color));
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
  const subject = selected.kind === 'object'
    ? { accession: selected.accession, concepts: selected.values }
    : { count: selected.count, concepts: [selected.label] };
  for (const thread of conversationFor(subject, state.layer)) {
    const block = document.createElement('section');
    block.className = 'thread';
    const label = document.createElement('h3');
    label.style.background = thread.color;
    label.textContent = thread.layer + ' · ' + thread.concept;
    block.append(label);
    for (const turn of thread.turns) {
      const line = document.createElement('p');
      line.className = 'turn';
      line.style.setProperty('--voice', turn.color);
      const who = document.createElement('b');
      who.textContent = turn.speaker;
      line.append(who, document.createTextNode(turn.text));
      block.append(line);
    }
    card.append(block);
  }
}

function selectDistrict(district) {
  state.selected = { kind: 'district', ...district };
  frame(district.x + district.w / 2, district.y + district.h / 2, Math.max(state.t, 34));
  render();
}

function selectObject(node) {
  state.selected = { kind: 'object', ...node };
  frame(node.x, node.y, Math.max(state.t, 67));
  render();
}

function render() {
  const room = state.room;
  const map = $('map');
  map.replaceChildren();
  const camera = svg('g', { class: 'camera' });
  const selectedDistrict = state.selected?.kind === 'district' ? state.selected.label : state.selected?.primary;
  for (const district of room.districts) {
    const on = district.label === selectedDistrict;
    const group = svg('g', { class: 'district', role: 'button', tabindex: 0, 'aria-label': district.label + ', ' + district.count });
    group.append(svg('rect', { class: 'territory' + (on ? ' on' : ''), x: district.x, y: district.y, width: district.w, height: district.h, rx: 18, fill: district.color, 'fill-opacity': on ? 0.28 : 0.14, stroke: district.color }));
    const worldLabel = svg('text', { class: 'dlabel dlabel-world', x: district.x + district.w / 2, y: district.y + district.h / 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: district.color, stroke: '#f4f7f2', 'stroke-width': 8, 'paint-order': 'stroke', 'font-size': Math.max(28, Math.min(district.w / 9, 150)) });
    worldLabel.textContent = district.label;
    const nearLabel = svg('text', { class: 'dlabel dlabel-near', x: district.x + 18, y: district.y + 34, fill: district.color, 'font-size': 22 });
    nearLabel.textContent = district.label + ' · ' + district.count;
    group.append(worldLabel, nearLabel);
    const open = () => selectDistrict(district);
    group.addEventListener('click', event => { event.stopPropagation(); open(); });
    group.addEventListener('keydown', event => { if (event.key === 'Enter') open(); });
    camera.append(group);
  }
  if (state.selected?.kind === 'object') {
    for (const link of linksFor(state.selected, room)) {
      camera.append(svg('line', { class: 'link', x1: state.selected.x, y1: state.selected.y, x2: link.x, y2: link.y, stroke: link.color }));
    }
  }
  for (const node of room.nodes) {
    const on = state.selected?.id === node.id;
    const group = svg('g', { class: 'node' + (on ? ' on' : ''), role: 'button', tabindex: 0, 'aria-label': node.title });
    group.append(svg('circle', { class: 'node-dot', cx: node.x, cy: node.y, r: 7, fill: node.color }));
    const card = svg('g', { class: 'node-card', transform: 'translate(' + (node.x - 56) + ' ' + (node.y - 54) + ')' });
    card.append(svg('rect', { class: 'card', width: 112, height: 112, rx: 8, stroke: node.color }));
    const icon = svg('g', { transform: 'translate(24 4) scale(0.9)' });
    icon.append(glyph(node.glyph, node.color));
    card.append(icon);
    const acc = svg('text', { class: 'acc', x: 56, y: 78, 'text-anchor': 'middle' });
    acc.textContent = node.accession;
    const title = svg('text', { class: 'title', x: 56, y: 94, 'text-anchor': 'middle' });
    const lines = [];
    let line = '';
    for (const word of node.title.split(' ')) {
      const next = line ? line + ' ' + word : word;
      if (next.length <= 16) line = next;
      else {
        if (line) lines.push(line);
        line = word.slice(0, 16);
        if (lines.length === 2) break;
      }
    }
    if (line && lines.length < 2) lines.push(line);
    lines.filter(Boolean).forEach((line, index) => {
      const row = svg('tspan', { x: 56, dy: index === 0 ? 0 : 12 });
      row.textContent = line;
      title.append(row);
    });
    card.append(acc, title);
    group.append(card);
    const open = () => selectObject(node);
    group.addEventListener('click', event => { event.stopPropagation(); open(); });
    group.addEventListener('keydown', event => { if (event.key === 'Enter') open(); });
    camera.append(group);
  }
  map.append(camera);
  applyCamera();
  paintLegend();
  showCard();
  paintMini();
}

function paintLegend() {
  const bar = $('legend');
  bar.replaceChildren();
  for (const district of state.room.districts) {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.toggle('on', state.selected?.label === district.label || state.selected?.primary === district.label);
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = district.color;
    button.append(swatch, document.createTextNode(district.label));
    button.addEventListener('click', () => selectDistrict(district));
    bar.append(button);
  }
}

function load(layer) {
  state.layer = layer;
  state.selected = null;
  state.room = layoutRoom(MATRIX_OBJECTS, layer);
  const { bounds } = state.room;
  const fit = Math.min(1600 / bounds.maxX, 900 / bounds.maxY);
  state.fit = fit;
  for (const button of document.querySelectorAll('[data-layer]')) button.setAttribute('aria-checked', String(button.dataset.layer === layer));
  $('count').textContent = state.room.nodes.length + ' · ' + state.room.layer.label;
  frame((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2, 0);
  render();
}

const stage = $('map');
let drag = null;
let dragged = false;
stage.addEventListener('pointerdown', event => {
  if (event.target.closest('.node,.district')) return;
  dragged = false;
  drag = { x: event.clientX, y: event.clientY, px: state.panX, py: state.panY };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!drag) return;
  if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 4) dragged = true;
  const rect = stage.getBoundingClientRect();
  state.panX = drag.px + (event.clientX - drag.x) * (1600 / rect.width);
  state.panY = drag.py + (event.clientY - drag.y) * (900 / rect.height);
  applyCamera();
  paintMini();
});
stage.addEventListener('pointerup', () => { drag = null; });
stage.addEventListener('pointercancel', () => { drag = null; });
stage.addEventListener('click', () => { if (dragged) return; state.selected = null; render(); });
stage.addEventListener('wheel', event => {
  event.preventDefault();
  setZoom(state.t + (event.deltaY < 0 ? 4 : -4));
}, { passive: false });
$('zoom').addEventListener('input', () => setZoom(Number($('zoom').value)));
for (const button of document.querySelectorAll('[data-stop]')) button.addEventListener('click', () => setZoom(Number(button.dataset.stop)));
for (const button of document.querySelectorAll('[data-layer]')) button.addEventListener('click', () => load(button.dataset.layer));
$('mini').addEventListener('click', event => {
  const rect = $('mini').getBoundingClientRect();
  const { bounds } = state.room;
  const x = bounds.minX + ((event.clientX - rect.left) / rect.width) * bounds.maxX;
  const y = bounds.minY + ((event.clientY - rect.top) / rect.height) * bounds.maxY;
  frame(x, y, state.t);
  render();
});

load('theme');
