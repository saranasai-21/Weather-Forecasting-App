# 🌩️ SkyGlass Weather Dashboard

A premium, responsive Weather Web App featuring sleek solid card designs, custom-designed CSS+SVG animated weather conditions, and timezone-aware forecasting. 

---
# 🌐 Live Deploy

[https://weather-forecasting-app-eta.vercel.app/](https://weather-forecasting-app-rho.vercel.app/)

## 🚀 How to Run the App

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Local Server**:
   ```bash
   npm start
   ```
   *Note: This command fires up our Vite development server, making the dashboard accessible at `http://localhost:5173`.*

---

## 🔑 Adding the WeatherAPI.com Key

To query live forecasts, you will need an active API key from [WeatherAPI.com](https://www.weatherapi.com/).

### Method 1: Source File Configuration (Recommended)
Open [src/config.js](file:///d:/app/src/config.js) and replace the placeholder value with your active key:
```javascript
export const API_KEY = "YOUR_WEATHERAPI_KEY";
```

### Method 2: Browser Override Input (Dynamic Settings)
If the project key is left as the placeholder, the application will display a beautiful configuration form on load. You can paste your API key directly into the input and click **Save Key**. The key will automatically save to your browser's local storage for future visits. You can reset or change this key anytime by clicking the **Key Icon** in the top-right header.

---

# Interface

<img width="1881" height="845" alt="Screenshot 2026-06-11 160051" src="https://github.com/user-attachments/assets/091aa85e-3151-4065-a7e5-8ae33e6f7898" />

## 🌟 Features Implemented

1. **Sleek Solid Card Design System**:
   - Built on harmonized color variable sets configured inside [globals.css](file:///d:/app/src/globals.css).
   - Dynamic fluid background shifting animations (`15s` linear gradient loop).
   - Modern solid card surfaces (`#15162b` for dark mode, `#ffffff` for light mode) with crisp border highlights, shadow effects, and custom hover translations.

2. **Custom Animated CSS/SVG Icons**:
   - Zero image downloads. Core weather conditions (Clear, Partly Cloudy, Cloudy, Rain, Thunderstorms, Snow, Mist/Fog) map to interactive SVG shapes that rotate, drift, drip, flash, and float using micro-animations.

3. **Timezone-Aware Hourly Forecast**:
   - Calculates the city's timezone local hour to stitch together current day and next day forecasts, providing a precise, chronological 24-hour horizontal forecast timeline.

4. **5-Day Extended Slider**:
   - Horizontal slider displaying minimum and maximum temperature variations across 5 forecast days.

5. **Auto-detect Geolocation**:
   - Queries the browser `navigator.geolocation` on startup to load details for your current coordinates. Falls back silently to **Hyderabad** on denial or failure (without throwing errors) as requested.

6. **Celsius / Fahrenheit Toggle**:
   - Interactive pill toggle next to the search bar converts all dashboard temperatures and wind speed variables between Metric (°C, km/h) and Imperial (°F, mph) modes instantly.

7. **Adaptive Dark / Light Modes**:
   - Sun/Moon toggles transition variables dynamically. Preference is saved to `localStorage`.

8. **Robust State & Custom Hook Architecture**:
   - Orchestrated using the custom `useWeather(city)` React hook.
   - Strictly conforms to error mapping rules:
     - *Network failures* show: `"Unable to fetch weather. Check your connection."`
     - *Invalid searches* show: `"City not found. Please try another name."`



# Comparing Weather

<img width="816" height="710" alt="Screenshot 2026-06-11 160153" src="https://github.com/user-attachments/assets/ca40f42e-8630-44fc-afa0-375b21363797" />

# Other Features

<img width="1247" height="537" alt="Screenshot 2026-06-11 160210" src="https://github.com/user-attachments/assets/abc6ba42-ba0b-4f29-b307-2c95735d5974" />
