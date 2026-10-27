import test from 'node:test';
import assert from 'node:assert/strict';
import { checkKeepsLines, prepareSnippet, validateSnippet } from '../server/snippet.mjs';

const env = { OCR_SERVICE_URL: 'http://ocr.test:8788', OCR_MODEL: 'test-model', VERCEL: '1' };
const snippet = 'int a, b;\nscanf("%d %d", a, b);\n\nprintf("%d\\n", a + b)';
const wrapped = '#include <cstdio>\nint main() {\n    int a, b;\n    scanf("%d %d", a, b);\n\n    printf("%d\\n", a + b)\n    return 0;\n}\n';
const reply = (body, init) => async () => new Response(JSON.stringify(body), init);

test('accepts boilerplate around the lines, mistakes included, ignoring indentation and blank lines', () => {
  assert.deepEqual(checkKeepsLines(snippet, wrapped), { ok: true });
});

test('rejects a result that fixed, changed, dropped or reordered a line, and names the line', () => {
  const fixed = wrapped.replace('scanf("%d %d", a, b)', 'scanf("%d %d", &a, &b)');
  assert.deepEqual(checkKeepsLines(snippet, fixed), { ok: false, line: 2, text: 'scanf("%d %d", a, b);' });
  const semicolon = wrapped.replace('a + b)', 'a + b);');
  assert.equal(checkKeepsLines(snippet, semicolon).line, 4, 'adding the missing semicolon counts as a change');
  assert.equal(checkKeepsLines(snippet, wrapped.replace('    int a, b;\n', '')).line, 1);
  const swapped = '#include <cstdio>\nint main() {\n    scanf("%d %d", a, b);\n    int a, b;\n    printf("%d\\n", a + b)\n}\n';
  assert.equal(checkKeepsLines(snippet, swapped).ok, false);
});

test('validates the request: C++ only, non-empty, bounded', () => {
  assert.equal(validateSnippet({ source: 'x = 1;' }), 'x = 1;');
  for (const body of [null, [], {}, { source: ' ' }, { source: 'x'.repeat(32_769) }, { source: 'a\0b' }, { source: 'x', language: 'python' }]) {
    assert.throws(() => validateSnippet(body));
  }
});

test('returns the prepared program for teacher confirmation when the lines are kept', async () => {
  let sent;
  const result = await prepareSnippet({ source: snippet, language: 'c' }, { env, logger: () => {}, fetchImpl: async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ source: wrapped, model: 'Qwen/test' }));
  } });
  assert.equal(sent.url, 'http://ocr.test:8788/wrap');
  assert.equal(sent.body.source, snippet);
  assert.equal(result.source, wrapped);
  assert.equal(result.requiresConfirmation, true);
  assert.equal(result.model, 'Qwen/test');
});

test('refuses to hand back a program the model changed', async () => {
  await assert.rejects(prepareSnippet({ source: snippet }, { env, logger: () => {},
    fetchImpl: reply({ source: wrapped.replace('a, b);', '&a, &b);') }) }),
  (error) => error.status === 502 && error.code === 'ocr_snippet_changed' && /line 2/.test(error.message) && error.ocrDiagnostic.reason === 'changed_code');
});

test('reports an unreachable, failing, slow or malformed model', async () => {
  const run = (fetchImpl) => prepareSnippet({ source: snippet }, { env, logger: () => {}, fetchImpl });
  await assert.rejects(run(async () => { throw new TypeError('fetch failed'); }), (error) => error.status === 503 && error.code === 'ocr_unavailable');
  await assert.rejects(run(async () => { throw new DOMException('slow', 'TimeoutError'); }), (error) => error.status === 504);
  await assert.rejects(run(reply({}, { status: 500 })), (error) => error.status === 502 && /HTTP 500/.test(error.message));
  await assert.rejects(run(reply({ source: '   ' })), (error) => error.code === 'invalid_ocr_response');
  await assert.rejects(prepareSnippet({ source: snippet }, { env: { VERCEL: '1' } }), (error) => error.status === 503 && error.code === 'ocr_not_configured');
});
