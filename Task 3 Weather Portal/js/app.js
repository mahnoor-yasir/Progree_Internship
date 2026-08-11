/**
 * AERIS — application controller.
 * Owns state, wires events and orchestrates api <-> ui.
 */
(function () {
  "use strict";

  const cfg = window.AERIS_CONFIG;
  const Api = window.AerisApi;
  const UI = window.AerisUI;
  const Store = window.AerisStorage;
  const U = window.AerisUtils;
  const el = (id) => document.getElementById(id);

  const state = {
    prefs: Store.getPrefs(),
    model: null,          // last successful view-model
    inFlight: false,      // duplicate-request guard
    lastQuery: null,      // { type: 'city'|'coords', ... } used by refresh/retry
    geoDenied: false,     // do not re-prompt after a denial
    tickTimer: null,
    autoTimer: null
  };

  /* ---------------- error copy ---------------- */

  const ERRORS = {
    NO_KEY: ["API key required", "Add your OpenWeatherMap API key in js/config.js, then reload the page. See the README for step-by-step setup."],
    AUTH: ["API key problem", "The OpenWeatherMap API key is invalid or not yet active. Check the key in js/config.js — new keys can take up to an hour to activate."],
    NOT_FOUND: ["Location not found", "We couldn't find that location. Try another city or country."],
    NETWORK: ["Connection problem", "Unable to connect to the weather service. Check your internet connection and try again."],
    TIMEOUT: ["Request timed out", "The weather service took too long to respond. Please try again."],
    RATE_LIMIT: ["Too many requests", "Weather service limit reached. Please try again later."],
    SERVER: ["Service unavailable", "The weather service is temporarily unavailable. Please try again shortly."],
    UNKNOWN: ["Something went wrong", "We couldn't load the weather right now. Please try again."]
  };

  function handleError(err) {
    const code = err && err.code ? err.code : "UNKNOWN";
    const [title, message] = ERRORS[code] || ERRORS.UNKNOWN;
    UI.showError(title, message);
  }

  /* ---------------- preferences ---------------- */

  function applyTheme() {
    const pref = state.prefs.theme;
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = pref === "system" ? (prefersDark ? "dark" : "light") : pref;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1220" : "#eef2f8");
  }

  function applyPrefsToControls() {
    document.querySelectorAll(".unit-btn").forEach((btn) => {
      const active = btn.dataset.unit === state.prefs.unit;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-unit].seg-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.unit === state.prefs.unit));
    document.querySelectorAll("[data-wind]").forEach((b) => b.classList.toggle("is-active", b.dataset.wind === state.prefs.windUnit));
    document.querySelectorAll("[data-theme].seg-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.theme === state.prefs.theme));
    el("reduceMotion").checked = !!state.prefs.reduceMotion;
    el("autoRefresh").checked = !!state.prefs.autoRefresh;
    document.body.classList.toggle("reduce-motion", !!state.prefs.reduceMotion);
  }

  function updatePrefs(patch) {
    state.prefs = Store.setPrefs(patch);
    applyTheme();
    applyPrefsToControls();
    scheduleAutoRefresh();
    if (state.model) UI.renderAll(state.model, state.prefs);
  }

  /* ---------------- data loading ---------------- */

  function cacheKey(query) {
    return query.type === "coords"
      ? `c:${Number(query.lat).toFixed(2)},${Number(query.lon).toFixed(2)}`
      : `q:${String(query.city).toLowerCase()}`;
  }

  async function load(query, options) {
    const opts = options || {};
    if (state.inFlight) return;               // prevent rapid duplicate requests
    if (!Api.hasKey()) { handleError({ code: "NO_KEY" }); return; }

    state.inFlight = true;
    state.lastQuery = query;
    UI.hideError();
    UI.setLoading(true, !!state.model && opts.keepView !== false);

    // serve a fresh cache hit instantly (unless the user asked for a refresh)
    if (!opts.force) {
      const hit = Store.cacheGet(cacheKey(query));
      if (hit && hit.fresh) {
        state.inFlight = false;
        UI.setLoading(false);
        commit(hit.data);
        return;
      }
    }

    try {
      const model = query.type === "coords"
        ? await Api.fetchWeatherByCoordinates(query.lat, query.lon, query.place || null)
        : await Api.fetchWeatherByCity(query.city);

      Store.cacheSet(cacheKey(query), model);
      commit(model);
    } catch (err) {
      handleError(err);
    } finally {
      state.inFlight = false;
      UI.setLoading(false);
    }
  }

  /** Persist + render a successful view-model. */
  function commit(model) {
    state.model = model;

    const entry = {
      name: model.location.name,
      country: model.location.country,
      lat: model.location.lat,
      lon: model.location.lon
    };

    UI.renderAll(model, state.prefs);
    UI.setFavoriteState(Store.isFavorite(entry.name, entry.country));
    UI.renderHistory(Store.addHistory(entry));
    Store.setLastLocation(entry);
  }

  /* ---------------- search entry points ---------------- */

  function searchCity(rawValue) {
    const result = U.sanitizeQuery(rawValue);
    if (!result.ok) {
      const message = result.reason === "too-long"
        ? "That name is too long. Try a shorter city name."
        : "Please enter a city, region or country name to search.";
      UI.showError("Enter a location", message);
      el("cityInput").focus();
      return;
    }
    load({ type: "city", city: result.value });
  }

  function loadPlace(place) {
    if (U.isNum(Number(place.lat)) && place.lat !== "" && place.lon !== "") {
      load({ type: "coords", lat: Number(place.lat), lon: Number(place.lon), place: place });
    } else {
      load({ type: "city", city: place.country ? `${place.name},${place.country}` : place.name });
    }
  }

  function useGeolocation() {
    if (!("geolocation" in navigator)) {
      UI.showError("Location unsupported", "Your browser doesn't support geolocation. You can still search for a city manually.");
      return;
    }
    if (state.geoDenied) {
      UI.showError("Location permission blocked", "Location access was denied. Enable it in your browser settings, or search for a city manually.");
      return;
    }

    UI.announce("Requesting your location…");
    UI.setLoading(true, !!state.model);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        UI.setLoading(false);
        const { latitude, longitude } = position.coords;
        const place = await Api.reverseGeocode(latitude, longitude);
        load({ type: "coords", lat: latitude, lon: longitude, place: place }, { force: true });
      },
      (error) => {
        UI.setLoading(false);
        if (error.code === 1) {
          state.geoDenied = true;
          UI.showError("Location permission denied", "We can't access your location. Search for a city manually instead.");
        } else if (error.code === 2) {
          UI.showError("Location unavailable", "Your position couldn't be determined. Please search for a city instead.");
        } else {
          UI.showError("Location timed out", "Getting your location took too long. Please try again or search manually.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  /* ---------------- timers ---------------- */

  function startClock() {
    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      if (!state.model) return;
      const localNow = U.locationDate(Math.floor(Date.now() / 1000), state.model.location.timezone);
      const node = el("localTime");
      if (node) node.textContent = U.formatTime(localNow);
      UI.renderLastUpdated(state.model.fetchedAt);
    }, 30000);
  }

  function scheduleAutoRefresh() {
    clearInterval(state.autoTimer);
    if (!state.prefs.autoRefresh) return;
    state.autoTimer = setInterval(() => {
      if (document.hidden || !state.lastQuery || state.inFlight) return; // conservative: only while visible
      load(state.lastQuery, { force: true, keepView: true });
    }, cfg.AUTO_REFRESH_MS);
  }

  /* ---------------- events ---------------- */

  function bindEvents() {
    el("searchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      searchCity(el("cityInput").value);
    });

    el("geoBtn").addEventListener("click", useGeolocation);

    el("refreshBtn").addEventListener("click", () => {
      if (state.lastQuery) load(state.lastQuery, { force: true, keepView: true });
    });

    el("errorRetry").addEventListener("click", () => {
      UI.hideError();
      if (state.lastQuery) load(state.lastQuery, { force: true });
      else el("cityInput").focus();
    });

    el("popularChips").addEventListener("click", (event) => {
      const chip = event.target.closest(".chip");
      if (chip) searchCity(chip.dataset.city);
    });

    // header + settings unit / theme controls
    document.querySelectorAll(".unit-btn, .seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.unit) updatePrefs({ unit: btn.dataset.unit });
        else if (btn.dataset.wind) updatePrefs({ windUnit: btn.dataset.wind });
        else if (btn.dataset.theme) updatePrefs({ theme: btn.dataset.theme });
      });
    });

    el("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.dataset.theme;
      updatePrefs({ theme: current === "dark" ? "light" : "dark" });
    });

    const settingsBtn = el("settingsToggle");
    settingsBtn.addEventListener("click", () => {
      const panel = el("settingsPanel");
      const open = panel.hidden;
      panel.hidden = !open;
      settingsBtn.setAttribute("aria-expanded", String(open));
    });

    el("reduceMotion").addEventListener("change", (e) => updatePrefs({ reduceMotion: e.target.checked }));
    el("autoRefresh").addEventListener("change", (e) => updatePrefs({ autoRefresh: e.target.checked }));

    ["clearHistory", "clearHistory2"].forEach((id) => el(id).addEventListener("click", () => {
      UI.renderHistory(Store.clearHistory());
      UI.announce("Recent searches cleared.");
    }));
    ["clearFavorites", "clearFavorites2"].forEach((id) => el(id).addEventListener("click", () => {
      UI.renderFavorites(Store.clearFavorites());
      UI.setFavoriteState(false);
      UI.announce("Favourites cleared.");
    }));

    el("favBtn").addEventListener("click", () => {
      if (!state.model) return;
      const entry = {
        name: state.model.location.name,
        country: state.model.location.country,
        lat: state.model.location.lat,
        lon: state.model.location.lon
      };
      UI.renderFavorites(Store.toggleFavorite(entry));
      const isFav = Store.isFavorite(entry.name, entry.country);
      UI.setFavoriteState(isFav);
      UI.announce(isFav ? `${entry.name} added to favourites.` : `${entry.name} removed from favourites.`);
    });

    // delegated favourite/recent list actions
    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-action]");
      if (!btn) return;
      const { action, kind, name, country, lat, lon } = btn.dataset;

      if (action === "load") {
        loadPlace({ name, country, lat, lon });
      } else if (action === "remove") {
        if (kind === "favorite") {
          UI.renderFavorites(Store.removeFavorite(name, country));
          if (state.model && state.model.location.name === name) UI.setFavoriteState(false);
        } else {
          UI.renderHistory(Store.removeHistory(name, country));
        }
      }
    });

    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => { if (state.prefs.theme === "system") applyTheme(); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------------- init ---------------- */

  function init() {
    el("year").textContent = new Date().getFullYear();

    applyTheme();
    applyPrefsToControls();
    UI.renderPopular(cfg.POPULAR_CITIES);
    UI.renderFavorites(Store.getFavorites());
    UI.renderHistory(Store.getHistory());
    bindEvents();
    startClock();
    scheduleAutoRefresh();

    if (!Api.hasKey()) {
      UI.showError.apply(null, ERRORS.NO_KEY);
      return;
    }

    // restore the last viewed location (from cache first, then network)
    const last = Store.getLastLocation();
    if (last && last.name) {
      const query = U.isNum(last.lat)
        ? { type: "coords", lat: last.lat, lon: last.lon, place: last }
        : { type: "city", city: last.name };
      const hit = Store.cacheGet(cacheKey(query));
      if (hit) {
        commit(hit.data);
        if (!hit.fresh) load(query, { force: true, keepView: true });
      } else {
        load(query);
      }
    } else {
      UI.showEmpty();
      UI.announce("Welcome to AERIS. Search for a city to begin.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
