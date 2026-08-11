# AERIS Intelligent Weather Portal

**Weather intelligence, beautifully delivered.**

A premium, production-quality single-page weather portal built with **HTML5, CSS3 and Vanilla JavaScript (ES6+)**. AERIS retrieves real-time weather from the **OpenWeatherMap REST API** using the **Fetch API with async/await**, and renders every value dynamically into the DOM.

> Frontend Development Internship Project — **Task 3: Asynchronous REST API Weather Portal Application**

---

## 1. Project overview

AERIS is a full weather dashboard: current conditions, six live metric cards, a 24-hour outlook, a hand-built SVG temperature-trend chart, a 5-day forecast, weather insights, a daylight arc, optional air-quality data, favourites, recent searches, unit switching, theming and a settings panel — all persisted locally.

No frameworks. No build step. No backend. Open `index.html` and it runs.

---

## 2. Features

**Asynchronous REST integration**
- Fetch API + `async/await` throughout; every call wrapped in `try/catch`
- Explicit HTTP status checking (401 / 404 / 429 / 5xx) mapped to typed errors
- Request timeouts via `AbortController`
- Parallel requests with `Promise.all`
- Defensive response validation — missing fields render as “Unavailable”, never `undefined`

**Weather data**
- Current weather: city, country, temperature, feels-like, condition, description, icon, humidity, wind speed + direction, pressure, visibility, cloud cover, sunrise, sunset, local date and local time
- Metric cards with progress bars and a rotating wind compass
- 24-hour outlook (horizontally scrollable) with precipitation probability
- SVG temperature-trend chart, redrawn on every search and unit change
- 5-day forecast with high/low, condition and precipitation, current day highlighted
- Weather insights derived only from fields actually present in the response
- Sunrise / sunset arc showing the current position through the daylight period
- Air quality (AQI + PM2.5, PM10, CO, NO₂, O₃) — hidden gracefully if the endpoint is unavailable

**UX and state**
- Welcome/empty state on first visit — no fake data is ever shown
- Skeleton loading state, disabled search button, duplicate-request guard
- Full error states: invalid city, network failure, timeout, API error, missing API key, rate limit, geolocation denied/unavailable/timeout
- “Use my location” via the Geolocation API
- Favourites and recent searches in LocalStorage (add, click to load, remove, clear)
- Popular-city shortcuts that perform real API searches
- °C / °F and km/h · m/s · mph switching without refetching
- Light / dark / system theme, persisted
- Manual refresh + optional conservative 10-minute auto refresh (only while the tab is visible)
- “Last updated …” relative timestamp from the real fetch time
- Client-side cache with freshness timestamps; last location restored on reload

**Quality**
- Semantic HTML5, ARIA labels, visible focus rings, keyboard-only search, `role="status"` live region
- `prefers-reduced-motion` respected plus a manual reduced-motion setting
- Responsive from 320px to 1440px+, with a genuinely mobile-first layout at small sizes
- Weather-driven atmospheric backgrounds (clear, clouds, rain, storm, snow, mist, night)

---

## 3. Technologies

| Area | Technology |
| --- | --- |
| Markup | HTML5, semantic landmarks |
| Styling | CSS3 (custom properties, grid, flexbox, glassmorphism, keyframe animations) |
| Logic | Vanilla JavaScript ES6+ (modules-by-namespace pattern) |
| Networking | Fetch API, async/await, AbortController |
| Data | OpenWeatherMap Current Weather, 5 day / 3 hour Forecast, Geocoding, Air Pollution |
| Persistence | LocalStorage |
| Device | Geolocation API |
| Charts | Hand-written inline SVG (no chart library) |

---

## 4. Setup — configure the API key

1. Create a free account at <https://openweathermap.org/api> and copy a key from **My API keys**.
2. Open **`js/config.js`**.
3. Paste the key:

```js
window.AERIS_CONFIG = {
  API_KEY: "your_openweathermap_api_key_here",
  ...
};
```

4. Save the file and reload the page.

New keys can take **10–60 minutes** to activate. Until a valid key is present, AERIS shows a clear developer-friendly configuration message instead of failing silently.

