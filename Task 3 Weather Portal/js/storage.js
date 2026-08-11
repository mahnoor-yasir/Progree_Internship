/**
 * AERIS — LocalStorage layer.
 * Every access is guarded: private-mode / disabled storage must never break the app.
 */
window.AerisStorage = (function () {
  "use strict";

  const KEYS = {
    prefs: "aeris.prefs.v1",
    history: "aeris.history.v1",
    favorites: "aeris.favorites.v1",
    cache: "aeris.cache.v1",
    last: "aeris.last.v1"
  };

  let available = true;
  try {
    const probe = "__aeris__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
  } catch (err) {
    available = false;
  }

  const memory = {}; // in-memory fallback when LocalStorage is unavailable

  function read(key, fallback) {
    try {
      const raw = available ? window.localStorage.getItem(key) : memory[key];
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      const raw = JSON.stringify(value);
      if (available) window.localStorage.setItem(key, raw);
      else memory[key] = raw;
    } catch (err) {
      /* quota or serialisation issue — degrade silently */
    }
  }

  /* ------- preferences ------- */
  const DEFAULT_PREFS = {
    unit: "metric",
    windUnit: "kmh",
    theme: "system",
    reduceMotion: false,
    autoRefresh: false
  };

  function getPrefs() {
    return Object.assign({}, DEFAULT_PREFS, read(KEYS.prefs, {}));
  }

  function setPrefs(patch) {
    const next = Object.assign(getPrefs(), patch);
    write(KEYS.prefs, next);
    return next;
  }

  /* ------- history ------- */
  function getHistory() {
    const list = read(KEYS.history, []);
    return Array.isArray(list) ? list : [];
  }

  function addHistory(entry) {
    if (!entry || !entry.name) return getHistory();
    const key = (entry.name + entry.country).toLowerCase();
    const list = getHistory().filter((i) => (i.name + i.country).toLowerCase() !== key);
    list.unshift({ name: entry.name, country: entry.country || "", lat: entry.lat, lon: entry.lon });
    const trimmed = list.slice(0, window.AERIS_CONFIG.MAX_HISTORY);
    write(KEYS.history, trimmed);
    return trimmed;
  }

  function removeHistory(name, country) {
    const key = (name + (country || "")).toLowerCase();
    const list = getHistory().filter((i) => (i.name + i.country).toLowerCase() !== key);
    write(KEYS.history, list);
    return list;
  }

  function clearHistory() { write(KEYS.history, []); return []; }

  /* ------- favourites ------- */
  function getFavorites() {
    const list = read(KEYS.favorites, []);
    return Array.isArray(list) ? list : [];
  }

  function isFavorite(name, country) {
    const key = (name + (country || "")).toLowerCase();
    return getFavorites().some((i) => (i.name + i.country).toLowerCase() === key);
  }

  function toggleFavorite(entry) {
    if (!entry || !entry.name) return getFavorites();
    const key = (entry.name + (entry.country || "")).toLowerCase();
    let list = getFavorites();
    if (list.some((i) => (i.name + i.country).toLowerCase() === key)) {
      list = list.filter((i) => (i.name + i.country).toLowerCase() !== key);
    } else {
      list.unshift({ name: entry.name, country: entry.country || "", lat: entry.lat, lon: entry.lon });
      list = list.slice(0, window.AERIS_CONFIG.MAX_FAVORITES);
    }
    write(KEYS.favorites, list);
    return list;
  }

  function removeFavorite(name, country) {
    const key = (name + (country || "")).toLowerCase();
    const list = getFavorites().filter((i) => (i.name + i.country).toLowerCase() !== key);
    write(KEYS.favorites, list);
    return list;
  }

  function clearFavorites() { write(KEYS.favorites, []); return []; }

  /* ------- response cache ------- */
  function cacheGet(key) {
    const store = read(KEYS.cache, {});
    const hit = store[key];
    if (!hit) return null;
    const age = Date.now() - hit.at;
    return { data: hit.data, at: hit.at, fresh: age < window.AERIS_CONFIG.CACHE_TTL_MS };
  }

  function cacheSet(key, data) {
    const store = read(KEYS.cache, {});
    store[key] = { at: Date.now(), data };
    // keep the cache small
    const keys = Object.keys(store);
    if (keys.length > 20) delete store[keys[0]];
    write(KEYS.cache, store);
  }

  /* ------- last location ------- */
  function getLastLocation() { return read(KEYS.last, null); }
  function setLastLocation(loc) { write(KEYS.last, loc); }

  return {
    available,
    getPrefs, setPrefs,
    getHistory, addHistory, removeHistory, clearHistory,
    getFavorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites,
    cacheGet, cacheSet,
    getLastLocation, setLastLocation
  };
})();
