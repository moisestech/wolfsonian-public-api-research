import test from 'node:test';
import assert from 'node:assert/strict';
import { fittedSize, frameBars } from '../src/sprite-fit.mjs';

test('a node photograph fits a wide or tall picture inside one box', () => {
  assert.deepEqual(fittedSize({ userData: { aspect: 2 } }), [26, 13]);
  assert.deepEqual(fittedSize({ userData: { aspect: 0.5 } }), [13, 26]);
  assert.deepEqual(fittedSize({ userData: { aspect: 1 } }), [26, 26]);
  assert.deepEqual(fittedSize({}), [26, 26]);
});

test('a node frame is a rectangle around the photograph', () => {
  const wide = frameBars(26, 13, { focused: true });
  const tall = frameBars(13, 26, { focused: true });
  assert.equal(wide.length, 4);
  assert.ok(wide[0].w > wide[2].h);
  assert.ok(tall[2].h > tall[0].w);
  assert.equal(wide[0].h, tall[0].h);
});
