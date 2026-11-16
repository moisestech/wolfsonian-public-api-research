import { LOCAL_IMAGE_FILES } from './local-image-index.mjs';

const ALIASES = Object.freeze({
  'XX1990. 3722': 'XX1990.3722.jpg',
});

export function localImageUrl(accession) {
  const file = ALIASES[accession] || LOCAL_IMAGE_FILES[accession] || '';
  if (!file || file.includes('/') || file.includes('\\') || file.startsWith('.')) return '';
  return '/data/object-images/' + encodeURIComponent(file);
}
