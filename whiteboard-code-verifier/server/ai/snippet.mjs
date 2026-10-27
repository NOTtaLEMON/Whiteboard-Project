import { ocrConfiguration, ocrServiceUrl, ocrTimeoutMs, readLimited } from './ocr.mjs';

export const SNIPPET_BODY_LIMIT = 65_536;
const MAX_SOURCE = 32_768;

function fail(message, status = 400, code = 'ocr_snippet_invalid') {
  return Object.assign(new Error(message), { status, code });
}

const normalize = (line) => line.trim().replace(/\s+/g, ' ');

// The model may add boilerplate but must not touch the teacher's lines. Every non-blank original line has to
// appear in the result, unchanged apart from spacing, and in the same order. Returns the first line that does not.
export function checkKeepsLines(original, wrapped) {
  const have = wrapped.split('\n').map(normalize);
  let at = 0;
  const lines = original.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const want = normalize(lines[i]);
    if (!want) continue;
    while (at < have.length && have[at] !== want) at++;
    if (at === have.length) return { ok: false, line: i + 1, text: lines[i].trim() };
    at++;
  }
  return { ok: true };
}

export function validateSnippet(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Send a JSON object.');
  if (body.language !== undefined && body.language !== 'c') throw fail('Snippet mode is for C++ only.');
  if (typeof body.source !== 'string' || !body.source.trim()) throw fail('Write some code before preparing it.');
  if (Buffer.byteLength(body.source) > MAX_SOURCE || body.source.includes('\0')) throw fail('Source must be at most 32 KiB without NUL characters.');
  return body.source;
}

export async function prepareSnippet(body, { env = process.env, fetchImpl = fetch,
  logger = (entry) => console.info('[snippet:local]', JSON.stringify(entry)) } = {}) {
  const source = validateSnippet(body);
  const config = ocrConfiguration(env);
  if (!config.available) throw fail(config.message, 503, 'ocr_not_configured');
  const started = performance.now();
  const report = (event, fields) => {
    const diagnostic = { provider: config.provider, model: config.model, durationMs: Math.round(performance.now() - started), ...fields };
    try { logger({ event, ...diagnostic }); } catch {}
    return diagnostic;
  };
  const failure = (message, status, code, fields) => Object.assign(fail(message, status, code), { ocrDiagnostic: report('failure', fields) });

  let response;
  try {
    response = await fetchImpl(`${ocrServiceUrl(env)}/wrap`, {
      method: 'POST', signal: AbortSignal.timeout(ocrTimeoutMs(env)),
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source }),
    });
  } catch (error) {
    const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
    throw failure(timeout ? `The model timed out after ${Math.round(ocrTimeoutMs(env) / 1000)} seconds.` :
      'Could not reach the model. Start it with: python ocr-service/service.py',
    timeout ? 504 : 503, 'ocr_unavailable', { reason: timeout ? 'timeout' : 'network_error', httpStatus: null });
  }
  if (!response.ok) throw failure(`The model could not prepare this program. (HTTP ${response.status})`, 502, 'ocr_provider_error', { reason: 'provider_error', httpStatus: response.status });

  let data;
  try { data = await readLimited(response); } catch {
    throw failure('The model did not return a readable program. Nothing was run.', 502, 'invalid_ocr_response', { reason: 'invalid_response', httpStatus: response.status });
  }
  const wrapped = data?.source;
  if (typeof wrapped !== 'string' || !wrapped.trim() || Buffer.byteLength(wrapped) > MAX_SOURCE || wrapped.includes('\0')) {
    throw failure('The model did not return a usable program. Nothing was run.', 502, 'invalid_ocr_response', { reason: 'invalid_response', httpStatus: response.status });
  }
  // The model may reformat or "fix" lines. That is not an error: the program is still returned, with a warning
  // naming the first line that differs, so the teacher can see it before confirming.
  const kept = checkKeepsLines(source, wrapped);
  const warning = kept.ok ? null : `The model may have changed your line ${kept.line}: ${kept.text}. Compare it with what you wrote before you confirm.`;
  report('success', { httpStatus: response.status, changedLine: kept.ok ? null : kept.line });
  return { source: wrapped, warning, provider: config.provider, model: data.model ?? config.model,
    durationMs: Math.round(performance.now() - started), requiresConfirmation: true, language: 'c' };
}
