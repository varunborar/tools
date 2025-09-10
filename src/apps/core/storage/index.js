export function createLocalStorageAdapter(namespace = "apps") {
  function makeKey(key) {
    const clean = String(key || "").trim();
    return `${namespace}:${clean}`;
  }

  function get(key, defaultValue = null) {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(makeKey(key));
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  function set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(makeKey(key), JSON.stringify(value));
    } catch {}
  }

  function remove(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(makeKey(key));
    } catch {}
  }

  function list(prefix = "") {
    if (typeof window === "undefined") return [];
    const out = [];
    const pfx = makeKey(prefix);
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const fullKey = window.localStorage.key(i);
        if (!fullKey) continue;
        if (fullKey.startsWith(pfx)) out.push(fullKey);
      }
    } catch {}
    return out;
  }

  return { get, set, remove, list };
}
