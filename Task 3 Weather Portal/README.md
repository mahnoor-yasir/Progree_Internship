# AERIS Weather Portal

<p align="center">
  <strong>AERIS</strong>
</p>

<p align="center">
  Intelligent Weather Portal
</p>

<p align="center">
  Real-time weather data, responsive visualization, location-aware forecasting, and a complete client-side weather experience built with native web technologies.
</p>

<p align="center">
  <a href="https://developer.mozilla.org/en-US/docs/Web/HTML">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/CSS">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  <a href="https://openweathermap.org/api">
    <img src="https://img.shields.io/badge/OpenWeatherMap-API-orange?style=for-the-badge" alt="OpenWeatherMap API">
  </a>
</p>

<p align="center">
  <strong>Progree Frontend Development Internship</strong>
  <br>
  Task 3: Asynchronous REST API Weather Portal Application
</p>

---

## About AERIS

AERIS is a responsive single-page weather portal developed as part of the Progree Frontend Development Internship.

The application retrieves real-time weather information from the OpenWeatherMap REST API and transforms the returned data into a structured weather dashboard.

The project is intentionally built without React, Vue, Angular, Node.js, Express, or a frontend build system.

The application runs directly in the browser using:

- HTML5
- CSS3
- Vanilla JavaScript ES6+
- Fetch API
- async/await
- OpenWeatherMap REST APIs
- LocalStorage
- Browser Geolocation API
- Inline SVG visualization

AERIS goes beyond displaying a single temperature value. It provides a complete weather experience with current conditions, hourly information, multi-day forecasting, weather metrics, temperature visualization, sunrise and sunset information, location management, preferences, caching, loading states, error handling, and responsive behaviour.

---

## Internship Task

<table>
<tr>
<td width="50%">

### Task

**Task 3**

</td>
<td width="50%">

### Project Type

**Asynchronous REST API Weather Portal**

</td>
</tr>

<tr>
<td>

### Internship

**Frontend Development Internship**

</td>
<td>

### Organization

**Progree**

</td>
</tr>
</table>

---

# Project Highlights

<table>
<tr>
<td width="33%" align="center">

### Weather Data

Real-time weather information retrieved from OpenWeatherMap REST APIs.

</td>

<td width="33%" align="center">

### Async API

Fetch API with `async/await`, `Promise.all()`, error mapping, and request timeouts.

</td>

<td width="33%" align="center">

### Responsive UI

Mobile-first responsive interface designed from 320px to large desktop screens.

</td>
</tr>

<tr>
<td width="33%" align="center">

### Smart Search

City search, geolocation, popular locations, recent searches, and favourites.

</td>

<td width="33%" align="center">

### Weather Analytics

Hourly outlook, five-day forecast, temperature trend, metrics, and weather insights.

</td>

<td width="33%" align="center">

### Persistent Preferences

Theme, units, favourites, history, cache, and preferences stored locally.

</td>
</tr>
</table>

---

# Core Features

## Real-Time Weather

AERIS retrieves live weather information from the OpenWeatherMap service.

The current weather dashboard provides:

- City name
- Country
- Current temperature
- Feels-like temperature
- Weather condition
- Weather description
- Weather icon
- Humidity
- Wind speed
- Wind direction
- Atmospheric pressure
- Visibility
- Cloud coverage
- Sunrise
- Sunset
- Local date
- Local time

The application uses the location's timezone offset from the API instead of relying on the viewer's local timezone.

---

## Hourly Weather Outlook

The application processes forecast data into an hourly weather outlook.

The interface displays:

- Time
- Temperature
- Weather icon
- Weather condition
- Probability of precipitation

The hourly section is designed as a horizontally scrollable interface so that multiple forecast points remain accessible on smaller screens.

---

## Five-Day Forecast

AERIS processes the OpenWeatherMap three-hour forecast data and groups forecast entries by calendar day.

Each forecast day can display:

