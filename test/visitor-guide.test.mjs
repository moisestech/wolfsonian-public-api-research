import test from 'node:test';
import assert from 'node:assert/strict';
import { visitorGuide } from '../src/visitor-guide.mjs';

test('a saved catalog object names the shared tag without calling it a meeting', () => {
  const info = visitorGuide(
    { title: 'On Munitions: Skilled Work', accession: '85.4.64.34', source: 'lakehouse' },
    { target: 'TD1989.317.66', reasons: [{ family: 'theme', value: 'Women' }] },
    { visibleCount: 7 },
  );
  assert.equal(info.kind, 'SAVED CATALOG + STAFF TAGS');
  assert.equal(info.ctaLabel, 'Listen to this conversation');
  assert.match(info.line, /Women/);
  assert.match(info.line, /not proof that these objects met/);
  assert.equal(info.badge, '7 objects in this view');
});

test('an invented example stays labeled as fiction', () => {
  const info = visitorGuide({ title: 'Practice poster', accession: 'FICTION-01', source: 'invented' }, null);
  assert.equal(info.kind, 'FICTIONAL EXAMPLE');
  assert.equal(info.hasConnection, false);
  assert.match(info.subtitle, /not a Wolfsonian collection record/);
});
