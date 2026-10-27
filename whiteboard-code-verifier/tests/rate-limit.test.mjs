import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, clientAddress } from '../server/rate-limit.mjs';

test('each client gets its own budget and the window resets', () => {
  let time = 0;
  const allow = createRateLimiter({ perClient: 2, total: 100, now: () => time });
  assert.deepEqual([allow('a'), allow('a'), allow('a')], [true, true, false]);
  assert.equal(allow('b'), true, 'another client is unaffected by a');
  time += 60_000;
  assert.equal(allow('a'), true);
});

test('a shared budget caps the whole server even when every client is within its own limit', () => {
  const allow = createRateLimiter({ perClient: 5, total: 3 });
  assert.deepEqual(['a', 'b', 'c', 'd'].map(allow), [true, true, true, false]);
});

test('a refused request does not use up the shared budget', () => {
  const allow = createRateLimiter({ perClient: 1, total: 2 });
  assert.equal(allow('a'), true);
  assert.equal(allow('a'), false);
  assert.equal(allow('a'), false);
  assert.equal(allow('b'), true, 'the refused calls did not count against the total');
});

test('uses the socket address unless the proxy is explicitly trusted', () => {
  const req = { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }, socket: { remoteAddress: '127.0.0.1' } };
  assert.equal(clientAddress(req, {}), '127.0.0.1', 'a spoofed header is ignored by default');
  assert.equal(clientAddress(req, { BOARDROOM_TRUST_PROXY: '1' }), '203.0.113.9');
  assert.equal(clientAddress({ headers: {}, socket: {} }, {}), 'unknown');
});
