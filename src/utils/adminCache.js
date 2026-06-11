const TTL_MS = 3 * 60 * 1000; // 3 minutes
const TTL_SHORT_MS = 30 * 1000; // 30 seconds — for real-time data like users/transactions

const SHORT_TTL_KEYS = new Set(['users', 'transactions']);

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(`admin_cache_${key}`);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) { localStorage.removeItem(`admin_cache_${key}`); return null; }
    return data;
  } catch { return null; }
}

export function cacheSet(key, data) {
  try {
    const ttl = SHORT_TTL_KEYS.has(key) ? TTL_SHORT_MS : TTL_MS;
    localStorage.setItem(`admin_cache_${key}`, JSON.stringify({ data, expiresAt: Date.now() + ttl }));
  } catch {}
}

export function cacheClear(key) {
  localStorage.removeItem(`admin_cache_${key}`);
}

export function cacheClearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith("admin_cache_"))
    .forEach(k => localStorage.removeItem(k));
}
