const store = new Map<string, { count: number; reset: number }>();

const WINDOW_MS = 60_000;

export function rateLimit(ip: string, limit: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.reset) {
    store.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  }

  entry.count++;
  return { ok: true, retryAfter: 0 };
}

// Prune expired entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (now > val.reset) store.delete(key);
  }
}, 300_000);