- Day name
- Date
- High temperature
- Low temperature
- Weather condition
- Weather icon
- Probability of precipitation

The current day is visually distinguished from the remaining forecast days.

---

## Temperature Trend

AERIS includes a custom temperature trend visualization.

Instead of using a third-party charting library, the project generates the chart using SVG elements.

The visualization is regenerated whenever the weather data or selected temperature unit changes.

This keeps the visualization lightweight and completely controlled by the application.

---

## Weather Metrics

The current weather dashboard includes several detailed metric cards.

### Humidity

Humidity is displayed as a percentage with a visual progress indicator.

### Wind

Wind information includes:

- Speed
- Direction
- Compass representation
- Degree value

The compass indicator rotates according to the wind direction returned by the API.

### Atmospheric Pressure

Pressure is displayed in hectopascals.

The application also provides a contextual note:

- Low
- Normal range
- High

### Visibility

Visibility is converted according to the selected unit system.

The interface provides contextual descriptions such as:

- Excellent clarity
- Moderate haze
- Reduced visibility
- Poor visibility

### Cloud Coverage

Cloud coverage is displayed as a percentage.

### Sunrise and Sunset

The dashboard provides sunrise and sunset information based on the weather service's location-aware timestamps.

---

# Air Quality

AERIS optionally retrieves air pollution information through the OpenWeatherMap Air Pollution endpoint.

When available, the interface can display:

- AQI
- PM2.5
- PM10
- CO
- NO₂
- O₃

Air-quality information is treated as optional.

If the endpoint is unavailable or the account plan does not provide access, the weather dashboard continues working normally.

This prevents air-quality availability from breaking the main weather experience.

---

# Location Search

Users can search for a city using the main search interface.

The search flow is:

