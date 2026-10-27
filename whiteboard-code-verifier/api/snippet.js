import { authorize, jsonBody, apiError, sendJson } from '../server/hosted/hosted-api.mjs';
import { prepareSnippet, SNIPPET_BODY_LIMIT } from '../server/ai/snippet.mjs';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
  if (!authorize(req, res)) return;
  try {
    sendJson(res, 200, await prepareSnippet(jsonBody(req, SNIPPET_BODY_LIMIT)));
  } catch (error) { apiError(res, error); }
}
