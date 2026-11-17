/** Presentation objects already published with the demo. A shared tag is not a historical relationship. */
import { PRESENTATION_PAIRS } from './presentation-pairs.mjs';

const objects = new Map();

function add(accession, title, tag, family) {
  if (!accession) return;
  let object = objects.get(accession);
  if (!object) {
    object = {
      id: 'presentation-' + accession.replace(/[^A-Za-z0-9]+/g, '-'),
      accession,
      title: title || accession,
      creator: '',
      date: '',
      objectType: '',
      geography: '',
      style: '',
      themes: [],
      motifs: [],
    };
    objects.set(accession, object);
  }
  if (title) object.title = title;
  const list = family === 'theme' ? object.themes : object.motifs;
  if (tag && !list.includes(tag)) list.push(tag);
}

for (const pair of PRESENTATION_PAIRS) {
  add(pair.source, pair.sourceTitle, pair.tag, pair.family);
  add(pair.target, pair.targetTitle, pair.tag, pair.family);
}

export const MATRIX_OBJECTS = Object.freeze([...objects.values()]);
