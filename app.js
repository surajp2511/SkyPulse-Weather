/**
 * ==============================================================================
 * SkyPulse Weather - Core JavaScript Logic & API Client
 * ==============================================================================
 * This script demonstrates:
 * 1. How Web APIs work (HTTP GET requests, endpoints, query parameters, headers).
 * 2. Fetching real-time weather data from OpenWeatherMap using async / await.
 * 3. Handling HTTP status codes (200 OK, 404 Not Found, 401 Unauthorized).
 * 4. Updating DOM elements dynamically with weather parameters.
 * 5. Providing an interactive API Inspector to learn and inspect raw API data.
 * ==============================================================================
 */

// --- 1. CONFIGURATION & CONSTANTS ---
// Your OpenWeatherMap API key (provided in your subscription email)
const DEFAULT_API_KEY = "add9e86e8473c27a82ff6a87159bedd0";

// Base URL for the OpenWeatherMap Current Weather Data API endpoint
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Application State
let currentApiKey = DEFAULT_API_KEY;
let currentWeatherData = null; // Will store the parsed JSON response
let currentUnit = "metric";     // "metric" = Celsius (°C), "imperial" = Fahrenheit (°F)

// --- 2. DOM ELEMENT REFERENCES ---
// Search Elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const cityChips = document.querySelectorAll(".city-chip");

// Error & Loading UI
const errorBanner = document.getElementById("errorBanner");
const errorMessage = document.getElementById("errorMessage");
const loadingOverlay = document.getElementById("loadingOverlay");

// Main Weather Display Elements
const cityNameEl = document.getElementById("cityName");
const countryCodeEl = document.getElementById("countryCode");
const currentDateEl = document.getElementById("currentDate");
const weatherIconEl = document.getElementById("weatherIcon");
const temperatureEl = document.getElementById("temperature");
const tempUnitEl = document.getElementById("tempUnit");
const weatherConditionEl = document.getElementById("weatherCondition");
const tempMinEl = document.getElementById("tempMin");
const tempMaxEl = document.getElementById("tempMax");

// Weather Details Elements
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const feelsLikeEl = document.getElementById("feelsLike");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

// Unit Toggle Buttons
const unitCelsiusBtn = document.getElementById("unitCelsius");
const unitFahrenheitBtn = document.getElementById("unitFahrenheit");

// API Inspector Lab Elements
const apiInspectorCard = document.getElementById("apiInspectorCard");
const apiInspectorHeader = document.getElementById("apiInspectorHeader");
const apiStatusCodeEl = document.getElementById("apiStatusCode");
const apiLatencyEl = document.getElementById("apiLatency");
const apiUrlDisplay = document.getElementById("apiUrlDisplay");
const openInBrowserLink = document.getElementById("openInBrowserLink");
const customApiKeyInput = document.getElementById("customApiKeyInput");
const applyKeyBtn = document.getElementById("applyKeyBtn");
const jsonOutput = document.getElementById("jsonOutput");
const copyJsonBtn = document.getElementById("copyJsonBtn");

// --- 3. HELPER FUNCTIONS ---

/**
 * Format a Unix timestamp (seconds) into human-readable local time (e.g. "06:45 AM")
 * taking into account the city's timezone offset in seconds.
 */
function formatTime(unixSeconds, timezoneOffsetSeconds = 0) {
    // Convert to milliseconds and adjust for the city's specific UTC offset
    const localUtcMs = (unixSeconds + timezoneOffsetSeconds) * 1000;
    const date = new Date(localUtcMs);
    
    // Use UTC methods because we manually shifted milliseconds by the city offset
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

/**
 * Format current date string for header (e.g. "Saturday, 24 October")
 */
function formatCurrentDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-US', options);
}

/**
 * Display or hide error banner with helpful explanations
 */
function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.add("active");
}

function clearError() {
    errorBanner.classList.remove("active");
}

/**
 * Update the dynamic background gradient based on weather condition main group
 */
