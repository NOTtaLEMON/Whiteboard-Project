export { readApiJson } from './api-response.js';

const origin = (import.meta.env.VITE_BOARDROOM_API_ORIGIN ?? '').replace(/\/$/, '');
// Retire the previous browser-readable credential when upgrading.
try { sessionStorage.removeItem('boardroom-api-token'); } catch { /* Optional storage. */ }

// The owner key is typed by the site owner and kept only in their browser; it is never part of the built site.
const OWNER_KEY = 'boardroom.ownerKey';

export function setOwnerKey(value) {
  try {
    if (value) localStorage.setItem(OWNER_KEY, value);
    else localStorage.removeItem(OWNER_KEY);
  } catch { /* Without storage the key cannot be kept; requests stay locked. */ }
}

function ownerKey() {
  try { return localStorage.getItem(OWNER_KEY) ?? ''; } catch { return ''; }
}

export function apiFetch(path, options = {}) {
  const key = ownerKey();
  const headers = key ? { ...options.headers, Authorization: `Bearer ${key}` } : options.headers;
  return fetch(`${origin}${path}`, { ...options, headers, credentials: 'omit' });
}
