/**
 * AERIS — OpenWeatherMap REST layer.
 * All network access uses the Fetch API with async/await, explicit HTTP status
 * checking, timeouts and typed error codes consumed by the UI layer.
 */
window.AerisApi = (function () {
  "use strict";

  const cfg = window.AERIS_CONFIG;

  /** Typed application error so the UI can render the right message. */
  class ApiError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "ApiError";
      this.code = code; // NO_KEY | NOT_FOUND | AUTH | RATE_LIMIT | NETWORK | TIMEOUT | SERVER | UNKNOWN
    }
  }

  function hasKey() {
    return typeof cfg.API_KEY === "string" && cfg.API_KEY.trim().length > 0;
  }

  /** fetch + timeout + status mapping + JSON parsing. */
  async function request(url) {
    if (!hasKey()) {
      throw new ApiError("NO_KEY", "OpenWeatherMap API key is not configured.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (err) {
      clearTimeout(timer);
      if (err && err.name === "AbortError") {
        throw new ApiError("TIMEOUT", "The weather service took too long to respond.");
      }
      throw new ApiError("NETWORK", "Network request failed.");
    }
    clearTimeout(timer);

    if (!response.ok) {
      if (response.status === 401) throw new ApiError("AUTH", "Invalid or inactive API key.");
      if (response.status === 404) throw new ApiError("NOT_FOUND", "Location not found.");
      if (response.status === 429) throw new ApiError("RATE_LIMIT", "Rate limit reached.");
      if (response.status >= 500) throw new ApiError("SERVER", "Weather service unavailable.");
      throw new ApiError("UNKNOWN", "Unexpected response (" + response.status + ").");
    }

    try {
      return await response.json();
    } catch (err) {
      throw new ApiError("UNKNOWN", "Could not read the weather service response.");
    }
  }

  function q(params) {
    const search = new URLSearchParams(params);
    search.set("appid", cfg.API_KEY);
    return search.toString();
  }

  /** Geocoding: city name -> coordinates (handles spaces, accents, "city,country"). */
  async function geocodeCity(query) {
    const data = await request(`${cfg.GEO_URL}/direct?${q({ q: query, limit: 1 })}`);
    if (!Array.isArray(data) || data.length === 0) {
      throw new ApiError("NOT_FOUND", "Location not found.");
    }
    const hit = data[0];
    return {
      name: hit.name,
      country: hit.country || "",
      state: hit.state || "",
      lat: hit.lat,
      lon: hit.lon
    };
  }

  /** Reverse geocoding: coordinates -> place name. */
  async function reverseGeocode(lat, lon) {
    try {
      const data = await request(`${cfg.GEO_URL}/reverse?${q({ lat, lon, limit: 1 })}`);
      if (Array.isArray(data) && data.length) {
        return { name: data[0].name, country: data[0].country || "", lat, lon };
      }
    } catch (err) { /* non fatal — current weather also carries a name */ }
    return null;
  }

  async function fetchCurrentWeather(lat, lon) {
    return request(`${cfg.BASE_URL}/weather?${q({ lat, lon, units: "metric" })}`);
  }

  async function fetchForecast(lat, lon) {
    return request(`${cfg.BASE_URL}/forecast?${q({ lat, lon, units: "metric" })}`);
  }

  /** Optional endpoint — resolves to null when the plan does not allow it. */
  async function fetchAirQuality(lat, lon) {
    try {
      return await request(`${cfg.BASE_URL}/air_pollution?${q({ lat, lon })}`);
    } catch (err) {
      return null;
    }
  }

  /** Composite loader used by every entry point (search, chips, geolocation). */
  async function fetchWeatherByCoordinates(lat, lon, place) {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon)
    ]);
    const air = await fetchAirQuality(lat, lon);
    return window.AerisApi.transform(current, forecast, air, place);
  }

  async function fetchWeatherByCity(query) {
    const place = await geocodeCity(query);
    return fetchWeatherByCoordinates(place.lat, place.lon, place);
  }

  /* ---------------- transformation & validation ---------------- */

  const U = window.AerisUtils;

  /**
   * Turn raw API payloads into a defensive view-model.
   * Any missing property becomes null and is rendered as "Unavailable".
   */
  function transform(current, forecast, air, place) {
    if (!current || typeof current !== "object" || !current.weather) {
      throw new ApiError("UNKNOWN", "Malformed weather response.");
    }

    const w = Array.isArray(current.weather) ? current.weather[0] || {} : {};
    const tz = U.isNum(current.timezone) ? current.timezone : 0;

    const location = {
      name: (place && place.name) || current.name || "Unknown location",
      country: (place && place.country) || U.get(current, "sys.country", ""),
      lat: U.get(current, "coord.lat", place && place.lat),
      lon: U.get(current, "coord.lon", place && place.lon),
      timezone: tz
    };

    const now = {
      temp: U.get(current, "main.temp", null),
      feelsLike: U.get(current, "main.feels_like", null),
      tempMin: U.get(current, "main.temp_min", null),
      tempMax: U.get(current, "main.temp_max", null),
      humidity: U.get(current, "main.humidity", null),
      pressure: U.get(current, "main.pressure", null),
      visibility: U.isNum(current.visibility) ? current.visibility : null,
      clouds: U.get(current, "clouds.all", null),
      windSpeed: U.get(current, "wind.speed", null),
      windDeg: U.get(current, "wind.deg", null),
      windGust: U.get(current, "wind.gust", null),
      rain1h: U.get(current, "rain.1h", null),
      snow1h: U.get(current, "snow.1h", null),
      condition: w.main || null,
      description: w.description ? U.titleCase(w.description) : null,
      icon: w.icon || null,
      conditionId: w.id || null,
      sunrise: U.get(current, "sys.sunrise", null),
      sunset: U.get(current, "sys.sunset", null),
      dt: U.isNum(current.dt) ? current.dt : Math.floor(Date.now() / 1000)
    };

    const hourly = [];
    const list = forecast && Array.isArray(forecast.list) ? forecast.list : [];
    list.slice(0, 8).forEach((item) => {
      const iw = Array.isArray(item.weather) ? item.weather[0] || {} : {};
      hourly.push({
        dt: item.dt,
        temp: U.get(item, "main.temp", null),
        icon: iw.icon || null,
        condition: iw.main || null,
        pop: U.isNum(item.pop) ? Math.round(item.pop * 100) : null
      });
    });

    // group 3-hourly entries into calendar days of the *location*
    const dayMap = new Map();
    list.forEach((item) => {
      const d = U.locationDate(item.dt, tz);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      if (!dayMap.has(key)) {
        dayMap.set(key, { key, dt: item.dt, temps: [], pops: [], icons: [], conditions: [] });
      }
      const bucket = dayMap.get(key);
      const iw = Array.isArray(item.weather) ? item.weather[0] || {} : {};
      if (U.isNum(U.get(item, "main.temp", null))) bucket.temps.push(item.main.temp);
      if (U.isNum(item.pop)) bucket.pops.push(item.pop);
      if (iw.icon) bucket.icons.push(iw.icon);
      if (iw.main) bucket.conditions.push(iw.main);
      // prefer a midday sample for the representative icon
      const hour = d.getUTCHours();
      if (hour >= 11 && hour <= 14) { bucket.noonIcon = iw.icon; bucket.noonCondition = iw.main; }
    });

    const daily = Array.from(dayMap.values()).slice(0, 5).map((b) => ({
      dt: b.dt,
      high: b.temps.length ? Math.max.apply(null, b.temps) : null,
      low: b.temps.length ? Math.min.apply(null, b.temps) : null,
      pop: b.pops.length ? Math.round(Math.max.apply(null, b.pops) * 100) : null,
      icon: b.noonIcon || b.icons[Math.floor(b.icons.length / 2)] || b.icons[0] || null,
      condition: b.noonCondition || b.conditions[0] || null
    }));

    let airQuality = null;
    const aq = air && Array.isArray(air.list) ? air.list[0] : null;
    if (aq && U.isNum(U.get(aq, "main.aqi", null))) {
      airQuality = {
        aqi: aq.main.aqi,
        components: aq.components && typeof aq.components === "object" ? aq.components : {}
      };
    }

    return { location, now, hourly, daily, airQuality, fetchedAt: Date.now() };
  }

  return {
    ApiError, hasKey, transform,
    geocodeCity, reverseGeocode,
    fetchCurrentWeather, fetchForecast, fetchAirQuality,
    fetchWeatherByCoordinates, fetchWeatherByCity
  };
})();
