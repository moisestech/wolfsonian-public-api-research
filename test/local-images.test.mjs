import test from 'node:test';
import assert from 'node:assert/strict';
import { localImageUrl } from '../src/local-images.mjs';
import { objectImageName } from '../scripts/serve-archive-society.mjs';

test('local images map known files, the space alias, and leave gaps empty', () => {
  assert.equal(localImageUrl('2009.5.1'), 'https://res.cloudinary.com/dck5rzi4h/image/upload/archive-dreams/object-images/2009.5.1.jpg');
  assert.equal(localImageUrl('TD1997.17.2 LTL'), 'https://res.cloudinary.com/dck5rzi4h/image/upload/archive-dreams/object-images/TD1997.17.2_LTL.jpg');
  assert.equal(localImageUrl('XX1990. 3722'), 'https://res.cloudinary.com/dck5rzi4h/image/upload/archive-dreams/object-images/XX1990.3722.jpg');
  assert.equal(localImageUrl('WFIU–72'), '');
  assert.equal(localImageUrl(''), '');
});

test('object image paths stay inside the image folder', () => {
  assert.equal(objectImageName('/data/object-images/2009.5.1.jpg'), '2009.5.1.jpg');
  assert.equal(objectImageName('/data/object-images/TD1997.17.2 LTL.jpg'), 'TD1997.17.2 LTL.jpg');
  assert.equal(objectImageName('/data/object-images/../server/archive-services.mjs'), '');
  assert.equal(objectImageName('/data/object-images/.env'), '');
  assert.equal(objectImageName('/demo/archive-society/'), '');
});
