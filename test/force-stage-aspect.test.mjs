import test from 'node:test';
import assert from 'node:assert/strict';
import { fittedSize } from '../src/sprite-fit.mjs';

test('a node photograph fits a wide or tall picture inside one box', () => {
  assert.deepEqual(fittedSize({ userData: { aspect: 2 } }), [26, 13]);
  assert.deepEqual(fittedSize({ userData: { aspect: 0.5 } }), [13, 26]);
  assert.deepEqual(fittedSize({ userData: { aspect: 1 } }), [26, 26]);
  assert.deepEqual(fittedSize({}), [26, 26]);
});
