import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBriefUrl,
  buildCitationUrl,
  buildMetadataUrl,
  buildSearchStatsUrl,
  buildSearchUrl,
  buildThumbnailUrl
} from '../src/wolfsonian-api.mjs';

test('builds documented search URL', () => {
  const url = buildSearchUrl({ query: 'vase', page: 2, field: 'ZZ' });
  assert.equal(url.origin, 'https://digital.wolfsonian.org');
  assert.equal(url.pathname, '/engine/search/results/json');
  assert.equal(url.searchParams.get('t'), 'vase');
  assert.equal(url.searchParams.get('p'), '2');
  assert.equal(url.searchParams.get('f'), 'ZZ');
});

test('builds documented item endpoints', () => {
  assert.equal(buildCitationUrl('WOLF037299').pathname, '/engine/items/citation/json/WOLF037299');
  assert.equal(buildBriefUrl('WOLF037299').pathname, '/engine/items/brief/json/WOLF037299');
  assert.equal(buildMetadataUrl('WOLF037299', 'mods').pathname, '/engine/items/xml/mods/WOLF037299');
});

test('builds stats URL', () => {
  const url = buildSearchStatsUrl({ query: '1913', field: 'DA' });
  assert.equal(url.pathname, '/engine/search/stats/json');
  assert.equal(url.searchParams.get('t'), '1913');
  assert.equal(url.searchParams.get('f'), 'DA');
});

test('builds thumbnail path from paired BibID', () => {
  const url = buildThumbnailUrl('WOLF061613', 'XC1992_837_1_001thm.jpg');
  assert.equal(url.pathname, '/content/WO/LF/06/16/13/00001/XC1992_837_1_001thm.jpg');
});
