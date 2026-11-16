/**
 * Artist-authored LOCAL browser speech casting. It does not generate dialog,
 * fetch remote voices, identify people, or imply historical testimony.
 * SpeechSynthesisVoice.localService must be true for all selected voices.
 */
const PROFILES = Object.freeze({
  objectA:   { pitch: .88, rate: .87, character: 'Measured object' },
  objectB:   { pitch: 1.13, rate: 1.03, character: 'Restless object' },
  archivist: { pitch: .96, rate: .84, character: 'Careful record keeper' },
  futurist:  { pitch: 1.12, rate: 1.05, character: 'Speculative futurist' },
  worker:    { pitch: .93, rate: .89, character: 'Reflective worker' },
  family:    { pitch: 1.03, rate: .94, character: 'Everyday reader' },
  tourist:   { pitch: 1.07, rate: 1.01, character: 'Curious traveler' },
  visitor:   { pitch: 1.03, rate: .98, character: 'First encounter' },
  limit:     { pitch: .90, rate: .84, character: 'Methodological caution' }
});
const ascii = value => String(value ?? '').trim().toLowerCase();
export function voiceRole(turn = {}) {
  const role = ascii(turn.role);
  if (role === 'objecta' || /object voice 01|voice 01/.test(role)) return 'objectA';
  if (role === 'objectb' || /object voice 02|voice 02/.test(role)) return 'objectB';
  if (role === 'archivist') return 'archivist';
  const name = ascii(turn.speaker || turn.actor);
  if (/archivist|archive|source steward/.test(name)) return 'archivist';
  if (/futurist|future/.test(name)) return 'futurist';
  if (/worker|labor/.test(name)) return 'worker';
  if (/family|home/.test(name)) return 'family';
  if (/tourist|travel/.test(name)) return 'tourist';
  if (/visitor|novice|first encounter/.test(name)) return 'visitor';
  if (/^limit$|caution|unresolved/.test(name)) return 'limit';
  if (/artist-authored interpretation/.test(role)) return 'visitor';
  return role === 'objecta' ? 'objectA' : role === 'objectb' ? 'objectB' : 'visitor';
}
function identity(voice) {
  return String(voice?.voiceURI || voice?.name || '').trim();
}
export function localEnglishVoices(availableVoices = []) {
  // Never substitute a remote voice just to make speech appear available.
  const unique = new Map();
  for (const v of Array.from(availableVoices || [])) {
    if (!v || v.localService !== true || !/^en(?:-|_|$)/i.test(String(v.lang || ''))) continue;
    const key = identity(v);
    if (key && !unique.has(key)) unique.set(key, v);
  }
  return [...unique.values()].sort((a, b) => identity(a).localeCompare(identity(b), 'en'));
}
function hashKey(value) {
  let valueHash = 2166136261;
  for (const char of String(value)) valueHash = Math.imul(valueHash ^ char.charCodeAt(0), 16777619);
  return valueHash >>> 0;
}
export function castLocalConversation(availableVoices, turns = []) {
  const pool = localEnglishVoices(availableVoices);
  const assigned = new Map();
  const used = new Set();
  const plan = (Array.isArray(turns) ? turns : []).map((turn, index) => {
    const role = voiceRole(turn);
    const profile = PROFILES[role] || PROFILES.visitor;
    const speaker = String(turn.speaker || turn.actor || role).trim();
    const key = role === 'objectA' || role === 'objectB' ? role + ':' + speaker : role + ':' + speaker;
    let chosen = assigned.get(key);
    if (!chosen && pool.length) {
      let slot = hashKey(key) % pool.length;
      // During a short conversation, prefer distinct installed voices.
      if (used.size < pool.length) {
        for (let tries = 0; tries < pool.length && used.has(identity(pool[slot])); tries++) {
          slot = (slot + 1) % pool.length;
        }
      }
      chosen = pool[slot];
      assigned.set(key, chosen);
      used.add(identity(chosen));
    }
    return Object.freeze({
      index,
      role,
      speaker,
      character: profile.character,
      voice: chosen || null,
      voiceName: chosen?.name || 'Not available',
      lang: chosen?.lang || 'en-US',
      pitch: profile.pitch,
      rate: profile.rate
    });
  });
  const distinct = new Set(plan.filter(x => x.voice).map(x => identity(x.voice))).size;
  return Object.freeze({
    available: pool.length > 0,
    installedLocalVoices: pool.length,
    distinctVoicesUsed: distinct,
    method: 'local_browser_synthesis',
    disclosure: pool.length === 0
      ? 'No installed local English speech voices. The written transcript remains available.'
      : distinct === 1
        ? 'One installed local voice; character pacing and pitch vary. No external speech service.'
        : distinct + ' distinct installed local voices. Character pacing and pitch are artist-authored.',
    turns: Object.freeze(plan)
  });
}
export async function waitForLocalEnglishVoices(synth, timeoutMs = 1000) {
  if (!synth || typeof synth.getVoices !== 'function') return [];
  const read = () => localEnglishVoices(synth.getVoices());
  let found = read();
  if (found.length) return found;
  return new Promise(resolve => {
    let done = false;
    let timer;
    function finish() {
      if (done) return;
      done = true;
      if (timer !== undefined) clearTimeout(timer);
      synth.removeEventListener?.('voiceschanged', check);
      resolve(read());
    }
    function check() { if (read().length) finish(); }
    synth.addEventListener?.('voiceschanged', check);
    timer = setTimeout(finish, Math.max(0, Math.min(2500, Number(timeoutMs) || 0)));
    check();
  });
}