```text
User Query
    ↓
Input Sanitization
    ↓
Geocoding API
    ↓
Coordinates
    ↓
Current Weather + Forecast
    ↓
Data Transformation
    ↓
Dashboard Rendering
````

The search query is normalized before it is sent to the API.

The application:

* Removes unnecessary whitespace
* Trims the query
* Rejects empty queries
* Rejects excessively long queries
* Requires alphabetic characters
* Limits input length to 80 characters

This prevents malformed searches from unnecessarily reaching the API.

---

# Geocoding

AERIS uses OpenWeatherMap Geocoding APIs to convert city names into coordinates.

### Forward Geocoding

City name:

```text
Lahore
```

becomes:

```text
Latitude
Longitude
Country
State
City
```

The coordinates are then used to retrieve weather information.

---

## Reverse Geocoding

The application can also convert browser geolocation coordinates into a readable location.

This allows the "Use My Location" feature to display a meaningful city and country rather than only showing latitude and longitude.

Reverse geocoding is treated as a non-critical operation.

If reverse geocoding fails, the weather data can still be displayed using the location information returned by the weather endpoint.

---

# Use My Location

AERIS integrates the browser's Geolocation API.

The user can request weather for their current location.

The application handles:

* Permission granted
* Permission denied
* Position unavailable
* Geolocation timeout
* Other geolocation errors

The application also remembers a denied permission state so that it does not repeatedly prompt the user during the same session.

---

# Popular Cities

The application provides quick-access locations.

The configured popular cities include:

<table>
<tr>
<td>

Lahore

</td>
<td>

Islamabad

</td>
<td>

Karachi

</td>
<td>

Dubai

</td>
</tr>

<tr>
<td>

London

</td>
<td>

New York

</td>
<td>

Tokyo

</td>
<td>

Paris

</td>
</tr>
</table>

Selecting a city performs a real weather search through the API.

---

# Recent Searches

AERIS stores recent locations locally.

The recent-search system allows users to:

* Reopen a previous location
* Remove individual locations
* Clear the complete search history

The application limits the stored history using the configured maximum history value.

---

# Favourite Locations

Users can save frequently used locations as favourites.

Favourite functionality includes:

* Add location
* Remove location
* Open favourite
* Clear favourites

Favourite locations are stored using LocalStorage.

The configured maximum is:

```text
12 favourite locations
```

---

# Unit Switching

AERIS supports multiple display units.

## Temperature

```text
°C
°F
```

The application retrieves weather data in metric format and performs display-side temperature conversion.

This means switching between Celsius and Fahrenheit does not require another API request.

---

## Wind Speed

Supported wind units include:

```text
km/h
m/s
mph
```

Wind conversion is performed on the client side.

---

# Theme System

AERIS supports three theme preferences:

<table>
<tr>
<td align="center">

### Light

Light interface theme.

</td>

<td align="center">

### Dark

Dark interface theme.

</td>

<td align="center">

### System

Follows the operating system preference.

</td>
</tr>
</table>

The selected theme is persisted using LocalStorage.

When the system option is selected, the application checks:

```javascript
prefers-color-scheme
```

and applies the corresponding theme.

---

# Reduced Motion

The application respects reduced-motion preferences.

A user can also enable the manual reduced-motion setting.

This affects animated behaviour and allows users who prefer less movement to use the interface more comfortably.

---

# Auto Refresh

AERIS provides optional automatic weather refresh.

The configured refresh interval is:

```text
10 minutes
```

Auto refresh is intentionally conservative.

It only operates while the browser tab is visible.

This avoids unnecessary background API requests.

---

# Manual Refresh

Users can manually refresh the currently selected weather location.

The refresh action reuses the last successful search query.

A loading state is displayed while the request is being processed.

---

# Client-Side Caching

AERIS implements a browser-side response cache.

Cached responses contain:

* Weather data
* Timestamp

The configured cache freshness period is:

```text
10 minutes
```

If a fresh cached response exists, the application can reuse it instead of immediately requesting the same data again.

This helps reduce unnecessary API calls.

---

# Loading Experience

The application includes a dedicated loading state.

During a fresh request:

* Search is disabled
* The search button indicates busy state
* Loading UI is displayed
* Previous error messages are hidden
* The user receives status feedback

When refreshing an existing dashboard, AERIS can keep the current dashboard visible while the new request is processed.

---

# Error Handling

Error handling is one of the central parts of the AERIS architecture.

The API layer converts different failures into typed application errors.

Supported error categories include:

<table>
<tr>
<th>Error</th>
<th>Meaning</th>
</tr>

<tr>
<td><code>NO_KEY</code></td>
<td>OpenWeatherMap API key is missing.</td>
</tr>

<tr>
<td><code>AUTH</code></td>
<td>The API key is invalid or inactive.</td>
</tr>

<tr>
<td><code>NOT_FOUND</code></td>
<td>The requested location could not be found.</td>
</tr>

<tr>
<td><code>RATE_LIMIT</code></td>
<td>The weather service request limit has been reached.</td>
</tr>

<tr>
<td><code>NETWORK</code></td>
<td>The browser could not connect to the weather service.</td>
</tr>

<tr>
<td><code>TIMEOUT</code></td>
<td>The API request exceeded the configured timeout.</td>
</tr>

<tr>
<td><code>SERVER</code></td>
<td>The weather service returned a server-side failure.</td>
</tr>

<tr>
<td><code>UNKNOWN</code></td>
<td>An unexpected response or processing problem occurred.</td>
</tr>
</table>

---

# Request Timeout

AERIS uses `AbortController` to prevent requests from remaining active indefinitely.

The configured request timeout is:

```text
12 seconds
```

If the request exceeds this duration, it is cancelled and converted into a typed timeout error.

---

# Duplicate Request Protection

The application maintains an in-flight request state.

If another search is triggered while an existing request is still active, the duplicate request is ignored.

This prevents rapid repeated clicks from creating unnecessary concurrent requests.

---

# Parallel API Requests

Current weather and forecast data are loaded concurrently.

The API layer uses:

```javascript
Promise.all([
  fetchCurrentWeather(lat, lon),
  fetchForecast(lat, lon)
])
```

This allows both requests to execute in parallel instead of waiting for one request to finish before starting the other.

The result is then transformed into a common application view model.

---

# Data Transformation

Raw OpenWeatherMap responses are not rendered directly throughout the UI.

Instead, the API layer converts them into a structured view model.

The transformation separates:

```text
Raw API Response
        ↓
