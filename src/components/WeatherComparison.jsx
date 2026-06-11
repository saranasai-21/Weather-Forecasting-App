import React from 'react';
import styles from './WeatherComparison.module.css';

export default function WeatherComparison({ cityAData, cityBData, onClose, unit }) {
  if (!cityAData || !cityBData) return null;

  const currentA = cityAData.current;
  const currentB = cityBData.current;

  // AQI Calculator helper
  const calculateAqi = (pm) => {
    if (!pm) return 0;
    if (pm <= 12.0) return Math.round((50 / 12.0) * pm);
    if (pm <= 35.4) return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm - 12.1));
    if (pm <= 55.4) return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm - 35.5));
    if (pm <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm - 55.5));
    if (pm <= 250.4) return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm - 150.5));
    return Math.round(301 + ((500 - 301) / (500.0 - 250.5)) * (pm - 250.5));
  };

  const aqiA = calculateAqi(currentA.air_quality?.pm2_5);
  const aqiB = calculateAqi(currentB.air_quality?.pm2_5);

  // Comfort algorithm comparers: returns 'better', 'worse', or 'neutral' for City A vs City B
  const compareTemp = (valA, valB) => {
    const distA = Math.abs(valA - 22); // distance from comfortable 22C
    const distB = Math.abs(valB - 22);
    if (Math.abs(distA - distB) < 1) return 'neutral';
    return distA < distB ? 'better' : 'worse';
  };

  const compareHumidity = (valA, valB) => {
    const distA = Math.abs(valA - 45); // distance from comfortable 45%
    const distB = Math.abs(valB - 45);
    if (Math.abs(distA - distB) < 5) return 'neutral';
    return distA < distB ? 'better' : 'worse';
  };

  const compareWind = (valA, valB) => {
    if (Math.abs(valA - valB) < 5) return 'neutral';
    return valA < valB ? 'better' : 'worse'; // Calmer wind is better
  };

  const compareAqi = (valA, valB) => {
    if (Math.abs(valA - valB) < 10) return 'neutral';
    return valA < valB ? 'better' : 'worse'; // Lower AQI is cleaner/better
  };

  const compareUv = (valA, valB) => {
    if (valA === valB) return 'neutral';
    return valA < valB ? 'better' : 'worse'; // Lower UV is safer
  };

  // Maps comparison results to badge styling
  const renderBadge = (status) => {
    if (status === 'better') return <span className={`${styles.diffBadge} ${styles.diffBetter}`}>Better</span>;
    if (status === 'worse') return <span className={`${styles.diffBadge} ${styles.diffWorse}`}>Worse</span>;
    return <span className={`${styles.diffBadge} ${styles.diffNeutral}`}>Similar</span>;
  };

  // Convert comparative badge for City B (which is inverse of City A)
  const getInverseStatus = (status) => {
    if (status === 'better') return 'worse';
    if (status === 'worse') return 'better';
    return 'neutral';
  };

  // Define comparison metric list
  const metrics = [
    {
      label: 'Temperature',
      valA: unit === 'C' ? `${Math.round(currentA.temp_c)}°C` : `${Math.round(currentA.temp_f)}°F`,
      valB: unit === 'C' ? `${Math.round(currentB.temp_c)}°C` : `${Math.round(currentB.temp_f)}°F`,
      status: compareTemp(currentA.temp_c, currentB.temp_c)
    },
    {
      label: 'Feels Like',
      valA: unit === 'C' ? `${Math.round(currentA.feelslike_c)}°C` : `${Math.round(currentA.feelslike_f)}°F`,
      valB: unit === 'C' ? `${Math.round(currentB.feelslike_c)}°C` : `${Math.round(currentB.feelslike_f)}°F`,
      status: compareTemp(currentA.feelslike_c, currentB.feelslike_c)
    },
    {
      label: 'Humidity',
      valA: `${currentA.humidity}%`,
      valB: `${currentB.humidity}%`,
      status: compareHumidity(currentA.humidity, currentB.humidity)
    },
    {
      label: 'Wind Speed',
      valA: unit === 'C' ? `${Math.round(currentA.wind_kph)} km/h` : `${Math.round(currentA.wind_mph)} mph`,
      valB: unit === 'C' ? `${Math.round(currentB.wind_kph)} km/h` : `${Math.round(currentB.wind_mph)} mph`,
      status: compareWind(currentA.wind_kph, currentB.wind_kph)
    },
    {
      label: 'Air Quality (AQI)',
      valA: aqiA,
      valB: aqiB,
      status: compareAqi(aqiA, aqiB)
    },
    {
      label: 'UV Index',
      valA: currentA.uv,
      valB: currentB.uv,
      status: compareUv(currentA.uv, currentB.uv)
    }
  ];

  return (
    <div className={`${styles.comparisonContainer} glass-card fade-in`} id="weather-comparison-sidebar">
      <div className={styles.header}>
        <h2 className={styles.title}>Compare Cities</h2>
        <button onClick={onClose} className={styles.closeBtn} id="comparison-close-button">
          Close comparison
        </button>
      </div>

      <div className={styles.comparisonGrid}>
        <div className={styles.citiesHeader}>
          <span>Comfort Metric</span>
          <span className={styles.cityTitle}>{cityAData.location.name}</span>
          <span className={styles.cityTitle}>{cityBData.location.name}</span>
        </div>

        {metrics.map((m, idx) => (
          <div key={idx} className={styles.metricRow} id={`comparison-metric-row-${idx}`}>
            <span className={styles.metricLabel}>{m.label}</span>
            
            <div className={styles.valueCell}>
              <span className={styles.value}>{m.valA}</span>
              {renderBadge(m.status)}
            </div>

            <div className={styles.valueCell}>
              <span className={styles.value}>{m.valB}</span>
              {renderBadge(getInverseStatus(m.status))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
