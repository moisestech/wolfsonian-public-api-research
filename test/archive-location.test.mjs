import test from 'node:test';
import assert from 'node:assert/strict';
import {parseVisit, serializeVisit} from '../src/archive-location.mjs';

test('a room names the subject and the other object', () => {
  const visit = {screen:'room', subject:'85.4.64.43', with:'TD1989.318.1', path:null, about:null, record:null, lens:null, theme:null};
  const text = serializeVisit(visit);
  assert.equal(text, '?screen=room&subject=85.4.64.43&with=TD1989.318.1');
  assert.deepEqual(parseVisit(text), visit);
});

test('a proposed pairing keeps its path and leaves the partner off the bar', () => {
  const text = serializeVisit({screen:'room', subject:'XM1999.108.8', with:'85.4.64.43', path:'catalogue-meets-engine', lens:'family', theme:''});
  assert.equal(text, '?screen=room&subject=XM1999.108.8&path=catalogue-meets-engine');
  const parsed = parseVisit(text);
  assert.equal(parsed.path, 'catalogue-meets-engine');
  assert.equal(parsed.with, null);
  assert.equal(parsed.lens, null);
  assert.equal(parsed.theme, null);
});

test('other conversations keep the map neighborhood and name the hall subject', () => {
  const text = '?screen=related&subject=85.4.64.43&with=TD1989.318.1&about=XX1990.4091';
  const visit = parseVisit(text);
  assert.equal(visit.screen, 'related');
  assert.equal(visit.subject, '85.4.64.43');
  assert.equal(visit.with, 'TD1989.318.1');
  assert.equal(visit.about, 'XX1990.4091');
  assert.notEqual(visit.about, visit.subject);
  assert.equal(serializeVisit(visit), text);
});

test('townhall and record are their own screens', () => {
  assert.equal(serializeVisit({screen:'townhall'}), '?screen=townhall');
  const record = parseVisit('?screen=record&subject=85.4.64.43&with=TD1989.318.1&record=TD1989.318.1');
  assert.equal(record.screen, 'record');
  assert.equal(record.subject, '85.4.64.43');
  assert.equal(record.with, 'TD1989.318.1');
  assert.equal(record.record, 'TD1989.318.1');
  assert.equal(serializeVisit(record), '?screen=record&subject=85.4.64.43&with=TD1989.318.1&record=TD1989.318.1');
});

test('family, an empty theme, and the untouched opening stay out of the bar', () => {
  assert.equal(serializeVisit({screen:'room', lens:'family', theme:''}), '');
  const blank = parseVisit('');
  assert.equal(blank.screen, 'room');
  assert.equal(blank.subject, null);
  assert.equal(blank.with, null);
  assert.equal(blank.path, null);
  const defaults = parseVisit('?screen=room&lens=family');
  assert.equal(defaults.lens, null);
  assert.equal(defaults.theme, null);
  const shaped = parseVisit('?screen=room&subject=85.4.64.43&with=TD1989.318.1&lens=worker&theme=Machines');
  assert.equal(shaped.lens, 'worker');
  assert.equal(shaped.theme, 'Machines');
  assert.match(serializeVisit(shaped), /lens=worker/);
  assert.match(serializeVisit(shaped), /theme=Machines/);
});

test('legacy accession and path links still open a room', () => {
  const byAccession = parseVisit('?accession=85.4.64.43');
  assert.equal(byAccession.screen, 'room');
  assert.equal(byAccession.subject, '85.4.64.43');
  assert.equal(byAccession.with, null);
  const byPath = parseVisit('?path=catalogue-meets-engine');
  assert.equal(byPath.screen, 'room');
  assert.equal(byPath.path, 'catalogue-meets-engine');
  assert.equal(byPath.subject, null);
});

test('a comma accession stays one identity', () => {
  const visit = parseVisit('?screen=room&subject=85.7.383a,b&with=86.17.1');
  assert.equal(visit.subject, '85.7.383a,b');
  assert.equal(visit.with, '86.17.1');
  assert.equal(parseVisit(serializeVisit(visit)).subject, '85.7.383a,b');
});
