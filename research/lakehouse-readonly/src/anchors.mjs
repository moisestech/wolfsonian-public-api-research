/** Frozen public-packet anchors — do not rewrite data/public/objects/*.json from here. */

export const FROZEN_ANCHORS = Object.freeze([
  {
    seedId: 'WOLF-001',
    accessionNumber: '86.17.1',
    titleFragment: 'Trylon and Perisphere',
  },
  {
    seedId: 'WOLF-002',
    accessionNumber: 'XX1990.1484',
    titleFragment: 'Sparton 558-C',
  },
  {
    seedId: 'WOLF-003',
    accessionNumber: 'XM1999.108.8',
    titleFragment: 'Machine Age Exposition',
  },
  {
    seedId: 'WOLF-004',
    accessionNumber: '85.7.383a,b',
    titleFragment: 'Mappemonde',
  },
]);

/**
 * Paths of interest once a live schema is observed.
 * Until then mark as UNKNOWN_SCHEMA / NOT_RETURNED — never invent values.
 */
export const WATCH_FIELDS = Object.freeze([
  'creators_with_roles',
  'exhibit_label',
  'exhibit_title',
  'field_subject',
  'has_ocr',
  'ocr_snippet',
  'source_system',
  'accession',
  'accession_number',
  'identifier',
  'title',
]);

/**
 * @param {unknown} raw
 * @param {string} path
 */
export function annotateField(raw, path) {
  if (raw == null || typeof raw !== 'object') {
    return { path, status: 'NOT_RETURNED', value: null };
  }
  if (!(path in /** @type {object} */ (raw))) {
    return { path, status: 'UNKNOWN_SCHEMA', value: null };
  }
  const value = /** @type {Record<string, unknown>} */ (raw)[path];
  if (value === null) return { path, status: 'NULL', value: null };
  if (value === undefined) return { path, status: 'NOT_RETURNED', value: null };
  return { path, status: 'PRESENT', value };
}
