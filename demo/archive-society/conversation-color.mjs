// Shared-category hues for the public rooms. Machines is blue.
// Comma hsl so the graph renderer and the conversation CSS read the same color.
const CATEGORY_HUE = {
  Machines: 220,
  Technology: 188,
  Water: 158,
  Trees: 128,
  Labor: 96,
  Factories: 64,
  Flags: 32,
  Women: 350,
  'Political symbols': 318,
  'Mythological figures': 278,
  'War / Military': 248,
};

const RESERVED_HUES = Object.values(CATEGORY_HUE);

// The fictional research voice. A stone, not an object and not a category.
export const ARCHIVIST_COLOR = '#d7c4a3';

function hashHue(label) {
  let hash = 2166136261;
  for (const char of String(label)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0) % 360;
}

function hueDistance(a, b) {
  const delta = Math.abs(a - b) % 360;
  return Math.min(delta, 360 - delta);
}

function reservedDistance(hue) {
  return Math.min(...RESERVED_HUES.map(item => hueDistance(hue, item)));
}

export function categoryHue(label) {
  if (Object.prototype.hasOwnProperty.call(CATEGORY_HUE, label)) return CATEGORY_HUE[label];
  const start = hashHue(label);
  // Named hues are about 30° apart, so a 24° berth is not always possible.
  // A crowded hash moves toward the nearest open gap and keeps its own place on the wheel.
  if (reservedDistance(start) >= 24) return start;
  let best = start;
  let bestScore = reservedDistance(start) * 8;
  for (let step = 1; step < 180; step++) {
    for (const hue of [(start + step) % 360, (start - step + 360) % 360]) {
      const score = reservedDistance(hue) * 8 - step;
      if (score > bestScore) {
        best = hue;
        bestScore = score;
      }
    }
  }
  return best;
}

export function tagColor(label) {
  return 'hsl(' + categoryHue(label) + ', 68%, 52%)';
}

export function colorHue(color) {
  const hsl = String(color).match(/hsl\(\s*([\d.]+)/);
  if (hsl) return Number(hsl[1]);
  const hex = String(color).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return 0;
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (!delta) return 0;
  let hue;
  if (max === red) hue = ((green - blue) / delta) % 6;
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return Math.round((hue * 60 + 360) % 360);
}

export function speakerColor(key, roomHue, used) {
  let hue = hashHue(key);
  const clash = candidate => hueDistance(candidate, roomHue) < 28 || used.some(item => hueDistance(candidate, item) < 28);
  for (let step = 0; clash(hue) && step < 8; step++) hue = (hue + 37) % 360;
  used.push(hue);
  return 'hsl(' + hue + ', 62%, 64%)';
}

export function voiceColors(sourceAccession, targetAccession, linkColor) {
  const roomHue = colorHue(linkColor);
  const used = [];
  return {
    objectA: speakerColor(sourceAccession, roomHue, used),
    objectB: speakerColor(targetAccession, roomHue, used),
    archivist: ARCHIVIST_COLOR,
  };
}
