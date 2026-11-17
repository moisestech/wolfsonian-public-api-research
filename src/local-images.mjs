import { LOCAL_IMAGE_FILES } from './local-image-index.mjs';

const ALIASES = Object.freeze({
  'XX1990. 3722': 'XX1990.3722.jpg',
});

export const CLOUDINARY_CLOUD = 'dck5rzi4h';

export function objectImagePublicId(file) {
  const stem = file.replace(/\.jpe?g$/i, '').replace(/[^A-Za-z0-9._-]+/g, '_');
  return 'archive-dreams/object-images/' + stem;
}

export function localImageUrl(accession) {
  const file = ALIASES[accession] || LOCAL_IMAGE_FILES[accession] || '';
  if (!file || file.includes('/') || file.includes('\\') || file.startsWith('.')) return '';
  if (!CLOUDINARY_CLOUD) return '/data/object-images/' + encodeURIComponent(file);
  return 'https://res.cloudinary.com/' + CLOUDINARY_CLOUD + '/image/upload/' + objectImagePublicId(file) + '.jpg';
}
