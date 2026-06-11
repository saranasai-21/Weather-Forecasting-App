import React from 'react';
import styles from './AqiGauge.module.css';

export default function AqiGauge({ airQuality, humidity, windSpeed }) {
  if (!airQuality) return null;

  const pm25 = airQuality.pm2_5 || 0;
  const pm10 = airQuality.pm10 || 0;
  const co = airQuality.co || 0;
  const no2 = airQuality.no2 || 0;
  const o3 = airQuality.o3 || 0;
  const epaIndex = airQuality["us-epa-index"] || 1;

  // EPA official breakpoint calculator for PM2.5 to AQI
  const calculateAqi = (pm) => {
    if (pm <= 12.0) return Math.round((50 / 12.0) * pm);
    if (pm <= 35.4) return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm - 12.1));
    if (pm <= 55.4) return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm - 35.5));
    if (pm <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm - 55.5));
    if (pm <= 250.4) return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm - 150.5));
    if (pm <= 500.0) return Math.round(301 + ((500 - 301) / (500.0 - 250.5)) * (pm - 250.5));
    return 500;
  };

  const aqi = calculateAqi(pm25);

  // AQI Level characteristics helper
  const getAqiDetails = (val) => {
    if (val <= 50) {
      return { label: "Good", color: "#00e400", tip: "Air quality is satisfactory, and air pollution poses little or no risk." };
    }
    if (val <= 100) {
      return { label: "Moderate", color: "#ffff00", tip: "Air quality is acceptable. Sensitive individuals should consider limiting heavy outdoor exertion." };
    }
    if (val <= 150) {
      return { label: "Unhealthy for Sensitive", color: "#ff7e00", tip: "Members of sensitive groups may experience health effects. General public is less likely to be affected." };
    }
    if (val <= 200) {
      return { label: "Unhealthy", color: "#ff0000", tip: "Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion." };
    }
    if (val <= 300) {
      return { label: "Very Unhealthy", color: "#8f3f97", tip: "Health alert: everyone may experience more serious health effects. Avoid outdoor activities." };
    }
    return { label: "Hazardous", color: "#7e0023", tip: "Health warning of emergency conditions: everyone is more likely to be affected. Keep windows closed." };
  };

  const details = getAqiDetails(aqi);

  // SVG Gauge variables (Radius 50 -> Circumference 314)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(aqi, 500) / 500;
  const strokeOffset = circumference - percentage * circumference;

  // Pollen count simulation based on wind and humidity rules
  const getPollenCount = (hum, wnd) => {
    const month = new Date().getMonth() + 1; // 1-12
    const isSpring = month >= 3 && month <= 5;
    if (hum > 80 || wnd < 5) return "Low";
    if (isSpring && hum < 60 && wnd > 15) return "High";
    if (wnd > 20 || hum < 40) return "Medium-High";
    return "Medium";
  };

  const pollenCount = getPollenCount(humidity, windSpeed);

  return (
    <div className={`${styles.card} glass-card fade-in`} id="aqi-card-node">
      <h2 className={styles.title}>Air Quality Index</h2>
      
      <div className={styles.contentWrapper}>
        <div className={styles.gaugeContainer}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle className={styles.circleBg} cx="60" cy="60" r={radius} />
            <circle
              className={styles.circleProgress}
              cx="60"
              cy="60"
              r={radius}
              stroke={details.color}
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
            />
          </svg>
          <div className={styles.gaugeInfo}>
            <span className={styles.aqiValue} style={{ color: details.color }}>
              {aqi}
            </span>
            <span className={styles.aqiLabel}>AQI</span>
          </div>
        </div>

        <div className={styles.details}>
          <div>
            <span className={styles.statusText} style={{ color: details.color }}>
              {details.label}
            </span>
            <div className={styles.pollenRow}>
              Pollen Count: <span className={styles.pollenVal}>{pollenCount}</span>
            </div>
          </div>

          <div className={styles.pollutantsGrid}>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollutantName}>PM2.5</span>
              <span className={styles.pollutantVal}>{Math.round(pm25)}</span>
            </div>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollutantName}>PM10</span>
              <span className={styles.pollutantVal}>{Math.round(pm10)}</span>
            </div>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollutantName}>O3</span>
              <span className={styles.pollutantVal}>{Math.round(o3)}</span>
            </div>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollutantName}>NO2</span>
              <span className={styles.pollutantVal}>{Math.round(no2)}</span>
            </div>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollutantName}>CO</span>
              <span className={styles.pollutantVal}>{Math.round(co)}</span>
            </div>
            <div className={styles.pollutantBadge}>
              <span className={styles.pollenVal} style={{ fontSize: '10px' }}>EPA {epaIndex}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.healthTip}>
        {details.tip}
      </div>
    </div>
  );
}
