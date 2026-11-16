export const NODE_BOX = 26;

export function fittedSize(texture) {
  const aspect = texture?.userData?.aspect;
  if (!aspect || !Number.isFinite(aspect) || aspect <= 0) return [NODE_BOX, NODE_BOX];
  if (aspect >= 1) return [NODE_BOX, NODE_BOX / aspect];
  return [NODE_BOX * aspect, NODE_BOX];
}

export function frameBars(width, height, { focused = false, scale = 1 } = {}) {
  const pad = (focused ? 1.16 : 1.08) * scale;
  const w = width * pad;
  const h = height * pad;
  const stroke = (focused ? 1.45 : 0.85) * scale;
  return [
    { x: 0, y: h / 2, w: w + stroke, h: stroke },
    { x: 0, y: -h / 2, w: w + stroke, h: stroke },
    { x: -w / 2, y: 0, w: stroke, h: h + stroke },
    { x: w / 2, y: 0, w: stroke, h: h + stroke },
  ];
}
