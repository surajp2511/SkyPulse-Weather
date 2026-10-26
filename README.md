# 🌤️ SkyPulse Weather

> **An interactive, glassmorphic real-time weather forecasting web application paired with an in-browser REST API Inspector and Key Testing Lab.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript ES6+](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenWeatherMap API](https://img.shields.io/badge/OpenWeatherMap-API-orange?style=for-the-badge&logo=cloud&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 📑 Table of Contents
1. [Detailed Project Description](#-detailed-project-description)
   - [What Am I Building?](#what-am-i-building)
   - [Why This Project Matters](#why-this-project-matters)
2. [API Keys Explained in Detail](#-api-keys-explained-in-detail)
   - [What is an API Key?](#what-is-an-api-key)
   - [Where the API Key is Configured in This Project](#where-the-api-key-is-configured-in-this-project)
   - [Activation Delays & Gotchas](#activation-delays--gotchas)
   - [Best Practices & Security Considerations](#best-practices--security-considerations)
3. [API Testing: How to Test & Verify Weather APIs](#-api-testing-how-to-test--verify-weather-apis)
   - [Method 1: Direct Browser URL Verification](#method-1-direct-browser-url-verification)
   - [Method 2: Browser Developer Tools (Network Tab)](#method-2-browser-developer-tools-network-tab)
   - [Method 3: Terminal Command Line Testing (cURL / PowerShell)](#method-3-terminal-command-line-testing-curl--powershell)
   - [Method 4: In-App Interactive API Inspector & Testing Lab](#method-4-in-app-interactive-api-inspector--testing-lab)
4. [Where & How the API is Used in the Codebase](#-where--how-the-api-is-used-in-the-codebase)
   - [The Endpoint](#the-endpoint)
   - [Query Parameters Breakdown](#query-parameters-breakdown)
   - [Code Walkthrough (`app.js`)](#code-walkthrough-appjs)
   - [Data Extraction & DOM Mapping Table](#data-extraction--dom-mapping-table)
5. [How This Web Application Works (Step-by-Step Lifecycle)](#-how-this-web-application-works-step-by-step-lifecycle)
   - [Phase 1: Application Boot & Default City Fetch](#phase-1-application-boot--default-city-fetch)
   - [Phase 2: User Search & Event Handling](#phase-2-user-search--event-handling)
   - [Phase 3: Network Dispatch & Latency Measurement](#phase-3-network-dispatch--latency-measurement)
   - [Phase 4: Error Handling & HTTP Status Branching](#phase-4-error-handling--http-status-branching)
   - [Phase 5: Rendering Weather Metrics & Dynamic Theming](#phase-5-rendering-weather-metrics--dynamic-theming)
   - [Phase 6: Live API Inspector Updates](#phase-6-live-api-inspector-updates)
   - [Phase 7: Real-Time Unit Switching (°C vs °F)](#phase-7-real-time-unit-switching-c-vs-f)
6. [Key Features & Visual Design](#-key-features--visual-design)
7. [Project File Structure](#-project-file-structure)
8. [How to Run This Project Locally](#-how-to-run-this-project-locally)
9. [Sample Raw API JSON Response](#-sample-raw-api-json-response)
10. [License](#-license)

---

## 📖 Detailed Project Description

### What Am I Building?
**SkyPulse Weather** is a modern, responsive web application that provides real-time global weather forecasts while simultaneously serving as an interactive learning laboratory for web APIs and HTTP communication. 

Instead of building a barebones weather widget that only displays a single temperature number, this project builds:
1. **A Full Meteorological Dashboard**: Delivers in-depth atmospheric measurements including actual temperature, "feels-like" temperature, daily high/low variations, relative humidity, wind speed, atmospheric air pressure, optical visibility distance, and astronomical sunrise/sunset times calculated against the city's local timezone.
2. **Dynamic Atmospheric Theming**: The entire user interface fluidly shifts its ambient lighting and background gradients according to current outdoor weather categories (Clear skies, Overcast clouds, Rain, Drizzle, Thunderstorms, Snow, or Mist/Fog).
3. **An Integrated API Inspector & Testing Lab**: Built directly into the bottom of the webpage, this developer tool exposes the inner workings of REST APIs. It lets users see the exact HTTP request URL, view the HTTP status code (`200 OK`, `401 Unauthorized`, `404 Not Found`), track round-trip network latency in milliseconds, test alternative API keys live on the page, and inspect the raw formatted JSON payload returned by OpenWeatherMap's remote servers.

### Why This Project Matters
For beginners and aspiring developers, understanding how the browser communicates with external services via `fetch()`, `async/await`, HTTP headers, and JSON parsing is one of the most critical foundational milestones in modern software engineering. SkyPulse Weather makes this invisible data exchange completely visible and interactive.

---

## 🔑 API Keys Explained in Detail

### What is an API Key?
An **API Key (Application Programming Interface Key)** is a unique, alphanumeric cryptographic token generated by a service provider (in this case, [OpenWeatherMap](https://openweathermap.org/)). 

Think of an API Key like a **digital VIP pass or driver's license**:
* **Identity & Authentication**: When your web app reaches out across the internet to OpenWeatherMap's servers, the server needs to know *who* is making the request. The API key proves your identity.
* **Usage & Rate Limiting**: Weather data services handle millions of queries per second. OpenWeatherMap uses your API key to monitor how many requests you make per minute (e.g., 60 calls/minute on the Free tier) to prevent server overload and abuse.
* **Access Control**: The key determines which data services your account is permitted to access (e.g., current weather data vs. paid historical archives).

### Where the API Key is Configured in This Project
Inside [`app.js`](file:///d:/Projects/SkyPulse%20Weather/app.js), the API key is declared right at the top of the file:

```javascript
// --- 1. CONFIGURATION & CONSTANTS ---
// Your OpenWeatherMap API key (from your subscription email)
const DEFAULT_API_KEY = "add9e86e8473c27a82ff6a87159bedd0";

// Base URL for current weather data
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Application State holding current active key
let currentApiKey = DEFAULT_API_KEY;
```

When building the final request string, the application embeds this key as the `appid` query parameter:
```javascript
const requestUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${currentApiKey}&units=${currentUnit}`;
```

### Activation Delays & Gotchas
When you first register an account on OpenWeatherMap and generate a brand-new API key, the key is **not always functional immediately**:
* **Global CDN Propagation**: OpenWeatherMap uses a distributed worldwide server network. It often takes **10 minutes to 2 hours** for a newly created key to replicate across all global edge servers.
* **The 401 Error**: If you query the API immediately after generating a key, the server may reply with an HTTP `401 Unauthorized` status error code (`Invalid API key`). Once the key has propagated, it automatically returns `200 OK`.

### Best Practices & Security Considerations
* **Client-Side vs. Server-Side Keys**: Because this is a pure front-end application (HTML/CSS/JS), the API key is visible in browser network requests. For free or educational projects, this is standard practice.
* **Production Environments**: In commercial production applications, API keys are kept secret on a backend server (Node.js, Express, Next.js, Python) using environment variables (`.env`). The front-end makes requests to its own backend proxy, which then calls OpenWeatherMap with the hidden key.
* **API Testing Input**: To make testing easy, this project features an in-app input box where anyone can test their own custom API keys without modifying the source code.

---

## 🧪 API Testing: How to Test & Verify Weather APIs

Testing APIs allows you to verify that your key is active, verify endpoint reachability, and inspect the structure of the data before writing UI code. Here are **4 methods** used in this project:

### Method 1: Direct Browser URL Verification
Because fetching current weather uses an **HTTP `GET`** request, you can test it directly in any web browser without any special tools:

1. Copy the parameterized URL below:
   ```text
   https://api.openweathermap.org/data/2.5/weather?q=London&appid=add9e86e8473c27a82ff6a87159bedd0&units=metric
   ```
2. Paste it into your browser's address bar (Chrome, Edge, Firefox, Brave) and press **Enter**.
3. **What You Should See**:
   * If your key is active: A complete JSON object starting with `{"coord":...}`.
   * If your key is invalid or unactivated: `{"cod":401, "message": "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info."}`.
   * If the city does not exist: `{"cod":"404", "message": "city not found"}`.

### Method 2: Browser Developer Tools (Network Tab)
While using the SkyPulse Weather application:
1. Open the web app in your browser (`http://localhost:5173` or double-click `index.html`).
2. Press `F12` (or Right-Click &rarr; **Inspect**) to open Developer Tools.
3. Switch to the **Network** tab at the top.
4. Filter by **Fetch/XHR**.
5. Type any city name (e.g. `Tokyo`) in the search bar and press **Enter**.
6. You will see a network request named `weather?q=Tokyo...`:
   * Click on it to inspect **Headers** (request method `GET`, status `200 OK`).
   * Click the **Response** or **Preview** tab to explore the hierarchical JSON tree with collapsable properties (`main`, `weather`, `wind`, `sys`).

### Method 3: Terminal Command Line Testing (cURL / PowerShell)
You can test the API directly from your terminal using `curl`:

```bash
# Windows PowerShell / macOS / Linux
curl -s "https://api.openweathermap.org/data/2.5/weather?q=London&appid=add9e86e8473c27a82ff6a87159bedd0&units=metric"
```

If successful, the raw JSON payload will be printed to your terminal stdout.

### Method 4: In-App Interactive API Inspector & Testing Lab
SkyPulse Weather includes a custom **API Inspector** drawer at the bottom of the card:
* **Live Status Badge**: Displays green `200 OK` or red `404 Not Found` / `401 Unauthorized`.
* **Latency Counter**: Displays how many milliseconds (`ms`) the network round-trip took.
* **Live URL Preview**: Shows the exact formatted query string with a 1-click `"Open in New Tab"` link.
* **Key Testing Input**: Enter any key and click **"Apply & Test"** to test different accounts on the fly.
* **Formatted JSON Code Block**: Color-coded, syntax-indented JSON representation with a **"Copy JSON"** button.

---

## 💻 Where & How the API is Used in the Codebase

### The Endpoint
The primary service endpoint utilized is OpenWeatherMap's **Current Weather Data API**:
```text
https://api.openweathermap.org/data/2.5/weather
```

### Query Parameters Breakdown
When constructing the request string:
```text
https://api.openweathermap.org/data/2.5/weather?q=London&appid=add9e86e8473c27a82ff6a87159bedd0&units=metric
│                             │                │        │                                │            │
└────────── Host ─────────────┴─── Endpoint ───┴─ City ─┴────────── API Key ─────────────┴── Units ──┘
```
1. `q`: The target city query (e.g. `London`, `Tokyo`, `New York`). Passed through `encodeURIComponent()` to safely encode spaces and special characters.
2. `appid`: The 32-character authentication key proving permission to query the database.
3. `units`: Sets the measurement standard.
   * `metric`: Temperature in Celsius (°C) and wind speed in meters/second (which our app converts to km/h).
   * `imperial`: Temperature in Fahrenheit (°F) and wind speed in miles/hour (mph).

### Code Walkthrough (`app.js`)
Here is the core logic from [`app.js`](file:///d:/Projects/SkyPulse%20Weather/app.js):

```javascript
async function fetchWeather(city) {
    if (!city || city.trim() === "") {
        showError("Please enter a valid city name.");
        return;
    }

    const trimmedCity = city.trim();
    clearError();
    loadingOverlay.classList.add("active");

    // 1. Build the complete parameterized request URL
    const requestUrl = `${BASE_URL}?q=${encodeURIComponent(trimmedCity)}&appid=${currentApiKey}&units=${currentUnit}`;

    // Update URL preview in the API Inspector Lab
    apiUrlDisplay.textContent = requestUrl;
    openInBrowserLink.href = requestUrl;

    const startTime = performance.now(); // Start latency timer

    try {
        // 2. Dispatch HTTP GET request via the browser's Fetch API
        const response = await fetch(requestUrl);
        
        // Compute round-trip latency
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);

        // 3. Deserialize JSON stream into a native JavaScript object
        const data = await response.json();

        // 4. Update the in-app API Inspector with the result
        updateApiInspector(response.status, response.statusText, latencyMs, data);

        // 5. Evaluate HTTP response status
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${trimmedCity}" not found. Please verify spelling.`);
            } else if (response.status === 401) {
                throw new Error("Invalid or unactivated API Key (HTTP 401).");
            } else {
                throw new Error(data.message || `API error with status code: ${response.status}`);
            }
        }

        // 6. Cache data and update the DOM
        currentWeatherData = data;
        renderWeatherUI(data);

    } catch (err) {
        console.error("Fetch Error:", err);
        showError(err.message || "Failed to fetch weather data.");
    } finally {
        loadingOverlay.classList.remove("active");
    }
}
```

### Data Extraction & DOM Mapping Table
Once the JSON object arrives, [`renderWeatherUI(data)`](file:///d:/Projects/SkyPulse%20Weather/app.js) extracts specific properties and maps them to DOM elements in [`index.html`](file:///d:/Projects/SkyPulse%20Weather/index.html):

| API JSON Field | JavaScript Path | DOM Target Element | Rendered Format Example |
| :--- | :--- | :--- | :--- |
| **City Name** | `data.name` | `<h2 id="cityName">` | `London` |
| **Country Code** | `data.sys.country` | `<span id="countryCode">` | `GB` |
| **Current Temp** | `data.main.temp` | `<span id="temperature">` | `15` |
| **Min Temp** | `data.main.temp_min` | `<span id="tempMin">` | `L: 12°` |
| **Max Temp** | `data.main.temp_max` | `<span id="tempMax">` | `H: 18°` |
| **Weather Condition**| `data.weather[0].description`| `<h3 id="weatherCondition">`| `Overcast Clouds` |
| **Condition Icon** | `data.weather[0].icon` | `<img id="weatherIcon">` | `https://openweathermap.org/img/wn/04d@4x.png` |
| **Relative Humidity**| `data.main.humidity` | `<span id="humidity">` | `78%` |
| **Wind Speed** | `data.wind.speed` | `<span id="windSpeed">` | `18 km/h` or `11 mph` |
| **Feels Like** | `data.main.feels_like`| `<span id="feelsLike">` | `14°C` |
| **Air Pressure** | `data.main.pressure` | `<span id="pressure">` | `1014 hPa` |
| **Visibility** | `data.visibility` | `<span id="visibility">` | `10.0 km` (converted from meters) |
| **Sunrise / Sunset** | `data.sys.sunrise`, `data.timezone` | `<span id="sunrise">` | `06:42 AM` (adjusted by city timezone offset) |

---

## ⚙️ How This Web Application Works (Step-by-Step Lifecycle)

```
[1. User Action]
     │
     ▼
[2. Form Validation & Query Encoding]
     │
     ▼
[3. HTTP GET Request Dispatched via fetch()] ──► [OpenWeatherMap Server]
     │                                                    │
     ▼                                                    ▼
[4. Latency Timer Stopt & JSON Parsing]       [Validates Key & City]
     │                                                    │
     ▼                                                    │
[5. HTTP Status Code Branching] ◄─────────────────────────┘
     ├─► Status 200 OK ──────► Update DOM & Apply Dynamic Theme & Update Inspector
     └─► Status 404 / 401 ───► Trigger Animated Error Banner & Show Error in Inspector
```

### Phase 1: Application Boot & Default City Fetch
1. When the page finishes loading in the browser (`window.addEventListener("DOMContentLoaded")`), it automatically triggers `fetchWeather("London")`.
2. This ensures the user is immediately greeted by a vibrant, populated weather card rather than an empty, broken UI.

### Phase 2: User Search & Event Handling
1. A user can search by typing into `<input id="cityInput">` and pressing **Enter** or clicking the search button.
2. The form's `submit` event listener intercepts the request and calls `e.preventDefault()` to stop the browser from reloading the page.
3. Alternatively, clicking any of the quick-access chips (London, New York, Tokyo, Paris, Mumbai, Dubai) reads the `data-city` attribute and triggers the search immediately.

### Phase 3: Network Dispatch & Latency Measurement
1. Before sending the request, `performance.now()` records the start timestamp.
2. The browser's native `fetch()` function opens an asynchronous network connection to OpenWeatherMap's servers.
3. The loading spinner overlay (`#loadingOverlay`) becomes active, indicating background communication.
4. When the response headers arrive, `performance.now()` calculates the round-trip latency (`latencyMs`).

### Phase 4: Error Handling & HTTP Status Branching
1. If the server responds with a non-200 code (`response.ok === false`):
   * **`404 Not Found`**: Throws an error indicating the city name was misspelled or unrecognized.
   * **`401 Unauthorized`**: Throws an error notifying the user that the API key is unactivated or invalid.
2. The `catch` block intercepts the error, removes the loading spinner, and displays an animated red alert banner (`#errorBanner`) explaining the exact reason for failure.

### Phase 5: Rendering Weather Metrics & Dynamic Theming
1. If the status is `200 OK`, `renderWeatherUI(data)` executes.
2. Numbers are mathematically rounded (`Math.round()`).
3. Visibility in meters is converted to kilometers (`data.visibility / 1000`).
4. Wind speed in `m/s` is converted to `km/h` for metric mode (`m/s * 3.6`).
5. **Timezone Calculation**: Unix epoch timestamps for sunrise and sunset are combined with `data.timezone` (offset in seconds) to compute the exact local clock time in the target city.
6. **Dynamic Theming**: The `updateTheme(data.weather[0].main)` function inspects the weather category string and adds the appropriate class (`theme-clear`, `theme-clouds`, `theme-rain`, etc.) to the `<body>`, triggering a smooth 1-second background gradient transition.

### Phase 6: Live API Inspector Updates
1. The inspector updates the HTTP method tag (`METHOD: GET`).
2. The status badge is updated with the code (`200 OK` in green or error codes in red).
3. The latency tag displays the elapsed time (e.g. `142 ms`).
4. The raw JSON response is pretty-printed with 2-space indentation (`JSON.stringify(data, null, 2)`) inside `<pre id="jsonOutput">`.

### Phase 7: Real-Time Unit Switching (°C vs °F)
1. Clicking the **°C** or **°F** buttons toggles the internal state (`currentUnit = "metric"` or `"imperial"`).
2. The button style toggles with an active blue pill indicator.
3. If weather data is already loaded on the screen, the application re-fetches with the new unit parameter, immediately updating all temperatures, limits, and wind metrics.

---

## 🎨 Key Features & Visual Design

* **Frosted Glassmorphism**: Built using pure Vanilla CSS utilizing `backdrop-filter: blur(24px)`, semi-transparent surface fills (`rgba(255, 255, 255, 0.07)`), and subtle ambient gradient glows.
* **Modern Typography**: Integrated with Google Fonts' **Outfit** family for clear, readable numerals and headings.
* **Responsive Layout**: Adapts from wide 4K desktop screens down to compact 320px mobile viewports.
* **Zero Dependencies**: 100% native web technologies — no React, no Tailwind, no external libraries required.

---

## 📁 Project File Structure

```text
SkyPulse-Weather/
│
├── index.html       # Semantic HTML5 markup, accessibility tags & SVG icons
├── style.css        # Vanilla CSS3: glassmorphism, weather themes & animations
├── app.js           # Core JS: fetch() logic, DOM updates, timezone math & API lab
└── README.md        # Comprehensive technical documentation & setup guide
```

---

## 🚀 How to Run This Project Locally

Because this project is built entirely with standard web technologies, there are **no build tools or compilation steps required**.

### Method 1: Instant Run (Double-Click)
1. Open your file explorer and navigate to `D:\Projects\SkyPulse Weather`.
2. Double-click **`index.html`**.
3. It will open immediately in your default browser.

### Method 2: Node.js Dev Server (`npx serve`)
```bash
# Navigate to the folder
cd "D:\Projects\SkyPulse Weather"

# Run a lightweight local server
npx serve
```
Open the provided URL (e.g., `http://localhost:3000` or `http://localhost:5173`).

### Method 3: VS Code / Antigravity Live Server
1. Open the folder in your editor.
2. Right-click **`index.html`**.
3. Select **"Open with Live Server"**.

### Method 4: Python Simple HTTP Server
```bash
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

---

## 📋 Sample Raw API JSON Response

Here is an example of the actual JSON data structure returned by OpenWeatherMap when queried for London:

```json
{
  "coord": { "lon": -0.1257, "lat": 51.5085 },
  "weather": [
    {
      "id": 501,
      "main": "Rain",
      "description": "moderate rain",
      "icon": "10d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 11.2,
    "feels_like": 10.5,
    "temp_min": 9.8,
    "temp_max": 12.4,
    "pressure": 1004,
    "humidity": 89,
    "sea_level": 1004,
    "grnd_level": 1002
  },
  "visibility": 3000,
  "wind": {
    "speed": 5.76,
    "deg": 205,
    "gust": 12.26
  },
  "rain": {
    "1h": 1.63
  },
  "clouds": {
    "all": 100
  },
  "dt": 1729847822,
  "sys": {
    "country": "GB",
    "sunrise": 1729823967,
    "sunset": 1729860582
  },
  "timezone": 3600,
  "id": 2643743,
  "name": "London",
  "cod": 200
}
```

---

## 📄 License

This project is licensed under the **MIT License**. You are free to fork, customize, modify, and include it in your personal projects or professional portfolio.

---

<p align="center">
  Built with ❤️ by Suraj • Powered by <a href="https://openweathermap.org/" target="_blank">OpenWeatherMap API</a>
</p>
