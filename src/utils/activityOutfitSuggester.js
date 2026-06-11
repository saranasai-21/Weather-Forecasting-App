/**
 * Suggests appropriate clothing and activities based on active weather metrics.
 * 
 * @param {Object} currentData - Current weather data block from WeatherAPI (data.current)
 * @returns {Object} suggestions - Outfit, activity, and warning recommendations
 */
export function getSuggestions(currentData) {
  if (!currentData) {
    return {
      outfit: ["Layered comfortable clothing"],
      activities: ["Indoor relaxation"],
      warning: ""
    };
  }

  const temp = currentData.temp_c || 0;
  const wind = currentData.wind_kph || 0;
  const uv = currentData.uv || 0;
  const humidity = currentData.humidity || 50;
  const condText = (currentData.condition?.text || "").toLowerCase();
  
  const hasRain = condText.includes("rain") || condText.includes("shower") || condText.includes("drizzle") || condText.includes("thunderstorm");
  const hasSnow = condText.includes("snow") || condText.includes("blizzard") || condText.includes("sleet");

  const outfit = [];
  const activities = [];
  let warning = "";

  // 1. Outfit Selection rules based on temperature
  if (temp < 5) {
    outfit.push("Heavy winter coat, thermal inner layers, gloves, and a beanie.");
  } else if (temp < 15) {
    outfit.push("Sweater or cardigans, a light windbreaker jacket, and long pants.");
  } else if (temp < 25) {
    outfit.push("Comfortable t-shirt, jeans/chinos, and sneakers. Perfect layer weather.");
  } else if (temp < 32) {
    outfit.push("Short-sleeved shirts, shorts or lightweight skirts, and breathable linen.");
  } else {
    outfit.push("Ultra-light breathable fabrics, wide-brimmed sun hat, and uv-protective sunglasses.");
  }

  // 2. Weather conditions modifiers for outfits
  if (hasRain) {
    outfit.push("Waterproof raincoat or windbreaker, water-resistant shoes, and carry an umbrella.");
    warning = "Rainy conditions detected. Don't forget your umbrella and waterproof outerwear!";
  } else if (hasSnow) {
    outfit.push("Insulated snowboots, thick socks, and moisture-wicking outer layers.");
    warning = "Snow or freezing sleet in progress. Wear insulated layers to prevent frostbite.";
  }

  if (uv >= 6) {
    outfit.push("Apply broad-spectrum sunscreen (SPF 30+ or 50+) and wear UV-filtering sunglasses.");
    if (!warning) warning = "High UV index alert. Apply sunscreen before heading outside.";
  }

  if (wind > 25 && temp < 18) {
    outfit.push("A windbreaker or technical jacket to shield against chilling wind gusts.");
  }

  // 3. Activity recommendations rules
  if (hasRain || hasSnow || temp < 2) {
    activities.push("Indoor core workout / Gym training");
    activities.push("Museum visits, cinema, or local library");
    activities.push("Baking, indoor crafting, or playing board games");
    activities.push("Rest and recovery yoga sessions at home");
  } else if (temp > 35) {
    activities.push("Early morning outdoor jog (avoid peak afternoon heat)");
    activities.push("Swimming at an indoor or shaded pool");
    activities.push("Air-conditioned indoor tennis or squash courts");
    activities.push("Enjoying cooler shaded parks in the evening");
  } else {
    // Ideal outdoors
    activities.push("Outdoor running, hiking, or nature trails walking");
    activities.push("Scenic cycling routes or long-distance bicycling");
    activities.push("Outdoor picnic, Frisbee, or reading in the park");
    
    if (temp >= 18 && temp <= 28 && wind < 20) {
      activities.push("Great day for photography, kayaking, or golfing");
    }
  }

  return { outfit, activities, warning };
}
