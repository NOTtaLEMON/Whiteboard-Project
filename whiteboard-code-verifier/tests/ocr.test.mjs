import test from 'node:test';
import assert from 'node:assert/strict';
import { ocrConfiguration, ocrTimeoutMs, recognizeHandwriting, validateOcrImages, validateTranscription } from '../server/ocr.mjs';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aHoQAAAAASUVORK5CYII=';
const line = (text, extra = {}) => ({ text, box: [10, 20, 80, 900], uncertain: false, alternatives: [], ...extra });
const env = { OCR_SERVICE_URL: 'http://ocr.test:8788/', OCR_MODEL: 'test-model', VERCEL: '1' };
const reply = (body, init) => async () => new Response(JSON.stringify(body), init);

test('OCR runs locally by default and needs a service URL on Vercel', async () => {
  assert.equal(ocrConfiguration({}).available, true);
  assert.equal(ocrConfiguration({}).provider, 'local-vlm');
  assert.equal(ocrConfiguration({ VERCEL: '1' }).available, false);
  assert.equal(ocrConfiguration({ VERCEL: '1', OCR_SERVICE_URL: 'https://ocr.example.com' }).available, true);
  await assert.rejects(recognizeHandwriting({ code: PNG }, { env: { VERCEL: '1' } }), (error) => error.status === 503 && error.code === 'ocr_not_configured');
});

test('accepts bounded PNG captures and rejects URLs, wrong images, and huge dimensions', () => {
  assert.ok(validateOcrImages({ code: PNG }).code);
  for (const body of [null, {}, { code: 'https://example.com/board.png' }, { code: 'data:image/jpeg;base64,AAAA' }, { code: 'data:image/png;base64,AAAA' }]) {
    assert.throws(() => validateOcrImages(body));
  }
  const bytes = Buffer.from(PNG.split(',')[1], 'base64');
  bytes.writeUInt32BE(2049, 16);
  assert.throws(() => validateOcrImages({ code: `data:image/png;base64,${bytes.toString('base64')}` }), /2048/);
});

test('preserves blank lines, indentation and ambiguous readings without repairing code', () => {
  const value = { code: [line('int main(void) {'), line(''), line('    scanf("%d", x);', { uncertain: true, alternatives: ['    scanf("%d", &x);'] }), line('}')], stdin: [] };
  const parsed = validateTranscription(value, { code: 'image' });
  assert.equal(parsed.code.map((item) => item.text).join('\n'), 'int main(void) {\n\n    scanf("%d", x);\n}');
  assert.equal(parsed.code[2].uncertain, true);
  assert.equal(parsed.code[2].alternatives.length, 1);
});

test('rejects malformed geometry, multiline entries, and unbounded responses', () => {
  for (const item of [line('a\nb'), line('x', { box: [10, 20, 2, 30] }), line('x', { box: [-1, 0, 20, 30] }), line('x', { uncertain: 0.9 })]) {
    assert.throws(() => validateTranscription({ code: [item], stdin: [] }, { code: 'image' }));
  }
  assert.throws(() => validateTranscription({ code: Array.from({ length: 20 }, () => line('x'.repeat(2048))), stdin: [] }, { code: 'image' }), /limit/);
  assert.throws(() => validateTranscription({ code: Array.from({ length: 251 }, () => line('x')), stdin: [] }, { code: 'image' }), /line list/);
  assert.throws(() => validateTranscription({ code: [], stdin: Array.from({ length: 101 }, () => line('x')) }, { stdin: 'image' }), /line list/);
});

test('sends bare base64 PNGs to the local model and validates its transcription', async () => {
  let sent;
  const logs = [];
  const result = await recognizeHandwriting({ code: PNG }, { env, logger: (entry) => logs.push(entry), fetchImpl: async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({ model: 'Qwen/test', stdin: [], code: [{ text: 'int main(void) {}', uncertain: false }] }));
  } });
  assert.equal(sent.url, 'http://ocr.test:8788/ocr');
  assert.equal(sent.options.method, 'POST');
  assert.equal(sent.body.code, PNG.split(',')[1]);
  assert.equal(sent.body.stdin, undefined);
  assert.equal(result.code[0].text, 'int main(void) {}');
  assert.equal(result.provider, 'local-vlm');
  assert.equal(result.model, 'Qwen/test');
  assert.equal(result.requiresConfirmation, true);
  assert.equal(logs[0].event, 'success');
});

test('keeps intentional errors, indentation, blank lines and ambiguity without inventing locations', async () => {
  const texts = ['if value != 0', '    print("O;\\n")', '', '    total = value & 1'];
  const result = await recognizeHandwriting({ code: PNG, language: 'python' }, { env, logger: () => {},
    fetchImpl: reply({ code: texts.map((text, index) => ({ text, uncertain: index === 1 })), stdin: [] }) });
  assert.deepEqual(result.code.map((entry) => entry.text), texts);
  assert.equal(result.code[1].uncertain, true);
  assert.ok(result.code.every((entry) => entry.box === null && entry.alternatives.length === 0));
  assert.equal(result.language, 'python');
  assert.equal(result.requiresConfirmation, true);
  for (const bad of [{ text: 'x' }, { text: 'x\ny', uncertain: false }, { text: 'x', uncertain: 'maybe' }]) {
    assert.throws(() => validateTranscription({ code: [bad], stdin: [] }, { code: 'image' }, { compact: true }), /invalid text/);
  }
  assert.throws(() => validateTranscription({ code: Array.from({ length: 251 }, () => ({ text: 'x', uncertain: false })), stdin: [] },
    { code: 'image' }, { compact: true }), /line list/);
});

test('reports an unreachable, failing, slow or malformed model without executing anything', async () => {
  const run = (fetchImpl) => recognizeHandwriting({ code: PNG }, { env, logger: () => {}, fetchImpl });
  await assert.rejects(run(async () => { throw new TypeError('fetch failed'); }), (error) =>
    error.status === 503 && error.ocrDiagnostic.reason === 'network_error' && /ocr-service\/service\.py/.test(error.message));
  await assert.rejects(run(async () => { throw new DOMException('slow', 'TimeoutError'); }), (error) =>
    error.status === 504 && error.ocrDiagnostic.reason === 'timeout');
  await assert.rejects(run(reply({ error: 'boom' }, { status: 500 })), (error) => error.status === 502 && /HTTP 500/.test(error.message));
  await assert.rejects(run(reply({ code: 'nope', stdin: [] })), (error) => error.code === 'invalid_ocr_response');
});

test('cancels a stalled model before the 60-second hosting deadline', async (t) => {
  t.mock.method(AbortSignal, 'timeout', (milliseconds) => {
    assert.ok(milliseconds <= 50_000, 'leave at least ten seconds for the hosted JSON error response');
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException('model stalled', 'TimeoutError')), 1);
    return controller.signal;
  });
  await assert.rejects(recognizeHandwriting({ code: PNG }, { env, logger: () => {},
    fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
  }), (error) => error.status === 504 && error.ocrDiagnostic.reason === 'timeout');
});

test('rejects unsupported languages', () => {
  assert.throws(() => validateOcrImages({ code: PNG, language: 'javascript' }), /C\+\+ or Python/);
});

test('local CPU OCR gets a long default timeout, hosted OCR stays under the 60-second function limit', () => {
  assert.equal(ocrTimeoutMs({}), 180_000);
  assert.equal(ocrTimeoutMs({ VERCEL: '1' }), 50_000);
  assert.equal(ocrTimeoutMs({ OCR_TIMEOUT_MS: '90000' }), 90_000);
});
