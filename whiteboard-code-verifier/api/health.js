import { authorize, sendJson } from '../server/hosted/hosted-api.mjs';
import { hasOwnerKey, ownerKeyConfigured } from '../server/security/owner-key.mjs';
import { ocrConfiguration } from '../server/ai/ocr.mjs';
import { hostedRunnerHealth } from '../server/execution/hosted-runner.mjs';
import { validLanguage } from '../shared/languages.js';
import { githubSnapshotConfiguration } from '../server/lessons/github-snapshots.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' });
  if (!authorize(req, res, { open: true })) return;
  const language = new URL(req.url ?? '/', 'https://localhost').searchParams.get('language') ?? 'c';
  if (!validLanguage(language)) return sendJson(res, 400, { error: 'Choose C++ or Python.' });
  sendJson(res, 200, {
    service: 'whiteboard-code-verifier', access: 'public', locked: ownerKeyConfigured(), authorized: hasOwnerKey(req),
    runner: await hostedRunnerHealth({ language }),
    ocr: ocrConfiguration(),
    snapshots: githubSnapshotConfiguration(),
  });
}