Validation
        ↓
Normalization
        ↓
View Model
        ↓
UI Rendering
```

This makes the interface less dependent on the exact structure of the API response.

---

# Defensive Data Handling

AERIS uses defensive access helpers to prevent missing API properties from causing runtime failures.

When data is unavailable, the interface can display:

```text
Unavailable
```

instead of exposing:

```text
undefined
```

or breaking the dashboard.

This approach is especially important for optional weather properties such as:

* Wind gust
* Rain
* Snow
* Visibility
* Air quality
* Optional API fields

---

# Location-Aware Time

Weather timestamps are converted using the timezone offset supplied by the weather API.

The application does not simply use the viewer's local timezone.

This means a user in Pakistan viewing weather for London can still see London's local weather time.

The system is used for:

* Current local time
* Weather date
* Hourly forecast times
* Sunrise
* Sunset
* Forecast day grouping

---

# Responsive Design

AERIS is designed for a wide range of screen sizes.

The responsive CSS includes dedicated behaviour for:

<table>
<tr>
<th>Range</th>
<th>Purpose</th>
</tr>

<tr>
<td>320px+</td>
<td>Minimum supported mobile layout</td>
</tr>

<tr>
<td>375px</td>
<td>Small mobile adjustments</td>
</tr>

<tr>
<td>576px</td>
<td>Compact mobile/tablet transition</td>
</tr>

<tr>
<td>768px</td>
<td>Tablet layout</td>
</tr>

<tr>
<td>992px</td>
<td>Expanded tablet/smaller desktop layout</td>
</tr>

<tr>
<td>1200px</td>
<td>Desktop refinement</td>
</tr>

<tr>
<td>1440px+</td>
<td>Large desktop presentation</td>
</tr>
</table>

The layout uses:

* CSS Grid
* Flexbox
* Fluid sizing
* Responsive spacing
* Flexible cards
* Horizontal forecast scrolling
* Responsive navigation
* Mobile-first adjustments

---

# Accessibility

Accessibility is incorporated into the interface rather than treated only as visual styling.

The project includes:

* Semantic HTML5
* ARIA labels
* Accessible form controls
* Keyboard navigation
* Visible focus states
* Live status messaging
* `aria-busy`
* `aria-pressed`
* Accessible buttons
* Reduced-motion support
* Screen-reader-oriented status updates

The application uses a live status region to announce important loading and error messages.

The project does not claim formal WCAG certification.

---

# Atmospheric UI

AERIS changes its visual atmosphere according to weather conditions.

The utility layer maps OpenWeatherMap weather information into atmosphere categories such as:

```text
clear
clouds
rain
storm
snow
mist
night
default
```

This allows the dashboard background treatment to reflect the current weather state.

---

# Weather Condition Mapping

The application interprets OpenWeatherMap condition identifiers.

Examples include:

```text
200–299 → Storm
300–599 → Rain
600–699 → Snow
700–799 → Mist / Atmosphere
800     → Clear
Night   → Night atmosphere
```

The mapping is handled client-side.

---

# Data Persistence

AERIS uses LocalStorage for lightweight client-side persistence.

The application stores information for:

<table>
<tr>
<td>

### Preferences

Temperature unit, wind unit, theme, reduced motion, auto refresh.

</td>

<td>

### History

Recently searched locations.

</td>

</tr>

<tr>
<td>

### Favourites

Saved locations.

</td>

<td>

### Cache

Cached weather responses with timestamps.

</td>

</tr>

<tr>
<td colspan="2">

### Last Location

The last viewed weather location can be restored after reload.

</td>
</tr>
</table>

---

# LocalStorage Safety

The LocalStorage layer checks whether browser storage is available.

If LocalStorage is disabled or unavailable, the application falls back to in-memory storage instead of allowing storage errors to break the interface.

This is particularly useful in restrictive browser environments or private browsing scenarios.

---

# API Architecture

The weather API layer is centralized in `js/api.js`.

The API layer is responsible for:

* API key validation
* URL construction
* Fetch requests
* Request timeout
* HTTP status handling
* JSON parsing
* City geocoding
* Reverse geocoding
* Current weather
* Forecast
* Air quality
* Data transformation

The UI layer does not perform network requests directly.

This separation keeps responsibilities clear.

---

# Application Layers

AERIS follows a lightweight layered architecture.

<table>
<tr>
<th>Layer</th>
<th>Responsibility</th>
</tr>

<tr>
<td><strong>Configuration</strong></td>
<td>API endpoints, timeout, cache, refresh and application limits.</td>
</tr>

<tr>
<td><strong>Utilities</strong></td>
<td>Formatting, validation, conversion, date/time and helper functions.</td>
</tr>

<tr>
<td><strong>Storage</strong></td>
<td>Preferences, history, favourites, cache and last-location persistence.</td>
</tr>

<tr>
<td><strong>API</strong></td>
<td>Network requests, status handling and API response transformation.</td>
</tr>

<tr>
<td><strong>UI</strong></td>
<td>DOM rendering, loading states, errors and dashboard updates.</td>
</tr>

<tr>
<td><strong>Application Controller</strong></td>
<td>State management, event handling and orchestration.</td>
</tr>
</table>

---

# Separation of Responsibilities

The application intentionally separates:

```text
API requests
      ↓