function updateTheme(weatherGroup) {
    // Reset all weather theme classes
    document.body.className = '';
    
    if (!weatherGroup) return;
    
    const group = weatherGroup.toLowerCase();
    if (group.includes("clear")) {
        document.body.classList.add("theme-clear");
    } else if (group.includes("cloud")) {
        document.body.classList.add("theme-clouds");
    } else if (group.includes("rain")) {
        document.body.classList.add("theme-rain");
    } else if (group.includes("drizzle")) {
        document.body.classList.add("theme-drizzle");
    } else if (group.includes("thunderstorm")) {
        document.body.classList.add("theme-thunderstorm");
    } else if (group.includes("snow")) {
        document.body.classList.add("theme-snow");
    } else if (group.includes("mist") || group.includes("fog") || group.includes("haze")) {
        document.body.classList.add("theme-mist");
    }
}

// --- 4. CORE API FETCH FUNCTION ---

/**
 * Fetches weather data from OpenWeatherMap using HTTP GET
 * @param {string} city - Name of city to search
 */
async function fetchWeather(city) {
    if (!city || city.trim() === "") {
        showError("Please enter a valid city name.");
        return;
    }

    const trimmedCity = city.trim();
    clearError();
    loadingOverlay.classList.add("active");

    // Construct the complete URL with query parameters:
    // ?q={city}&appid={key}&units={metric/imperial}
    const requestUrl = `${BASE_URL}?q=${encodeURIComponent(trimmedCity)}&appid=${currentApiKey}&units=${currentUnit}`;

    // Update URL preview in the API Inspector
    apiUrlDisplay.textContent = requestUrl;
    openInBrowserLink.href = requestUrl;

    const startTime = performance.now();

    try {
        /**
         * The `fetch()` function sends an HTTP GET request to the OpenWeatherMap server.
         * The `await` keyword pauses execution until the network response arrives.
         */
        const response = await fetch(requestUrl);
        const endTime = performance.now();
        const latencyMs = Math.round(endTime - startTime);

        // Parse the response body stream as JSON (JavaScript Object Notation)
        const data = await response.json();

        // Update the API Inspector with live response details
        updateApiInspector(response.status, response.statusText, latencyMs, data);

        // Check if the HTTP status indicates success (status 200)
        if (!response.ok) {
            // Handle common HTTP error codes
            if (response.status === 404) {
                throw new Error(`City "${trimmedCity}" not found. Please verify the spelling.`);
            } else if (response.status === 401) {
                throw new Error("Invalid or unactivated API Key (HTTP 401). If recently created, allow up to 2 hours for OpenWeatherMap activation.");
            } else {
                throw new Error(data.message || `API error with status code: ${response.status}`);
            }
        }

        // Cache the successful weather data and update the UI
        currentWeatherData = data;
        renderWeatherUI(data);

    } catch (err) {
        console.error("Fetch Error:", err);
        showError(err.message || "Failed to fetch weather data. Please check your internet connection.");
    } finally {
        loadingOverlay.classList.remove("active");
    }
}

// --- 5. RENDER WEATHER UI ---

/**
 * Injects weather data properties into DOM elements
 * @param {Object} data - Raw JSON object returned by OpenWeatherMap API
 */
