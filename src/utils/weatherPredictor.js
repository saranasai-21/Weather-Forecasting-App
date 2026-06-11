/**
 * Rule-based weather prediction engine.
 * Evaluates current and forecast metrics to produce plain-language insights.
 * 
 * @param {Object} forecastData - The forecast block from WeatherAPI (data.forecast)
 * @param {Object} currentData - The current weather block from WeatherAPI (data.current)
 * @returns {Array} List of prediction objects
 */
export function predictNextDays(forecastData, currentData) {
  const predictions = [];
  if (!forecastData || !forecastData.forecastday || !currentData) return predictions;

  const days = forecastData.forecastday;
  
  // Helper to get average hourly pressure for a day
  const getAvgPressure = (dayObj) => {
    if (!dayObj || !dayObj.hour || dayObj.hour.length === 0) return 1013;
    return dayObj.hour.reduce((sum, h) => sum + h.pressure_mb, 0) / dayObj.hour.length;
  };

  // 1. Falling pressure + high humidity tomorrow -> "Rain likely tomorrow"
  if (days.length >= 2) {
    const pressToday = getAvgPressure(days[0]);
    const pressTomorrow = getAvgPressure(days[1]);
    const humTomorrow = days[1].day?.avghumidity || 0;
    
    if (pressTomorrow < pressToday - 1 && humTomorrow > 70) {
      predictions.push({
        text: "Atmospheric pressure is dropping rapidly with high humidity. Rain is highly likely tomorrow.",
        type: "warning",
        tag: "Warning",
        emoji: "⚠️"
      });
    }
  }

  // 2. Temp trend falling 3°C over 3 days -> "Cold front approaching"
  if (days.length >= 3) {
    const t0 = days[0].day?.avgtemp_c || 0;
    const t2 = days[2].day?.avgtemp_c || 0;
    if (t2 <= t0 - 3) {
      predictions.push({
        text: `Average temperature is dropping from ${Math.round(t0)}°C to ${Math.round(t2)}°C over the next 3 days. A cold front is approaching.`,
        type: "info",
        tag: "Info",
        emoji: "ℹ️"
      });
    }
  }

  // 3. UV Index > 7 for next 3 days -> "High UV week ahead, use SPF 50+"
  if (days.length >= 3) {
    const uv0 = days[0].day?.uv || 0;
    const uv1 = days[1].day?.uv || 0;
    const uv2 = days[2].day?.uv || 0;
    if (uv0 > 7 && uv1 > 7 && uv2 > 7) {
      predictions.push({
        text: "Very high UV index levels (>7) predicted for the next 3 days. High UV exposure ahead; wear sunscreen (SPF 50+) and sunglasses.",
        type: "info",
        tag: "Info",
        emoji: "☀️"
      });
    }
  }

  // 4. Wind > 30 km/h + rain -> "Stormy conditions expected"
  const windSpd = currentData.wind_kph || 0;
  const condText = (currentData.condition?.text || "").toLowerCase();
  const hasRain = condText.includes("rain") || condText.includes("shower") || condText.includes("drizzle") || condText.includes("thunderstorm");
  if (windSpd > 30 && hasRain) {
    predictions.push({
      text: `Gale force winds of ${Math.round(windSpd)} km/h paired with active precipitation. Stormy conditions are expected; secure loose items.`,
      type: "warning",
      tag: "Warning",
      emoji: "🌪️"
    });
  }

  // 5. Clear + low humidity for 3+ days -> "Dry spell continuing"
  let clearDays = 0;
  let lowHumDays = 0;
  days.forEach(d => {
    const text = (d.day?.condition?.text || "").toLowerCase();
    if (text.includes("sun") || text.includes("clear") || text.includes("partly cloudy")) clearDays++;
    if ((d.day?.avghumidity || 100) < 55) lowHumDays++;
  });
  if (clearDays >= 3 && lowHumDays >= 3) {
    predictions.push({
      text: "Dry, clear conditions are forecast to persist for the next few days. Perfect weather for outdoor activities.",
      type: "good",
      tag: "Good",
      emoji: "✅"
    });
  }

  // 6. Temp > 38°C -> "Extreme heat advisory — stay hydrated"
  const maxTempForecast = Math.max(...days.map(d => d.day?.maxtemp_c || 0));
  const currTemp = currentData.temp_c || 0;
  if (currTemp > 38 || maxTempForecast > 38) {
    predictions.push({
      text: `Extreme heat levels exceeding 38°C detected. Heat advisory active; limit direct sun exposure and stay hydrated.`,
      type: "extreme",
      tag: "Extreme",
      emoji: "🔥"
    });
  }

  // 7. AQI > 150 -> "Poor air quality predicted — limit outdoor activity"
  // EPA index: 1-Good, 2-Mod, 3-Unhealthy for Sensitive, 4-Unhealthy, 5-Very Unhealthy, 6-Hazardous
  const epaIndex = currentData.air_quality?.["us-epa-index"] || 1;
  const pm25Val = currentData.air_quality?.pm2_5 || 0;
  // AQI > 150 corresponds to us-epa-index >= 4 or pm2.5 > 55
  if (epaIndex >= 4 || pm25Val > 55) {
    predictions.push({
      text: `Air quality indexes are unhealthy (PM2.5: ${Math.round(pm25Val)} µg/m³). Limit strenuous outdoor activities, especially for children and seniors.`,
      type: "warning",
      tag: "Warning",
      emoji: "😷"
    });
  }

  // Fallback: If no warnings triggered, provide a general forecast
  if (predictions.length === 0) {
    predictions.push({
      text: "Weather conditions are stable and expected to remain within normal thresholds for the next few days.",
      type: "good",
      tag: "Good",
      emoji: "✅"
    });
  }

  return predictions;
}