Data transformation
      ↓
Application state
      ↓
UI rendering
```

This prevents network logic from becoming tightly coupled to individual DOM components.

---

# Utility Layer

The utility module provides reusable functionality for:

* Safe nested property access
* Numeric validation
* HTML escaping
* Search sanitization
* Temperature conversion
* Wind conversion
* Compass direction
* Pressure formatting
* Visibility formatting
* Date formatting
* Time formatting
* Relative timestamps
* Weather icon URLs
* Atmospheric condition mapping
* Debouncing
* Title casing

---

# Search Validation

Search queries are normalized before being used.

A valid query must:

* Contain text
* Not be empty
* Be no longer than 80 characters
* Contain at least one Unicode letter

Whitespace is normalized before the request.

This creates a cleaner and more predictable search flow.

---

# Weather Icon System

AERIS retrieves weather icons from OpenWeatherMap using the icon code returned by the API.

The application constructs the image URL dynamically.

The UI also uses the weather icon code to determine the atmospheric background state.

---

# Browser APIs Used

The project uses several native browser capabilities.

### Fetch API

Used for asynchronous REST communication.

### AbortController

Used to cancel timed-out API requests.

### Geolocation API

Used for the "Use My Location" feature.

### LocalStorage

Used for client-side persistence.

### IntersectionObserver

Used for viewport-related UI behaviour such as animated content.

### matchMedia

Used to detect the system dark-mode preference.

### Visibility API

Used to avoid unnecessary automatic refresh while the browser tab is hidden.

---

# Getting Started

## Requirements

You only need:

* A modern web browser
* Internet connection
* An OpenWeatherMap API key

No Node.js installation is required.

No npm packages are required.

No build tool is required.

No backend server is required.

---

# API Configuration

The application reads its API configuration from:

```text
js/config.js
```

The configuration contains:

```javascript
window.AERIS_CONFIG = {
  API_KEY: "YOUR_OPENWEATHERMAP_API_KEY",

  BASE_URL: "https://api.openweathermap.org/data/2.5",
  GEO_URL: "https://api.openweathermap.org/geo/1.0",
  ICON_URL: "https://openweathermap.org/img/wn"
};
```

Additional configuration includes:

```text
REQUEST_TIMEOUT_MS
CACHE_TTL_MS
AUTO_REFRESH_MS
MAX_HISTORY
MAX_FAVORITES
POPULAR_CITIES
```

---

# How to Configure the API

### Step 1

Create an OpenWeatherMap account.

Official website:

[https://openweathermap.org/](https://openweathermap.org/)

### Step 2

Create or obtain an API key.

### Step 3

Open:

```text
js/config.js
```

### Step 4

Replace:

```javascript
API_KEY: "YOUR_OPENWEATHERMAP_API_KEY"
```

with your own API key.

### Step 5

Save the file.

### Step 6

Open the application in your browser.

---

# Running the Application

Because AERIS is a static frontend application, it does not require a build process.

You can open:

```text
index.html
```

directly in a browser.

For development, using a local server such as VS Code Live Server is recommended.

---

# VS Code Live Server

A simple development workflow is:

1. Open the project folder in Visual Studio Code.
2. Install or use the Live Server extension.
3. Open `index.html`.
4. Start Live Server.
5. Open the generated local URL.
6. Search for a city.
7. Verify that live weather data loads.

---

# Recommended Demo Flow

For a complete demonstration, follow this sequence.

### 01. Open the Application

Launch the AERIS weather portal.

### 02. Search a City

Try:

```text
Lahore
```

or another valid city.

### 03. Check Current Weather

Verify:

* Temperature
* Condition
* Feels-like temperature
* Humidity
* Wind
* Pressure
* Visibility
* Clouds

### 04. Check Hourly Forecast

Scroll through the hourly weather outlook.

### 05. Check Temperature Trend

Review the SVG-based temperature chart.

### 06. Check Five-Day Forecast

Review daily high, low, condition, and precipitation probability.

### 07. Test Units

Switch:

```text
°C ↔ °F
```

and:

```text
km/h ↔ m/s ↔ mph
```

### 08. Test Theme

Switch:

```text
Light
Dark
System
```

### 09. Test Favourites

Save a location and reload the page.

### 10. Test Recent Searches

Search multiple cities and revisit them from history.

### 11. Test Geolocation

Use the location feature and grant browser permission if desired.

### 12. Test Refresh

Use the manual refresh button.

### 13. Test Error Handling

Try an invalid city or temporarily unavailable network connection.

The interface should show a meaningful error state rather than crashing.

---

# Error Scenarios

AERIS is designed to handle several real-world failure conditions.

| Scenario                 | Expected Behaviour             |
| ------------------------ | ------------------------------ |
| Empty search             | Search is rejected             |
| Invalid query            | Validation message             |
| Unknown city             | Location not found state       |
| Missing API key          | Configuration error            |
| Invalid API key          | Authentication error           |
| Network failure          | Connection error               |
| Slow API                 | Timeout message                |
| API rate limit           | Rate-limit message             |
| Server failure           | Service unavailable message    |
| Geolocation denied       | Location error state           |
| Optional AQI unavailable | AQI section handled gracefully |

---

# Performance Considerations

Several implementation choices help keep the application efficient.

### Parallel Requests

Current weather and forecast requests use `Promise.all()`.

### Client-Side Cache

Fresh responses can be reused for up to ten minutes.

### Duplicate Request Guard

Repeated requests are prevented while another request is active.

### Optional Auto Refresh

Automatic refresh is disabled by default and uses a conservative ten-minute interval.

### Visibility Awareness

Automatic refresh does not continue unnecessarily while the browser tab is hidden.

### Lightweight Visualization

The temperature trend is generated with SVG rather than adding a charting dependency.

---

# Data Flow

The complete weather data flow can be summarized as:

```text
User Search
     ↓
