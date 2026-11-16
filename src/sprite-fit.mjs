export const NODE_BOX = 26;

export function fittedSize(texture) {
  const aspect = texture?.userData?.aspect;
  if (!aspect || !Number.isFinite(aspect) || aspect <= 0) return [NODE_BOX, NODE_BOX];
  if (aspect >= 1) return [NODE_BOX, NODE_BOX / aspect];
  return [NODE_BOX * aspect, NODE_BOX];
}
