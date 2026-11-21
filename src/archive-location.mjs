/** Shareable Archive Society visit. A screen names what is in front of the visitor.
 * The map neighborhood (subject + with) stays separate from a hall index (about).
 * A proposed pairing is a path id. Perspective and theme are omitted at their defaults.
 */

const SCREENS = new Set(['room', 'related', 'townhall', 'record']);

function clean(value){
  const text = String(value ?? '').trim();
  return text || null;
}

export function emptyVisit(){
  return {screen:'townhall', subject:null, with:null, path:null, about:null, record:null, lens:null, theme:null};
}

export function parseVisit(search=''){
  const params = new URLSearchParams(String(search).replace(/^\?/, ''));
  const requested = clean(params.get('screen'));
  const subject = clean(params.get('subject')) || clean(params.get('accession'));
  const path = clean(params.get('path'));
  const partner = path ? null : clean(params.get('with'));
  const lens = clean(params.get('lens'));
  const theme = clean(params.get('theme'));
  // Unaddressed visits begin with the whole field; object/path links retain their room.
  const screen = SCREENS.has(requested) ? requested : (subject || path || partner ? 'room' : 'townhall');
  return {
    screen,
    subject,
    with: partner,
    path,
    about: screen === 'related' ? clean(params.get('about')) : null,
    record: screen === 'record' ? (clean(params.get('record')) || subject) : null,
    lens: !lens || lens === 'family' ? null : lens,
    theme,
  };
}

export function serializeVisit(visit={}){
  const screen = SCREENS.has(visit.screen) ? visit.screen : 'room';
  const subject = clean(visit.subject);
  const path = clean(visit.path);
  const partner = path ? null : clean(visit.with);
  const about = screen === 'related' ? clean(visit.about) : null;
  const record = screen === 'record' ? (clean(visit.record) || subject) : null;
  const lens = clean(visit.lens);
  const theme = clean(visit.theme);
  const bareTownhall = screen === 'townhall' && !subject && !path && !partner && (!lens || lens === 'family') && !theme;
  if(bareTownhall) return '';
  const params = new URLSearchParams();
  params.set('screen', screen);
  if(subject) params.set('subject', subject);
  if(path) params.set('path', path);
  else if(partner) params.set('with', partner);
  if(about) params.set('about', about);
  if(record) params.set('record', record);
  if(lens && lens !== 'family') params.set('lens', lens);
  if(theme) params.set('theme', theme);
  return '?' + params.toString();
}