Query Sanitization
     ↓
Geocoding
     ↓
Latitude + Longitude
     ↓
┌───────────────────────┐
│                       │
│ Current Weather       │
│ Forecast              │
│ Air Quality (optional)│
│                       │
└───────────────────────┘
     ↓
Response Validation
     ↓
View Model Transformation
     ↓
Cache + State
     ↓
UI Rendering
     ↓
Weather Dashboard
```

---

# Why This Architecture?

The application avoids placing everything inside a single JavaScript file.

Each major responsibility has its own layer.

This makes the code easier to:

* Understand
* Debug
* Maintain
* Extend
* Test
* Reuse

For example, the UI layer does not need to know how an API request is constructed.

Similarly, the API layer does not need to manipulate DOM elements.

---

# Design Principles

The implementation follows several practical frontend principles.

## Separation of Concerns

Network, storage, state, utilities, and UI responsibilities are separated.

## Defensive Programming

Missing API data is handled safely.

## Progressive Enhancement

Optional functionality such as air quality does not prevent the main weather dashboard from working.

## User Feedback

Loading, success, and error states are communicated through the interface.

## Responsive Design

The layout adapts to different viewport sizes.

## Accessibility Awareness

Keyboard, focus, ARIA, and reduced-motion behaviour are included.

## Client-Side Efficiency

Caching and duplicate-request protection reduce unnecessary API calls.

---

# Limitations

AERIS is a frontend internship project and therefore has several intentional limitations.

### No Backend

All application logic runs in the browser.

### Browser-Visible API Key

A static frontend cannot truly hide an API key.

### LocalStorage Persistence

User preferences and saved locations are stored locally on the current browser/device.

### No User Accounts

There is no server-side authentication.

### API Dependency

Weather data depends on OpenWeatherMap availability and API limits.

### Optional Air Quality

Air-quality information may not be available depending on API access and endpoint availability.

---

# Security Considerations

Because this is a static frontend application, the OpenWeatherMap API key is accessible to anyone who can inspect the deployed JavaScript.

For a production system, API requests should be proxied through a backend service.

The backend could:

* Keep the API key private
* Validate requests
* Apply rate limiting
* Monitor usage
* Protect API credentials

For this internship project, the browser-side API key is an accepted limitation of a static frontend implementation.

---

# Important API Key Note

**Never commit a real API key to a public GitHub repository.**

Before publishing the project publicly:

1. Remove the real key from `js/config.js`.
2. Replace it with a placeholder.
3. Rotate the exposed key through the OpenWeatherMap dashboard.
4. Add the configuration file to `.gitignore` if appropriate.
5. Use an environment-aware backend/proxy for production deployments.

Example:

```javascript
window.AERIS_CONFIG = {
  API_KEY: "YOUR_OPENWEATHERMAP_API_KEY"
};
```

---

# Educational Purpose

AERIS was created to demonstrate practical frontend development skills through a real API-driven application.

The project demonstrates the complete lifecycle of a frontend API application:

```text
Design
  ↓
