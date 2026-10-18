// ---------- customer session: key "loyalty:<slug>" -> { phoneNumber, carlos } ----------
const key = (slug) => `loyalty:${slug}`;

export function saveSession(slug, session) {
  try {
    localStorage.setItem(key(slug), JSON.stringify(session));
  } catch {}
}

export function loadSession(slug) {
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(slug) {
  try {
    localStorage.removeItem(key(slug));
  } catch {}
}

// ---------- cashier session: key "loyalty-admin:<slug>", expires after 12 hours ----------
const adminKey = (slug) => `loyalty-admin:${slug}`;
const ADMIN_TTL = 12 * 60 * 60 * 1000;

export function saveAdminSession(slug) {
  try {
    localStorage.setItem(adminKey(slug), JSON.stringify({ at: Date.now() }));
  } catch {}
}

export function hasAdminSession(slug) {
  try {
    const raw = localStorage.getItem(adminKey(slug));
    if (!raw) return false;
    return Date.now() - JSON.parse(raw).at < ADMIN_TTL;
  } catch {
    return false;
  }
}

export function clearAdminSession(slug) {
  try {
    localStorage.removeItem(adminKey(slug));
  } catch {}
}