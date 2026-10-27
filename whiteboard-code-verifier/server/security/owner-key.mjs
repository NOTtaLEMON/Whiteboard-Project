import { createHash, timingSafeEqual } from 'node:crypto';

// The website is public, but the API (running code, OCR, snippets, lessons) answers only the owner.
// The owner key lives in the server's private settings (BOARDROOM_OWNER_KEY) and is typed once in the
// owner's browser, never built into the website. Without a configured key the API stays open (local development).
const digest = (value) => createHash('sha256').update(value).digest();

export function ownerKeyConfigured(env = process.env) {
  return Boolean(env.BOARDROOM_OWNER_KEY?.trim());
}

export function hasOwnerKey(req, env = process.env) {
  const expected = env.BOARDROOM_OWNER_KEY?.trim();
  if (!expected) return true;
  const header = req.headers.authorization;
  const given = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  // Compare fixed-length digests so the check takes the same time whatever was sent.
  return given.length > 0 && timingSafeEqual(digest(given), digest(expected));
}

export const OWNER_KEY_ERROR = {
  error: 'This API is private. Enter the owner key to run code, read handwriting or save lessons.',
  code: 'owner_key_required',
};