User Input
  ↓
Validation
  ↓
API Communication
  ↓
Data Transformation
  ↓
State Management
  ↓
Dynamic Rendering
  ↓
Error Handling
  ↓
Persistence
  ↓
Responsive Experience
```

---

# Learning Outcomes

Through this project, the following practical concepts are demonstrated:

<table>
<tr>
<td width="50%">

### Frontend Development

* Semantic HTML5
* CSS3
* Responsive design
* Flexbox
* CSS Grid
* CSS variables
* Animations
* UI states

</td>

<td width="50%">

### JavaScript

* ES6+
* Async/await
* Promises
* Fetch API
* DOM manipulation
* Event handling
* LocalStorage
* Browser APIs

</td>
</tr>

<tr>
<td>

### API Development

* REST APIs
* Query parameters
* HTTP status handling
* JSON parsing
* Timeout handling
* API response transformation

</td>

<td>

### UX and Reliability

* Loading states
* Error states
* Input validation
* Accessibility
* Reduced motion
* Responsive behaviour
* Defensive rendering

</td>
</tr>
</table>

---

# Future Improvements

The current project can be extended with additional production-oriented capabilities.

Potential improvements include:

* Backend API proxy
* Secure API key management
* User accounts
* Cloud-synced favourites
* Weather alerts
* Severe weather notifications
* More detailed historical weather
* Extended forecast visualizations
* Interactive map integration
* PWA support
* Offline weather cache
* Service worker support
* Automated unit tests
* End-to-end testing
* API mocking for development
* CI/CD deployment
* Server-side analytics

These are future possibilities and are not presented as existing functionality.

---

# Project Quality Checklist

<table>
<tr>
<td>✓</td>
<td>Semantic HTML5</td>
</tr>

<tr>
<td>✓</td>
<td>Responsive CSS</td>
</tr>

<tr>
<td>✓</td>
<td>Vanilla JavaScript ES6+</td>
</tr>

<tr>
<td>✓</td>
<td>REST API integration</td>
</tr>

<tr>
<td>✓</td>
<td>Fetch API</td>
</tr>

<tr>
<td>✓</td>
<td>async/await</td>
</tr>

<tr>
<td>✓</td>
<td>AbortController timeout handling</td>
</tr>

<tr>
<td>✓</td>
<td>HTTP error mapping</td>
</tr>

<tr>
<td>✓</td>
<td>Loading states</td>
</tr>

<tr>
<td>✓</td>
<td>Error states</td>
</tr>

<tr>
<td>✓</td>
<td>Dynamic DOM rendering</td>
</tr>

<tr>
<td>✓</td>
<td>Geolocation</td>
</tr>

<tr>
<td>✓</td>
<td>Recent searches</td>
</tr>

<tr>
<td>✓</td>
<td>Favourite locations</td>
</tr>

<tr>
<td>✓</td>
<td>LocalStorage persistence</td>
</tr>

<tr>
<td>✓</td>
<td>Client-side caching</td>
</tr>

<tr>
<td>✓</td>
<td>Temperature unit switching</td>
</tr>

<tr>
<td>✓</td>
<td>Wind unit switching</td>
</tr>

<tr>
<td>✓</td>
<td>Theme preferences</td>
</tr>

<tr>
<td>✓</td>
<td>Reduced-motion support</td>
</tr>

<tr>
<td>✓</td>
<td>Responsive weather dashboard</td>
</tr>

<tr>
<td>✓</td>
<td>SVG temperature visualization</td>
</tr>

<tr>
<td>✓</td>
<td>Five-day forecast</td>
</tr>

<tr>
<td>✓</td>
<td>Hourly forecast</td>
</tr>

<tr>
<td>✓</td>
<td>Optional air-quality integration</td>
</tr>
</table>

---

# Internship Information

<table>
<tr>
<td width="50%">

**Organization**

Progree

</td>

<td width="50%">

**Domain**

Frontend Development

</td>
</tr>

<tr>
<td>

**Task**

Task 3

</td>

<td>

**Project**

AERIS Intelligent Weather Portal

</td>
</tr>

<tr>
<td>

**Application Type**

Single-Page Weather Portal

</td>

<td>

**Architecture**

Frontend-only

</td>
</tr>
</table>

---

# Author

## Mahnoor Yasir

Frontend Development Intern

Developed as part of the **Progree Frontend Development Internship**.

---

# Acknowledgement

This project was developed as part of the Progree Frontend Development Internship program.

The project provided practical experience in building an API-driven frontend application using native web technologies and real external weather data.

---

# License

This project is intended for educational and internship purposes.

---

<p align="center">
  <strong>AERIS</strong>
  <br>
  Intelligent Weather Portal
  <br><br>
  Built with HTML5, CSS3, Vanilla JavaScript and OpenWeatherMap.
</p>