**Security note:** a key used from the browser is visible to anyone inspecting network traffic — this is an inherent limitation of any static frontend. For production, proxy OpenWeatherMap through a small server and keep the key there. No other secrets exist in this project.

---

## 5. Running the project

1. Extract the ZIP.
2. Configure your API key in `js/config.js` (step 4 above).
3. Open **`index.html`** in a modern browser.

`file://` works for this project because OpenWeatherMap sends permissive CORS headers. If your browser blocks the requests, serve the folder statically instead:

- **VS Code**: install the *Live Server* extension → right-click `index.html` → **Open with Live Server**
- **Python**: `python -m http.server 8000` inside the project folder, then visit <http://localhost:8000>

**Main entry file: `index.html`**

---

## 6. Project structure

```
aeris-weather-portal/
├── index.html            Single-page markup, all sections and states
├── README.md             This document
├── assets/
│   ├── icons/            favicon.svg, logo.svg
│   ├── images/           welcome.svg illustration
│   └── fonts/            (webfonts loaded from Google Fonts; system stack fallback)
├── css/
│   ├── style.css         Design system, layout, components, themes
│   ├── animations.css    Keyframes, transitions, reduced-motion rules
│   └── responsive.css    1440 / 1200 / 992 / 768 / 576 / 375 / 320 breakpoints
└── js/
    ├── config.js         API key + endpoints + tunables (the only file to edit)
    ├── utils.js          Pure helpers: units, timezone-aware dates, formatting
    ├── storage.js        LocalStorage: prefs, history, favourites, cache
    ├── api.js            Fetch layer, HTTP status mapping, response transformation
    ├── ui.js             All DOM rendering (cards, chart, lists, states)
    └── app.js            State machine, events, initialisation
```

Separation of concerns is strict: `api.js` never touches the DOM, `ui.js` never performs network calls, `app.js` orchestrates.

---

## 7. API usage

| Purpose | Endpoint |
| --- | --- |
| City → coordinates | `GET /geo/1.0/direct` |
| Coordinates → city | `GET /geo/1.0/reverse` |
| Current weather | `GET /data/2.5/weather` |
| 5-day / 3-hour forecast | `GET /data/2.5/forecast` |
| Air quality (optional) | `GET /data/2.5/air_pollution` |

All requests are issued in `units=metric`; Fahrenheit and alternative wind units are converted client-side so switching units never triggers a network call.

Request flow:

```text
User input → validate → loading state → fetch (async/await)
  → check HTTP status → parse JSON → transform + validate → render → clear loading

on failure: catch → map error code → render error state → clear loading
```

---

## 8. Error handling

| Scenario | Result |
| --- | --- |
| Missing API key | “Add your OpenWeatherMap API key in `js/config.js`.” |
| Invalid / unknown city | “We couldn't find that location. Try another city or country.” |
| Offline / DNS failure | “Unable to connect to the weather service. Check your internet connection and try again.” |
| Request timeout | Timeout message with a retry action |
| 401 invalid key | Developer-friendly key message |
| 429 rate limit | “Weather service limit reached. Please try again later.” |
| 5xx | Service-unavailable state |
| Geolocation denied / unavailable / timeout / unsupported | Friendly message; manual search stays fully available |
| Air quality unavailable | Section hidden — no fabricated values |
| LocalStorage unavailable | Transparent in-memory fallback |

Raw exceptions are never surfaced to the user, and every state change is announced through the `role="status"` live region.

---

## 9. Responsive design

Tested and tuned at **1440, 1200, 992, 768, 576, 375 and 320 px**. Metric cards move from a three-column grid to two columns to a single column; the hourly strip scrolls horizontally; header controls compact; tap targets stay ≥ 44 px; no horizontal page overflow at any width.

---

## 10. Internship task

**Task 3 — Asynchronous REST API Weather Portal Application.** The mandatory requirements (Fetch API, async/await, REST integration, loading state, error handling, invalid-city handling, dynamic DOM rendering, responsive layout) are fully implemented and extended into a production-grade dashboard.

Weather data © OpenWeatherMap. AERIS is an independent educational project and is not an official OpenWeatherMap product.
