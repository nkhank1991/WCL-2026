import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveFinals, withArchiveFinal} from '../src/team-records.js';
import {publicPayload, validatePayload} from '../server/policy.mjs';

test('published archive finals retain winner and scorecard links without changing edited results', () => {
  const final = {...archiveFinals['s2-18'], id:'s2-18', label:'Final', date:'2 Aug 2025', status:'Completed', verificationStatus:'verified'};
  const published = publicPayload('fixtures', final);
  assert.equal(published.winner, final.winner);
  assert.equal(published.scoreSource, final.scoreSource);
  validatePayload('fixtures', published);
  const {winner, scoreSource, ...legacySnapshot} = published;
  assert.equal(withArchiveFinal(legacySnapshot).winner, winner);
  assert.equal(withArchiveFinal(legacySnapshot).scoreSource, scoreSource);
  for (const changes of [{result:'A different reviewed result'}, {scores:['100','101']}, {teams:['india','pakistan']}, {season:3}, {status:'Cancelled'}, {verificationStatus:'pending'}]) {
    const edited = {...legacySnapshot, ...changes};
    assert.equal(withArchiveFinal(edited), edited);
    assert.equal(withArchiveFinal(edited).winner, undefined);
  }
  assert.equal(withArchiveFinal({...published, scoreSource:'https://example.com/reviewed'}).scoreSource, 'https://example.com/reviewed');
  assert.throws(() => validatePayload('fixtures', {...published, winner:'india'}), /winner/);
  assert.throws(() => validatePayload('fixtures', {...published, scoreSource:'http://example.com/score'}), /HTTPS/);
});
