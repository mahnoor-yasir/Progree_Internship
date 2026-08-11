/**
 * AERIS — utility helpers (pure functions, no DOM side effects).
 */
window.AerisUtils = (function () {
  "use strict";

  const FALLBACK = "Unavailable";

  /** Safe nested property read. */
  function get(obj, path, fallback) {
    const value = String(path).split(".").reduce(
      (acc, key) => (acc !== null && acc !== undefined ? acc[key] : undefined),
      obj
    );
    return value === undefined || value === null || Number.isNaN(value) ? fallback : value;
  }

  function isNum(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  /** Normalise + validate a user-typed query. */
  function sanitizeQuery(raw) {
    const value = String(raw || "").replace(/\s+/g, " ").trim();
    if (!value) return { ok: false, reason: "empty" };
    if (value.length > 80) return { ok: false, reason: "too-long" };
    if (!/[\p{L}]/u.test(value)) return { ok: false, reason: "invalid" };
    return { ok: true, value };
  }

  /* ---------------- units ---------------- */

  /** OpenWeather always queried in metric; conversions happen here. */
  function toDisplayTemp(celsius, unit) {
    if (!isNum(celsius)) return null;
    return unit === "imperial" ? celsius * 9 / 5 + 32 : celsius;
  }

  function formatTemp(celsius, unit, withUnit) {
    const value = toDisplayTemp(celsius, unit);
    if (value === null) return FALLBACK;
    return Math.round(value) + (withUnit === false ? "°" : unit === "imperial" ? "°F" : "°C");
  }

  /** ms -> chosen wind unit. */
  function formatWind(metersPerSecond, windUnit) {
    if (!isNum(metersPerSecond)) return FALLBACK;
    if (windUnit === "mph") return (metersPerSecond * 2.23694).toFixed(1) + " mph";
    if (windUnit === "ms") return metersPerSecond.toFixed(1) + " m/s";
    return (metersPerSecond * 3.6).toFixed(1) + " km/h";
  }

  const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

  function degreesToCompass(deg) {
    if (!isNum(deg)) return FALLBACK;
    return COMPASS[Math.round(deg / 22.5) % 16];
  }

  function formatPressure(hPa) {
    return isNum(hPa) ? Math.round(hPa) + " hPa" : FALLBACK;
  }

  function pressureNote(hPa) {
    if (!isNum(hPa)) return "";
    if (hPa < 1000) return "Low — unsettled";
    if (hPa > 1022) return "High — stable";
    return "Normal range";
  }

  function formatVisibility(meters, unit) {
    if (!isNum(meters)) return FALLBACK;
    return unit === "imperial"
      ? (meters / 1609.34).toFixed(1) + " mi"
      : (meters / 1000).toFixed(1) + " km";
  }

  function visibilityNote(meters) {
    if (!isNum(meters)) return "";
    if (meters >= 10000) return "Excellent clarity";
    if (meters >= 5000) return "Moderate haze";
    if (meters >= 2000) return "Reduced visibility";
    return "Poor visibility";
  }

  /* ---------------- date & time (location timezone aware) ---------------- */

  /**
   * Convert a UTC unix timestamp into the *location's* local time parts using
   * the timezone offset (seconds) supplied by the API — never the viewer's TZ.
   */
  function locationDate(unixSeconds, timezoneOffsetSeconds) {
    if (!isNum(unixSeconds)) return null;
    const offset = isNum(timezoneOffsetSeconds) ? timezoneOffsetSeconds : 0;
    return new Date((unixSeconds + offset) * 1000);
  }

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function formatTime(date) {
    if (!date) return FALLBACK;
    let h = date.getUTCHours();
    const m = String(date.getUTCMinutes()).padStart(2, "0");
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${suffix}`;
  }

  function formatHour(date) {
    if (!date) return FALLBACK;
    let h = date.getUTCHours();
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h} ${suffix}`;
  }

  function formatDate(date) {
    if (!date) return FALLBACK;
    return `${DAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
  }

  function dayName(date, short) {
    if (!date) return FALLBACK;
    const name = DAYS[date.getUTCDay()];
    return short ? name.slice(0, 3) : name;
  }

  function shortDate(date) {
    if (!date) return "";
    return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
  }

  function relativeTime(timestampMs) {
    if (!isNum(timestampMs)) return FALLBACK;
    const diff = Math.max(0, Date.now() - timestampMs);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    if (mins < 60) return mins + " minutes ago";
    const hrs = Math.floor(mins / 60);
    return hrs === 1 ? "1 hour ago" : hrs + " hours ago";
  }

  /* ---------------- misc ---------------- */

  function iconUrl(code, size) {
    if (!code) return "";
    return `${window.AERIS_CONFIG.ICON_URL}/${code}@${size || "2x"}.png`;
  }

  /** Map an OpenWeather icon code to a background atmosphere key. */
  function skyFromIcon(iconCode, conditionId) {
    if (!iconCode) return "default";
    const night = String(iconCode).endsWith("n");
    if (night) return "night";
    const id = Number(conditionId);
    if (id >= 200 && id < 300) return "storm";
    if (id >= 300 && id < 600) return "rain";
    if (id >= 600 && id < 700) return "snow";
    if (id >= 700 && id < 800) return "mist";
    if (id === 800) return "clear";
    return "clouds";
  }

  function debounce(fn, wait) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function titleCase(str) {
    return String(str || "").replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  }

  return {
    FALLBACK, get, isNum, escapeHtml, sanitizeQuery,
    toDisplayTemp, formatTemp, formatWind, degreesToCompass,
    formatPressure, pressureNote, formatVisibility, visibilityNote,
    locationDate, formatTime, formatHour, formatDate, dayName, shortDate,
    relativeTime, iconUrl, skyFromIcon, debounce, titleCase
  };
})();