function renderWeatherUI(data) {
    // 1. Location & Header Info
    cityNameEl.textContent = data.name;
    countryCodeEl.textContent = data.sys?.country || "—";
    currentDateEl.textContent = formatCurrentDate();

    // 2. Weather Condition & Icon
    const weatherObj = data.weather && data.weather[0] ? data.weather[0] : null;
    if (weatherObj) {
        weatherConditionEl.textContent = weatherObj.description;
        // Use OpenWeatherMap high-res 4x icon image
        weatherIconEl.src = `https://openweathermap.org/img/wn/${weatherObj.icon}@4x.png`;
        weatherIconEl.alt = weatherObj.description;
        
        // Dynamically update background theme
        updateTheme(weatherObj.main);
    }

    // 3. Temperature & Ranges
    const isCelsius = currentUnit === "metric";
    const unitSymbol = isCelsius ? "°C" : "°F";
    const windUnitSymbol = isCelsius ? "km/h" : "mph";

    const tempVal = Math.round(data.main.temp);
    temperatureEl.textContent = tempVal;
    tempUnitEl.textContent = unitSymbol;

    const minTemp = Math.round(data.main.temp_min);
    const maxTemp = Math.round(data.main.temp_max);
    tempMinEl.textContent = `L: ${minTemp}°`;
    tempMaxEl.textContent = `H: ${maxTemp}°`;

    // 4. Weather Details Grid
    humidityEl.textContent = `${data.main.humidity}%`;
    
    // Wind Speed: OpenWeatherMap returns m/s in metric; convert to km/h for readability (m/s * 3.6)
    let speed = data.wind.speed;
    if (isCelsius) {
        speed = Math.round(speed * 3.6);
    } else {
        speed = Math.round(speed);
    }
    windSpeedEl.textContent = `${speed} ${windUnitSymbol}`;

    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}${unitSymbol}`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
    
    // Visibility: in meters (e.g., 10000m -> 10.0 km)
    const visibilityKm = (data.visibility / 1000).toFixed(1);
    visibilityEl.textContent = `${visibilityKm} km`;

    // Sunrise & Sunset with city's timezone offset
    const timezoneOffset = data.timezone || 0;
    if (data.sys?.sunrise) {
        sunriseEl.textContent = formatTime(data.sys.sunrise, timezoneOffset);
    }
    if (data.sys?.sunset) {
        sunsetEl.textContent = formatTime(data.sys.sunset, timezoneOffset);
    }
}

// --- 6. API INSPECTOR UPDATE ---

/**
 * Updates the API Inspector Lab drawer with live request & response details
 */
function updateApiInspector(status, statusText, latencyMs, jsonBody) {
    // Status Code Badge
    apiStatusCodeEl.textContent = `${status} ${statusText || ''}`;
    if (status >= 200 && status < 300) {
        apiStatusCodeEl.className = "status-tag";
    } else {
        apiStatusCodeEl.className = "status-tag status-error";
    }

    // Latency
    apiLatencyEl.textContent = `${latencyMs} ms`;

    // Pretty-printed JSON
    jsonOutput.textContent = JSON.stringify(jsonBody, null, 2);
}

// --- 7. EVENT LISTENERS ---

// Search Form Submit (Search button or Enter key)
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchWeather(cityInput.value);
});

// Quick City Shortcut Chips
cityChips.forEach(chip => {
    chip.addEventListener("click", () => {
        const city = chip.getAttribute("data-city");
        cityInput.value = city;
        fetchWeather(city);
    });
});

// Unit Switchers (°C / °F)
unitCelsiusBtn.addEventListener("click", () => {
    if (currentUnit === "metric") return;
    currentUnit = "metric";
    unitCelsiusBtn.classList.add("active");
    unitFahrenheitBtn.classList.remove("active");
    if (currentWeatherData) {
        fetchWeather(currentWeatherData.name);
    }
});

unitFahrenheitBtn.addEventListener("click", () => {
    if (currentUnit === "imperial") return;
    currentUnit = "imperial";
    unitFahrenheitBtn.classList.add("active");
    unitCelsiusBtn.classList.remove("active");
    if (currentWeatherData) {
        fetchWeather(currentWeatherData.name);
    }
});

// API Inspector Accordion Toggle
apiInspectorHeader.addEventListener("click", () => {
    apiInspectorCard.classList.toggle("open");
});

// Apply Custom API Key (for testing keys)
applyKeyBtn.addEventListener("click", () => {
    const newKey = customApiKeyInput.value.trim();
    if (!newKey) {
        alert("Please paste an API key to test!");
        return;
    }
    currentApiKey = newKey;
    const targetCity = currentWeatherData ? currentWeatherData.name : "London";
    fetchWeather(targetCity);
});

// Copy JSON Output to Clipboard
copyJsonBtn.addEventListener("click", async () => {
    if (!jsonOutput.textContent) return;
    try {
        await navigator.clipboard.writeText(jsonOutput.textContent);
        const originalText = copyJsonBtn.textContent;
        copyJsonBtn.textContent = "Copied!";
        setTimeout(() => {
            copyJsonBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error("Clipboard copy failed:", err);
    }
});

// --- 8. INITIAL APP LAUNCH ---
// Set initial custom key input placeholder and load default city (London)
window.addEventListener("DOMContentLoaded", () => {
    customApiKeyInput.value = currentApiKey;
    fetchWeather("London");
});
