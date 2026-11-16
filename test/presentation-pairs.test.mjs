import test from 'node:test';
import assert from 'node:assert/strict';
import { OPENING_ACCESSION, PRESENTATION_PAIRS, MISSING_PHOTOGRAPHS } from '../src/presentation-pairs.mjs';
import { localImageUrl } from '../src/local-images.mjs';

test('the opening pair is a photographed shared-tag conversation', () => {
  assert.equal(PRESENTATION_PAIRS[0].source, OPENING_ACCESSION);
  assert.equal(PRESENTATION_PAIRS[0].tag, 'Women');
  assert.ok(localImageUrl(PRESENTATION_PAIRS[0].source));
  assert.ok(localImageUrl(PRESENTATION_PAIRS[0].target));
  assert.equal(MISSING_PHOTOGRAPHS.length, 22);
  assert.ok(MISSING_PHOTOGRAPHS.some(item => item.accession === 'XX1990.2501'));
  assert.ok(MISSING_PHOTOGRAPHS.every(item => !localImageUrl(item.accession)));
});
