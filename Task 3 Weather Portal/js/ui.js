/**
 * AERIS — UI layer. Pure DOM rendering; performs no network requests.
 */
window.AerisUI = (function () {
  "use strict";

  const U = window.AerisUtils;
  const el = (id) => document.getElementById(id);

  const dom = {
    body: document.body,
    status: el("statusRegion"),
    empty: el("emptyState"),
    loading: el("loadingState"),
    error: el("errorState"),
    errorTitle: el("errorTitle"),
    errorMessage: el("errorMessage"),
    dashboard: el("dashboard"),
    searchBtn: el("searchBtn"),
    refreshBtn: el("refreshBtn"),
    headerLocation: el("headerLocation"),
    headerLocationText: el("headerLocationText")
  };

  /* ---------------- states ---------------- */

  function announce(message) {
    if (dom.status) dom.status.textContent = message;
  }

  function setLoading(isLoading, keepDashboard) {
    dom.searchBtn.disabled = isLoading;
    dom.searchBtn.setAttribute("aria-busy", String(isLoading));
    dom.refreshBtn.classList.toggle("is-spinning", isLoading);

    if (isLoading) {
      dom.error.hidden = true;
      if (!keepDashboard) {
        dom.empty.hidden = true;
        dom.dashboard.hidden = true;
        dom.loading.hidden = false;
      }
      announce("Loading weather…");
    } else {
      dom.loading.hidden = true;
    }
  }

  function showEmpty() {
    dom.empty.hidden = false;
    dom.dashboard.hidden = true;
    dom.error.hidden = true;
    dom.loading.hidden = true;
  }

  function showError(title, message) {
    dom.errorTitle.textContent = title;
    dom.errorMessage.textContent = message;
    dom.error.hidden = false;
    dom.loading.hidden = true;
    announce(message);
  }

  function hideError() { dom.error.hidden = true; }

  /* ---------------- current weather ---------------- */

  function renderCurrent(model, prefs) {
    const { location, now } = model;
    const tz = location.timezone;

    dom.empty.hidden = true;
    dom.error.hidden = true;
    dom.dashboard.hidden = false;

    el("cityName").textContent = location.name;
    el("countryName").textContent = location.country ? location.country : "";

    dom.headerLocation.hidden = false;
    dom.headerLocationText.textContent = location.country
      ? `${location.name}, ${location.country}`
      : location.name;

    const localNow = U.locationDate(Math.floor(Date.now() / 1000), tz);
    el("localDate").textContent = U.formatDate(localNow);
    el("localTime").textContent = U.formatTime(localNow);

    const icon = el("currentIcon");
    if (now.icon) {
      icon.src = U.iconUrl(now.icon, "4x");
      icon.alt = now.description || now.condition || "Current weather icon";
      icon.hidden = false;
    } else {
      icon.hidden = true;
    }

    el("currentTemp").textContent = U.formatTemp(now.temp, prefs.unit);
    el("currentCondition").textContent = now.description || now.condition || U.FALLBACK;
    el("currentFeels").textContent = U.isNum(now.feelsLike)
      ? "Feels like " + U.formatTemp(now.feelsLike, prefs.unit)
      : "Feels-like temperature unavailable";

    /* metrics */
    el("mHumidity").textContent = U.isNum(now.humidity) ? now.humidity + "%" : U.FALLBACK;
    el("humidityBar").style.width = (U.isNum(now.humidity) ? now.humidity : 0) + "%";

    el("mWind").textContent = U.formatWind(now.windSpeed, prefs.windUnit);
    el("mWindDir").textContent = U.isNum(now.windDeg)
      ? `${U.degreesToCompass(now.windDeg)} · ${Math.round(now.windDeg)}°`
      : "Direction unavailable";
    const needle = document.querySelector("#windCompass i");
    if (needle) needle.style.transform = `rotate(${U.isNum(now.windDeg) ? now.windDeg + 180 : 0}deg)`;

    el("mPressure").textContent = U.formatPressure(now.pressure);
    el("mPressureNote").textContent = U.pressureNote(now.pressure) || "—";

    el("mVisibility").textContent = U.formatVisibility(now.visibility, prefs.unit);
    el("mVisibilityNote").textContent = U.visibilityNote(now.visibility) || "—";

    el("mClouds").textContent = U.isNum(now.clouds) ? now.clouds + "%" : U.FALLBACK;
    el("cloudBar").style.width = (U.isNum(now.clouds) ? now.clouds : 0) + "%";

    el("mFeels").textContent = U.formatTemp(now.feelsLike, prefs.unit);
    el("mFeelsNote").textContent = U.isNum(now.feelsLike) && U.isNum(now.temp)
      ? (Math.abs(now.feelsLike - now.temp) < 1
        ? "Close to actual temperature"
        : now.feelsLike > now.temp ? "Warmer than actual" : "Cooler than actual")
      : "—";

    /* atmosphere */
    dom.body.dataset.sky = U.skyFromIcon(now.icon, now.conditionId);

    renderLastUpdated(model.fetchedAt);
  }

  function renderLastUpdated(timestamp) {
    const node = el("lastUpdated");
    if (node) node.textContent = U.relativeTime(timestamp);
  }

  /* ---------------- hourly ---------------- */

  function renderHourly(model, prefs) {
    const host = el("hourlyList");
    const section = el("hourlySection");
    host.innerHTML = "";

    if (!model.hourly.length) { section.hidden = true; return; }
    section.hidden = false;

    model.hourly.forEach((item) => {
      const date = U.locationDate(item.dt, model.location.timezone);
      const card = document.createElement("div");
      card.className = "hour";
      card.innerHTML = `
        <p class="h-time">${U.escapeHtml(U.formatHour(date))}</p>
        ${item.icon ? `<img src="${U.iconUrl(item.icon)}" alt="${U.escapeHtml(item.condition || "Forecast icon")}" width="50" height="50" loading="lazy" />` : ""}
        <p class="h-temp">${U.escapeHtml(U.formatTemp(item.temp, prefs.unit, false))}</p>
        <p class="h-cond">${U.escapeHtml(item.condition || U.FALLBACK)}</p>
        ${U.isNum(item.pop) ? `<p class="h-pop">${item.pop}% rain</p>` : ""}`;
      host.appendChild(card);
    });
  }

  /* ---------------- 5-day forecast ---------------- */

  function renderForecast(model, prefs) {
    const host = el("forecastList");
    const section = el("forecastSection");
    host.innerHTML = "";

    if (!model.daily.length) { section.hidden = true; return; }
    section.hidden = false;

    const todayKey = (() => {
      const d = U.locationDate(Math.floor(Date.now() / 1000), model.location.timezone);
      return d ? d.toISOString().slice(0, 10) : "";
    })();

    model.daily.forEach((day) => {
      const date = U.locationDate(day.dt, model.location.timezone);
      const isToday = date && date.toISOString().slice(0, 10) === todayKey;
      const card = document.createElement("article");
      card.className = "card day" + (isToday ? " is-today" : "");
      card.innerHTML = `
        <div>
          <p class="d-name">${isToday ? "Today" : U.escapeHtml(U.dayName(date, true))}</p>
          <p class="d-date">${U.escapeHtml(U.shortDate(date))}</p>
        </div>
        ${day.icon ? `<img src="${U.iconUrl(day.icon)}" alt="${U.escapeHtml(day.condition || "Forecast icon")}" width="62" height="62" loading="lazy" />` : ""}
        <div>
          <p class="d-cond">${U.escapeHtml(day.condition || U.FALLBACK)}</p>
          <p class="d-temps"><strong>${U.escapeHtml(U.formatTemp(day.high, prefs.unit, false))}</strong><span class="d-low">${U.escapeHtml(U.formatTemp(day.low, prefs.unit, false))}</span></p>
          ${U.isNum(day.pop) ? `<p class="d-pop">${day.pop}% precipitation</p>` : ""}
        </div>`;
      host.appendChild(card);
    });
  }

  /* ---------------- temperature chart (hand-built SVG) ---------------- */

  function renderChart(model, prefs) {
    const host = el("chartHost");
    const section = el("chartSection");
    const points = model.hourly.filter((h) => U.isNum(h.temp));

    if (points.length < 3) { section.hidden = true; host.innerHTML = ""; return; }
    section.hidden = false;

    const W = 800, H = 260, padX = 34, padTop = 34, padBottom = 42;
    const values = points.map((p) => U.toDisplayTemp(p.temp, prefs.unit));
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const range = max - min || 1;
    const stepX = (W - padX * 2) / (points.length - 1);

    const coords = values.map((v, i) => ({
      x: padX + i * stepX,
      y: padTop + (1 - (v - min) / range) * (H - padTop - padBottom),
      v
    }));

    // smooth cubic path
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i += 1) {
      const prev = coords[i - 1], cur = coords[i];
      const cx = (prev.x + cur.x) / 2;
      path += ` C ${cx} ${prev.y} ${cx} ${cur.y} ${cur.x} ${cur.y}`;
    }
    const area = `${path} L ${coords[coords.length - 1].x} ${H - padBottom} L ${coords[0].x} ${H - padBottom} Z`;

    const dots = coords.map((c, i) => `
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.6" fill="var(--accent)" />
      <text x="${c.x.toFixed(1)}" y="${(c.y - 13).toFixed(1)}" text-anchor="middle" font-size="12" fill="currentColor">${Math.round(c.v)}°</text>
      <text x="${c.x.toFixed(1)}" y="${H - 14}" text-anchor="middle" font-size="11" fill="var(--text-muted)">${U.escapeHtml(U.formatHour(U.locationDate(points[i].dt, model.location.timezone)))}</text>`).join("");

    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="color:var(--text)">
        <defs>
          <linearGradient id="aerisArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.34" />
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="${H - padBottom}" x2="${W - padX}" y2="${H - padBottom}" stroke="var(--border)" />
        <path d="${area}" fill="url(#aerisArea)" />
        <path class="chart-line" d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" />
        ${dots}
      </svg>`;

    host.setAttribute(
      "aria-label",
      `Temperature trend for the next ${points.length * 3} hours, ranging from ${Math.round(min)} to ${Math.round(max)} degrees.`
    );
  }

  /* ---------------- insights ---------------- */

  function renderInsights(model, prefs) {
    const host = el("insightsList");
    const now = model.now;
    const items = [];

    if (U.isNum(now.rain1h)) items.push(`<strong>Rainfall</strong> ${now.rain1h} mm in the last hour.`);
    if (U.isNum(now.snow1h)) items.push(`<strong>Snowfall</strong> ${now.snow1h} mm in the last hour.`);

    const nextRain = model.hourly.find((h) => U.isNum(h.pop) && h.pop >= 30);
    if (nextRain) {
      const d = U.locationDate(nextRain.dt, model.location.timezone);
      items.push(`<strong>Precipitation</strong> ${nextRain.pop}% chance around ${U.escapeHtml(U.formatHour(d))}.`);
    } else if (model.hourly.some((h) => U.isNum(h.pop))) {
      items.push("<strong>Precipitation</strong> low probability across the next 24 hours.");
    }

    if (U.isNum(now.clouds)) {
      const label = now.clouds < 20 ? "mostly clear skies" : now.clouds < 60 ? "partly cloudy skies" : "heavily clouded skies";
      items.push(`<strong>Cloud cover</strong> ${now.clouds}% — ${label}.`);
    }

    if (U.isNum(now.humidity)) {
      const label = now.humidity < 30 ? "dry air" : now.humidity < 65 ? "comfortable humidity" : "humid, muggy air";
      items.push(`<strong>Humidity</strong> ${now.humidity}% — ${label}.`);
    }

    if (U.isNum(now.windSpeed)) {
      const gust = U.isNum(now.windGust) ? ` Gusts up to ${U.escapeHtml(U.formatWind(now.windGust, prefs.windUnit))}.` : "";
      items.push(`<strong>Wind</strong> ${U.escapeHtml(U.formatWind(now.windSpeed, prefs.windUnit))} from the ${U.degreesToCompass(now.windDeg)}.${gust}`);
    }

    const highs = model.daily.map((d) => d.high).filter(U.isNum);
    if (highs.length >= 2) {
      const delta = highs[highs.length - 1] - highs[0];
      const label = Math.abs(delta) < 1.5 ? "holding steady" : delta > 0 ? "trending warmer" : "trending cooler";
      items.push(`<strong>Temperature trend</strong> ${label} over the next ${highs.length} days.`);
    }

    host.innerHTML = items.length
      ? items.map((text) => `<li>${text}</li>`).join("")
      : `<li>${U.FALLBACK} — the weather service returned no additional detail for this location.</li>`;
  }

  /* ---------------- sunrise / sunset arc ---------------- */

  function renderSun(model) {
    const { now, location } = model;
    const card = el("sunCard");

    if (!U.isNum(now.sunrise) || !U.isNum(now.sunset)) { card.hidden = true; return; }
    card.hidden = false;

    const tz = location.timezone;
    el("sunriseTime").textContent = U.formatTime(U.locationDate(now.sunrise, tz));
    el("sunsetTime").textContent = U.formatTime(U.locationDate(now.sunset, tz));

    const nowSec = Math.floor(Date.now() / 1000);
    const span = now.sunset - now.sunrise;
    const progress = Math.min(1, Math.max(0, (nowSec - now.sunrise) / (span || 1)));

    const W = 320, H = 150, r = 120, cx = W / 2, cy = 138;
    const angle = Math.PI * (1 - progress);
    const px = cx + r * Math.cos(angle);
    const py = cy - r * Math.sin(angle);

    el("sunArcHost").innerHTML = `
      <svg viewBox="0 0 ${W} ${H}">
        <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 6" />
        <path d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${px.toFixed(1)} ${py.toFixed(1)}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" />
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="var(--accent)" />
        <line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="var(--border)" />
      </svg>`;

    const hours = Math.floor(span / 3600);
    const mins = Math.round((span % 3600) / 60);
    const note = nowSec < now.sunrise ? "Before sunrise"
      : nowSec > now.sunset ? "After sunset"
      : `${Math.round(progress * 100)}% through the daylight period`;
    el("daylightNote").textContent = `${hours}h ${mins}m of daylight · ${note}`;
  }

  /* ---------------- air quality ---------------- */

  const AQI_LABELS = ["", "Good", "Fair", "Moderate", "Poor", "Very poor"];
  const POLLUTANTS = [
    ["pm2_5", "PM2.5"], ["pm10", "PM10"], ["co", "CO"], ["no2", "NO₂"], ["o3", "O₃"], ["so2", "SO₂"]
  ];

  function renderAirQuality(model) {
    const card = el("aqiCard");
    const aq = model.airQuality;
    if (!aq) { card.hidden = true; return; } // never fabricate unavailable data

    card.hidden = false;
    el("aqiIndex").textContent = aq.aqi;
    el("aqiCategory").textContent = AQI_LABELS[aq.aqi] || U.FALLBACK;

    const list = POLLUTANTS
      .filter(([key]) => U.isNum(aq.components[key]))
      .map(([key, label]) => `<li><strong>${aq.components[key].toFixed(1)}</strong>${label} µg/m³</li>`)
      .join("");
    el("pollutants").innerHTML = list || `<li>${U.FALLBACK}</li>`;
  }

  /* ---------------- favourites / history ---------------- */

  function tagMarkup(item, kind) {
    const label = U.escapeHtml(item.name);
    const country = item.country ? `<span class="tag-country">${U.escapeHtml(item.country)}</span>` : "";
    return `<span class="tag">
      <button type="button" class="tag-load" data-action="load" data-kind="${kind}" data-name="${label}" data-country="${U.escapeHtml(item.country || "")}" data-lat="${item.lat != null ? item.lat : ""}" data-lon="${item.lon != null ? item.lon : ""}">${label} ${country}</button>
      <button type="button" class="tag-remove" data-action="remove" data-kind="${kind}" data-name="${label}" data-country="${U.escapeHtml(item.country || "")}" aria-label="Remove ${label}">✕</button>
    </span>`;
  }

  function renderFavorites(list) {
    el("favoritesList").innerHTML = list.map((i) => tagMarkup(i, "favorite")).join("");
    el("favEmpty").hidden = list.length > 0;
  }

  function renderHistory(list) {
    el("historyList").innerHTML = list.map((i) => tagMarkup(i, "history")).join("");
    el("historyEmpty").hidden = list.length > 0;
  }

  function setFavoriteState(isFav) {
    const btn = el("favBtn");
    btn.setAttribute("aria-pressed", String(isFav));
    btn.setAttribute("aria-label", isFav ? "Remove location from favourites" : "Save location to favourites");
    if (isFav) {
      btn.classList.remove("just-saved");
      void btn.offsetWidth;
      btn.classList.add("just-saved");
    }
  }

  function renderPopular(cities) {
    const host = el("popularChips");
    cities.forEach((city) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.dataset.city = city;
      btn.textContent = city;
      host.appendChild(btn);
    });
  }

  /* ---------------- full render ---------------- */

  function renderAll(model, prefs) {
    renderCurrent(model, prefs);
    renderHourly(model, prefs);
    renderChart(model, prefs);
    renderForecast(model, prefs);
    renderInsights(model, prefs);
    renderSun(model);
    renderAirQuality(model);
    announce(`Weather loaded successfully for ${model.location.name}.`);
  }

  return {
    announce, setLoading, showEmpty, showError, hideError,
    renderAll, renderLastUpdated, renderFavorites, renderHistory,
    setFavoriteState, renderPopular
  };
})();
