import { validLanguage } from '../../shared/languages.js';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const ENV_FILE = fileURLToPath(new URL('../../.env', import.meta.url));
const DEFAULT_OCR_URL = 'http://127.0.0.1:8788';
const DEFAULT_OCR_MODEL = 'Qwen/Qwen2-VL-2B-Instruct';
export const OCR_BODY_LIMIT = 4 * 1024 * 1024;

// Handwriting recognition runs on a pretrained vision-language model (Qwen2-VL) in the local ocr-service/.
// On Vercel there is no sidecar, so OCR_SERVICE_URL must point at a hosted instance.
export function ocrServiceUrl(env = process.env) {
  const configured = env.OCR_SERVICE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return env.VERCEL ? '' : DEFAULT_OCR_URL;
}

// A hosted function must answer within 60 seconds; a local CPU model needs longer.
export function ocrTimeoutMs(env = process.env) {
  const configured = Number(env.OCR_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured >= 1000) return configured;
  return env.VERCEL ? 50_000 : 180_000;
}

export function ocrConfiguration(env = process.env) {
  const url = ocrServiceUrl(env);
  return {
    available: Boolean(url),
    provider: 'local-vlm', model: env.OCR_MODEL?.trim() || DEFAULT_OCR_MODEL,
    message: url ? undefined : 'Set OCR_SERVICE_URL to a running ocr-service (see ocr-service/README.md), then redeploy or restart.',
  };
}

export function loadOcrEnvironment() {
  if (existsSync(ENV_FILE)) loadEnvFile(ENV_FILE);
}

// Read a JSON response body, refusing anything larger than the limit.
export async function readLimited(response, limit = 256 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw new Error('The handwriting model response exceeded its size limit.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function fail(message, status = 400, code = 'invalid_ocr_request') {
  return Object.assign(new Error(message), { status, code });
}

export function validateOcrImages(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Send board images as a JSON object.');
  if (!validLanguage(body.language)) throw fail('Choose C++ or Python.');
  const images = {};
  for (const channel of ['code', 'stdin']) {
    const value = body[channel];
    if (value == null) continue;
    if (typeof value !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
      throw fail('OCR accepts PNG images captured from the board.');
    }
    const encoded = value.slice('data:image/png;base64,'.length);
    const bytes = Buffer.from(encoded, 'base64');
    if (bytes.length > 2 * 1024 * 1024 || bytes.length < 33 || bytes.toString('base64') !== encoded ||
        !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        bytes.toString('ascii', 12, 16) !== 'IHDR') throw fail('Invalid or oversized PNG image.');
    const width = bytes.readUInt32BE(16);
    const height = bytes.readUInt32BE(20);
    if (!width || !height || width > 2048 || height > 2048) throw fail('Board images must be at most 2048 × 2048 pixels.');
    images[channel] = encoded;
  }
  if (!Object.keys(images).length) throw fail('Capture handwritten code or input before requesting OCR.');
  return images;
}

export function validateTranscription(value, images, { compact = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw fail('OCR returned an invalid transcription.', 502, 'invalid_ocr_response');
  const result = {};
  for (const channel of ['code', 'stdin']) {
    const lines = value[channel];
    if (!Array.isArray(lines) || lines.length > (channel === 'code' ? 250 : 100)) {
      throw fail('OCR returned an invalid line list.', 502, 'invalid_ocr_response');
    }
    result[channel] = lines.map((line) => {
      if (compact && line && typeof line === 'object' && !Array.isArray(line)) {
        line = { ...line, box: line.box ?? null, alternatives: line.alternatives ?? [] };
      }
      const validBox = (compact && line?.box === null) || (Array.isArray(line?.box) && line.box.length === 4 &&
        line.box.every((n) => Number.isInteger(n) && n >= 0 && n <= 1000) &&
        line.box[0] < line.box[2] && line.box[1] < line.box[3]);
      if (!line || typeof line.text !== 'string' || /[\r\n\0]/.test(line.text) || line.text.length > 2048 ||
          typeof line.uncertain !== 'boolean' || !validBox ||
          !Array.isArray(line.alternatives) || line.alternatives.length > 3 ||
          !line.alternatives.every((text) => typeof text === 'string' && text.length <= 2048 && !/[\r\n\0]/.test(text))) {
        throw fail('OCR returned invalid text or line coordinates. Try reading the board again.', 502, 'invalid_ocr_response');
      }
      return { text: line.text, box: line.box, uncertain: line.uncertain, alternatives: line.alternatives };
    });
    if (!images[channel]) result[channel] = [];
    if (Buffer.byteLength(result[channel].map((line) => line.text).join('\n')) > (channel === 'code' ? 32_768 : 8192)) {
      throw fail('The transcription exceeds the runner’s source or input limit.', 502, 'invalid_ocr_response');
    }
  }
  return result;
}

export async function recognizeHandwriting(body, { env = process.env, fetchImpl = fetch,
  logger = (entry) => console.info('[ocr:local]', JSON.stringify(entry)) } = {}) {
  const images = validateOcrImages(body);
  const config = ocrConfiguration(env);
  if (!config.available) throw fail(config.message, 503, 'ocr_not_configured');
  const language = body.language ?? 'c';
  const started = performance.now();
  function report(event, fields) {
    const diagnostic = { provider: config.provider, model: config.model,
      durationMs: Math.round(performance.now() - started), ...fields };
    // Observability must never make an otherwise usable request fail.
    try { logger({ event, ...diagnostic }); } catch {}
    return diagnostic;
  }
  function failure(message, status, code, fields) {
    return Object.assign(fail(message, status, code), { ocrDiagnostic: report('failure', fields) });
  }

  let response;
  try {
    response = await fetchImpl(`${ocrServiceUrl(env)}/ocr`, {
      method: 'POST', signal: AbortSignal.timeout(ocrTimeoutMs(env)),
      headers: { 'Content-Type': 'application/json' },
      // The service takes bare base64; the data-URL prefix was already validated above.
      body: JSON.stringify(images),
    });
  } catch (error) {
    const timeout = ['TimeoutError', 'AbortError'].includes(error.name);
    throw failure(timeout ?
      `The handwriting model timed out after ${Math.round(ocrTimeoutMs(env) / 1000)} seconds. Try a smaller selection.` :
      'Could not reach the handwriting model. Start it with: python ocr-service/service.py',
    timeout ? 504 : 503, 'ocr_unavailable', { reason: timeout ? 'timeout' : 'network_error', httpStatus: null });
  }
  if (!response.ok) {
    throw failure(`The handwriting model could not process this board image. (HTTP ${response.status})`,
      502, 'ocr_provider_error', { reason: 'provider_error', httpStatus: response.status });
  }
  let transcription;
  let model = config.model;
  try {
    const data = await readLimited(response);
    transcription = validateTranscription(data, images, { compact: true });
    if (typeof data.model === 'string') model = data.model;
  } catch (error) {
    if (['TimeoutError', 'AbortError'].includes(error.name)) {
      throw failure('The handwriting model timed out while sending its answer.', 504, 'ocr_unavailable', { reason: 'timeout', httpStatus: response.status });
    }
    throw failure(error.code === 'invalid_ocr_response' ? error.message :
      'The handwriting model did not return a readable transcription. Nothing was executed.',
    502, 'invalid_ocr_response', { reason: 'invalid_response', httpStatus: response.status });
  }
  report('success', { httpStatus: response.status });
  return {
    ...transcription, provider: config.provider, model,
    durationMs: Math.round(performance.now() - started),
    requiresConfirmation: true, language,
  };
}
