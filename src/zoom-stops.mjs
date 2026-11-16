/** Four ways of looking at the same conversation. */

export const ZOOM_STOPS = Object.freeze([
  { id: 'world', label: 'Field', t: 0, note: 'The whole set' },
  { id: 'region', label: 'Group', t: 34, note: 'Objects in this conversation' },
  { id: 'street', label: 'Pair', t: 67, note: 'The two objects talking' },
  { id: 'object', label: 'Object', t: 100, note: 'This photograph' },
]);

export function nearestZoomStop(t) {
  const value = Math.min(100, Math.max(0, Number(t) || 0));
  return ZOOM_STOPS.reduce((best, stop) => Math.abs(stop.t - value) < Math.abs(best.t - value) ? stop : best);
}
