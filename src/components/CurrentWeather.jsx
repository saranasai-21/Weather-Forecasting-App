import React from 'react';
import { Thermometer, Wind, Droplets, Sun } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getCountryFlag, getCountryCode } from '../utils/countryFlags';
import styles from './CurrentWeather.module.css';

export default function CurrentWeather({ current, todayForecast, unit }) {
  if (!current || !current.location) return null;

  const location = current.location;
  const flagCode = getCountryCode(location.country);

  // Formatted values based on C vs F unit
  const temp = unit === 'C' ? `${Math.round(current.temp_c)}°C` : `${Math.round(current.temp_f)}°F`;
  const feelsLike = unit === 'C' ? `${Math.round(current.feelslike_c)}°C` : `${Math.round(current.feelslike_f)}°F`;
  const windSpeed = unit === 'C' ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;

  const highTemp = todayForecast
    ? (unit === 'C' ? `${Math.round(todayForecast.maxtemp_c)}°` : `${Math.round(todayForecast.maxtemp_f)}°`)
    : '--';
  const lowTemp = todayForecast
    ? (unit === 'C' ? `${Math.round(todayForecast.mintemp_c)}°` : `${Math.round(todayForecast.mintemp_f)}°`)
    : '--';

  // Helper for UV index level and styling
  const getUVStatus = (uv) => {
    if (uv <= 2) return { text: 'Low', class: styles.uvLow };
    if (uv <= 5) return { text: 'Moderate', class: styles.uvMod };
    if (uv <= 7) return { text: 'High', class: styles.uvHigh };
    return { text: 'Extreme', class: styles.uvExt };
  };

  const uvInfo = getUVStatus(current.uv);

  return (
    <div className={`${styles.card} glass-card fade-in`} id="current-weather-card">
      <div className={styles.header}>
        <div className={styles.location}>
          <h1 className={styles.city}>
            {location.name}
            {flagCode ? (
              <img 
                src={`https://flagcdn.com/w40/${flagCode}.png`} 
                alt={location.country}
                className={styles.flagImage}
                title={location.country}
              />
            ) : (
              <span className={styles.countryFlag} title={location.country}>
                🌐
              </span>
            )}
          </h1>
          <span className={styles.region}>
            {location.region ? `${location.region}, ` : ''}{location.country}
          </span>
        </div>
      </div>

      <div className={styles.mainInfo}>
        <WeatherIcon
          code={current.condition.code}
          iconUrl={current.condition.icon}
          size={120}
          alt={current.condition.text}
        />
        <div className={styles.tempContainer}>
          <span className={styles.temp}>{temp}</span>
          <span className={styles.conditionText}>{current.condition.text}</span>
          <span className={styles.tempHighLow}>
            H: {highTemp} &nbsp; L: {lowTemp}
          </span>
          <span className={styles.lastUpdated}>
            Last updated: {current.last_updated}
          </span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem} id="detail-feels-like">
          <div className={styles.detailIcon}>
            <Thermometer size={22} />
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Feels Like</span>
            <span className={styles.detailValue}>{feelsLike}</span>
          </div>
        </div>

        <div className={styles.detailItem} id="detail-wind">
          <div className={styles.detailIcon}>
            <Wind size={22} />
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Wind</span>
            <span className={styles.detailValue}>
              {windSpeed} <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>({current.wind_dir})</span>
            </span>
          </div>
        </div>

        <div className={styles.detailItem} id="detail-humidity">
          <div className={styles.detailIcon}>
            <Droplets size={22} />
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>Humidity</span>
            <span className={styles.detailValue}>{current.humidity}%</span>
          </div>
        </div>

        <div className={styles.detailItem} id="detail-uv-index">
          <div className={styles.detailIcon}>
            <Sun size={22} />
          </div>
          <div className={styles.detailContent}>
            <span className={styles.detailLabel}>UV Index</span>
            <span className={styles.detailValue}>{current.uv}</span>
            <span className={`${styles.uvBadge} ${uvInfo.class}`}>{uvInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
