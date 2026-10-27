// Fixed-window request limits: one budget per client address, plus a shared budget for the whole server,
// so a single caller cannot use up everyone's allowance and a crowd cannot overload the machine.
const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 10_000;

export function createRateLimiter({ perClient, total, now = Date.now, windowMs = WINDOW_MS }) {
  const clients = new Map();
  let shared = { start: 0, count: 0 };

  function prune(time) {
    for (const [key, entry] of clients) if (time - entry.start >= windowMs) clients.delete(key);
  }

  // Returns true and counts the request when both budgets allow it; otherwise returns false and counts nothing.
  return function allow(client) {
    const time = now();
    if (time - shared.start >= windowMs) shared = { start: time, count: 0 };
    let entry = clients.get(client);
    if (!entry || time - entry.start >= windowMs) {
      if (clients.size >= MAX_TRACKED_CLIENTS) prune(time);
      if (clients.size >= MAX_TRACKED_CLIENTS) return false; // refuse rather than grow without bound
      entry = { start: time, count: 0 };
      clients.set(client, entry);
    }
    if (entry.count >= perClient || shared.count >= total) return false;
    entry.count += 1;
    shared.count += 1;
    return true;
  };
}

// The caller's address. Behind a reverse proxy every connection comes from the proxy, so the proxy's
// forwarded address is used only when the operator says the proxy is trusted (BOARDROOM_TRUST_PROXY=1).
export function clientAddress(req, env = process.env) {
  if (env.BOARDROOM_TRUST_PROXY === '1') {
    const forwarded = req.headers['x-forwarded-for'];
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim();
    if (first) return first;
  }
  return req.socket.remoteAddress ?? 'unknown';
}
