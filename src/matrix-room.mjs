/** One matrix column at a time. A shared tag is a path, not a history. */

import { MATRIX_OBJECTS } from './matrix-objects.mjs';

export { MATRIX_OBJECTS };

export const LAYERS = Object.freeze([
  { id: 'geography', label: 'Place', field: 'geography' },
  { id: 'objectType', label: 'Type', field: 'objectType' },
  { id: 'style', label: 'Look', field: 'style' },
  { id: 'theme', label: 'Theme', field: 'themes' },
  { id: 'motif', label: 'Symbol', field: 'motifs' },
]);

export const ZOOM_STOPS = Object.freeze([
  { id: 'world', label: 'World', t: 0 },
  { id: 'region', label: 'Region', t: 34 },
  { id: 'street', label: 'Street', t: 67 },
  { id: 'object', label: 'Object', t: 100 },
]);

const READERS = {
  geography: ['Tourist', '#1F7A6B', name => `Is ${name} a place of making, or a place pictured?`],
  objectType: ['Visitor', '#3D5A80', name => `This group holds only what the matrix calls ${name}.`],
  style: ['Futurist', '#8A4E2A', name => `Is ${name} a way of drawing, or a promise?`],
  theme: ['Worker', '#8A6230', name => `Who is asked to work or want something under ${name}?`],
  motif: ['Family', '#8E3E4A', name => `${name} repeats as a sign. It does not say who lived with it.`],
};

const GLYPHS = {
  Aircraft: 'plane', Ships: 'ship', Buildings: 'building', Skyscrapers: 'building', Hotels: 'building',
  Workers: 'person', Women: 'person', Men: 'person', Soldiers: 'person', Children: 'person',
  Trains: 'train', Hands: 'hand', 'Light bulbs': 'bulb', Animals: 'animal', Birds: 'animal',
  'Maps / Globes': 'map', Gears: 'gear', Flags: 'flag', Cars: 'car', Weapons: 'weapon',
  Machines: 'gear', Factories: 'building',
};

export function layerById(id) {
  return LAYERS.find(layer => layer.id === id) || LAYERS[3];
}

export function valuesOf(object, layerId) {
  const field = layerById(layerId).field;
  const raw = object[field];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(value => String(value || '').trim()).filter(Boolean);
}

export function conceptColor(label) {
  let hash = 2166136261;
  for (const char of String(label)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const hue = (hash >>> 0) % 360;
  return `hsl(${hue} 52% 34%)`;
}

export function glyphKey(object) {
  const motif = object.motifs?.[0];
  if (GLYPHS[motif]) return GLYPHS[motif];
  if (/photo/i.test(object.objectType || '')) return 'photo';
  if (/draw|study|render/i.test(object.objectType || '')) return 'drawing';
  if (/print/i.test(object.objectType || '')) return 'print';
  return 'poster';
}

export function zoomScale(t, fit) {
  const u = Math.min(1, Math.max(0, Number(t) / 100));
  return fit * Math.pow(9, u);
}

export function detailFor(scale, fit) {
  const ratio = scale / Math.max(fit, 0.0001);
  if (ratio < 1.6) return 'world';
  if (ratio < 3.2) return 'region';
  if (ratio < 6.2) return 'street';
  return 'object';
}

export function layoutRoom(objects, layerId) {
  const groups = new Map();
  for (const object of objects) {
    const primary = valuesOf(object, layerId)[0] || 'Unlabeled';
    const list = groups.get(primary) || [];
    list.push(object);
    groups.set(primary, list);
  }
  const names = [...groups.keys()].sort((a, b) => groups.get(b).length - groups.get(a).length || a.localeCompare(b));
  const pitchX = 138;
  const pitchY = 122;
  const districts = [];
  const nodes = [];
  let cursorX = 80;
  let cursorY = 80;
  let rowHeight = 0;
  const wrap = 5200;
  for (const name of names) {
    const members = groups.get(name);
    const cols = Math.max(1, Math.ceil(Math.sqrt(members.length)));
    const rows = Math.ceil(members.length / cols);
    const w = 72 + cols * pitchX;
    const h = 78 + rows * pitchY;
    if (cursorX > 80 && cursorX + w > wrap) {
      cursorX = 80;
      cursorY += rowHeight + 150;
      rowHeight = 0;
    }
    const color = conceptColor(name);
    districts.push({
      id: 'concept:' + layerId + ':' + name,
      label: name,
      x: cursorX,
      y: cursorY,
      w,
      h,
      color,
      count: members.length,
    });
    members.forEach((object, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      nodes.push({
        id: object.id,
        accession: object.accession,
        title: object.title,
        creator: object.creator,
        date: object.date,
        x: cursorX + 48 + col * pitchX + 52,
        y: cursorY + 70 + row * pitchY + 48,
        primary: name,
        values: valuesOf(object, layerId),
        color,
        glyph: glyphKey(object),
      });
    });
    cursorX += w + 120;
    rowHeight = Math.max(rowHeight, h);
  }
  const maxX = Math.max(...districts.map(d => d.x + d.w), 0);
  const maxY = Math.max(...districts.map(d => d.y + d.h), 0);
  return {
    layer: layerById(layerId),
    districts,
    nodes,
    bounds: { minX: 0, minY: 0, maxX: maxX + 80, maxY: maxY + 80 },
  };
}

export function linksFor(object, room) {
  const byLabel = new Map(room.districts.map(d => [d.label, d]));
  return (object.values || []).map((value, index) => {
    const district = byLabel.get(value);
    return {
      concept: value,
      color: district?.color || conceptColor(value),
      primary: index === 0,
      x: district ? district.x + district.w / 2 : object.x,
      y: district ? district.y + 28 : object.y,
    };
  });
}

export function conversationFor(subject, layerId) {
  const layer = layerById(layerId);
  const [reader, readerColor, ask] = READERS[layer.id];
  const concepts = subject.concepts || [subject.primary || subject.label];
  return concepts.filter(Boolean).slice(0, 3).map(concept => ({
    concept,
    layer: layer.label,
    color: conceptColor(concept),
    turns: [
      { speaker: 'Archivist', color: '#245E86', text: `${subject.accession ? subject.accession + ' carries' : subject.count + ' objects share'} “${concept}”.` },
      { speaker: reader, color: readerColor, text: ask(concept) },
      { speaker: 'Limit', color: '#5C5348', text: 'Shared matrix tag. Not a documented meeting.' },
    ],
  }));
}

export function districtsOverlap(districts) {
  for (let i = 0; i < districts.length; i++) {
    for (let j = i + 1; j < districts.length; j++) {
      const a = districts[i];
      const b = districts[j];
      const separated = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
      if (!separated) return [a.label, b.label];
    }
  }
  return null;
}
