/**
 * AERIS — configuration
 * ---------------------------------------------------------------
 * 1. Create a free account at https://openweathermap.org/api
 * 2. Copy your API key from "My API keys"
 * 3. Paste it below between the quotes and save the file.
 *
 * NOTE: a browser-side API key is never truly secret — anyone can read it in
 * dev-tools. That is an accepted limitation of a static frontend project.
 * For production you would proxy requests through a small backend.
 */
window.AERIS_CONFIG = {
  // <-- PUT YOUR OPENWEATHERMAP API KEY HERE
  API_KEY: "1d4e66dd3826f9d2af6e173f7c8e9f4f",

  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO_URL: "https://api.openweathermap.org/geo/1.0",
  ICON_URL: "https://openweathermap.org/img/wn",

  REQUEST_TIMEOUT_MS: 12000,
  CACHE_TTL_MS: 10 * 60 * 1000, // treat cached payloads as fresh for 10 minutes
  AUTO_REFRESH_MS: 10 * 60 * 1000,
  MAX_HISTORY: 8,
  MAX_FAVORITES: 12,

  POPULAR_CITIES: [
    "Lahore", "Islamabad", "Karachi", "Dubai",
    "London", "New York", "Tokyo", "Paris"
  ]
};
