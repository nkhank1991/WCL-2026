import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/accreditation.js';
import { allowedAccreditationRoute } from '../lib/accreditation-routes.mjs';

test('accreditation gateway fails closed, bounds uploads and does not forward CMS cookies or expose secrets', async t => {
  const previousOrigin = process.env.ACCREDITATION_BACKEND_ORIGIN;
  const previousSecret = process.env.ACCREDITATION_PROXY_SECRET;
  t.after(() => {
    for (const [key, value] of [['ACCREDITATION_BACKEND_ORIGIN', previousOrigin], ['ACCREDITATION_PROXY_SECRET', previousSecret]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  async function call(path, body, extra = {}) {
    const res = { headers: {}, setHeader(k,v) { this.headers[k.toLowerCase()] = v; }, end(value) { this.body = Buffer.from(value).toString(); } };
    await handler({ url: '/api/accreditation', method: body === undefined ? 'GET' : 'POST', query: { accreditationPath: path }, headers: { 'content-type': 'application/json', origin: 'https://www.wclcricket.com', cookie: 'wcl_session=cms-private; wcl_accreditation_session=operations-private', 'x-csrf-token': 'synthetic-csrf' }, body, ...extra }, res);
    return res;
  }
  for (const route of ['admin/content','public/snapshot','../admin/config','admin/imports','admin/config/extra','admin/accreditations?x=1']) assert.equal(allowedAccreditationRoute(route), false);
  delete process.env.ACCREDITATION_BACKEND_ORIGIN;
  delete process.env.ACCREDITATION_PROXY_SECRET;
  assert.equal((await call('accreditation/config')).statusCode, 503);
  process.env.ACCREDITATION_BACKEND_ORIGIN = 'https://backend.example.invalid';
  process.env.ACCREDITATION_PROXY_SECRET = 'synthetic-proxy-test-secret-only';
  let forwarded;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    forwarded = { url: String(url), ...options };
    return new Response(JSON.stringify({ enabled: false }), { status: 200, headers: { 'content-type': 'application/json', 'set-cookie': 'wcl_accreditation_session=test-session; HttpOnly; Secure; SameSite=Strict; Path=/' } });
  });
  const response = await call('accreditation/status', { token: 'synthetic' });
  assert.equal(response.statusCode, 200);
  assert.equal(forwarded.url, 'https://backend.example.invalid/api/accreditation/status');
  assert.equal(forwarded.headers.cookie, 'wcl_accreditation_session=operations-private');
  assert.equal(forwarded.headers['X-WCL-Proxy-Key'], process.env.ACCREDITATION_PROXY_SECRET);
  assert.equal(forwarded.headers['x-csrf-token'], 'synthetic-csrf');
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.ok(!response.body.includes('synthetic-proxy'));
  assert.equal((await call('accreditation/apply', { headshot: 'x'.repeat(3 * 1024 * 1024) })).statusCode, 413);
  assert.equal((await call('admin/imports')).statusCode, 404);
  process.env.ACCREDITATION_BACKEND_ORIGIN = 'http://backend.example.invalid';
  assert.equal((await call('accreditation/config')).statusCode, 503);
  process.env.ACCREDITATION_BACKEND_ORIGIN = 'https://backend.example.invalid';
  t.mock.method(globalThis, 'fetch', async () => { throw Error('synthetic upstream secret'); });
  const offline = await call('accreditation/apply', {});
  assert.equal(offline.statusCode, 502);
  assert.ok(!offline.body.includes('upstream secret'));
});
