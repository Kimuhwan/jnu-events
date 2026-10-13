import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source = readFileSync(new URL('./worker/src/router.ts', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace(/export /g, '');
function handler() {
  return vm.runInNewContext(stripTypeScriptTypes(source) + '\nhandleApi', {
    Request, Response, Headers, URL,
    getPost: async () => null, listPosts: async () => [], runCrawl: async () => ({ ok: true }),
  });
}
for (const host of ['localhost', '127.0.0.1', 'localhost.attacker.example', 'site.example']) {
  test(`host cannot authorize admin: ${host}`, async () => {
    const res = await handler()(new Request('https://site.example/api/admin/crawl', { method: 'POST', headers: { host } }), { ADMIN_TOKEN: 'test-token' });
    assert.equal(res.status, 403);
  });
}
test('valid admin token works', async () => {
  const res = await handler()(new Request('https://site.example/api/admin/crawl', { method: 'POST', headers: { 'x-admin-token': 'test-token' } }), { ADMIN_TOKEN: 'test-token' });
  assert.equal(res.status, 200);
});
test('missing configured token fails closed', async () => {
  const res = await handler()(new Request('https://site.example/api/admin/crawl', { method: 'POST', headers: { host: 'localhost' } }), {});
  assert.equal(res.status, 403);
});
