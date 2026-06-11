import React from 'react';
import WeatherIcon from './WeatherIcon';
import styles from './HourlyForecast.module.css';

export default function HourlyForecast({ forecast, location, unit }) {
  if (!forecast || !forecast.forecastday || !location) return null;

  const forecastdays = forecast.forecastday;
  
  if (forecastdays.length === 0) return null;

  // Extract the city's current local hour
  // location.localtime is in format "YYYY-MM-DD HH:MM"
  let currentHour = 0;
  try {
    const timePart = location.localtime.split(' ')[1];
    currentHour = parseInt(timePart.split(':')[0], 10);
  } catch (err) {
    // Fallback to browser's current hour if parse fails
    currentHour = new Date().getHours();
  }

  // Combine today's and tomorrow's hours to get a seamless 24h timeline
  const todayHours = forecastdays[0].hour;
  const tomorrowHours = forecastdays[1]?.hour || [];

  const slicedToday = todayHours.slice(currentHour);
  let next24Hours = [...slicedToday];

  if (next24Hours.length < 24 && tomorrowHours.length > 0) {
    const remaining = 24 - next24Hours.length;
    next24Hours = [...next24Hours, ...tomorrowHours.slice(0, remaining)];
  }

  // Helper to format time into "3 PM" or "12 AM" style
  const formatTime = (timeStr) => {
    try {
      const timePart = timeStr.split(' ')[1];
      const [hourStr] = timePart.split(':');
      const h = parseInt(hourStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return `${displayHour} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div className={`${styles.container} glass-card fade-in`} id="hourly-forecast-container">
      <h2 className={styles.title}>Hourly Forecast (Next 24h)</h2>
      <div className={`${styles.scrollWrapper} custom-scrollbar`}>
        {next24Hours.map((hourData, idx) => {
          const tempVal = unit === 'C' ? Math.round(hourData.temp_c) : Math.round(hourData.temp_f);
          
          // Mark the first hour as "Now" for better context
          const isNow = idx === 0;

          return (
            <div 
              key={hourData.time_epoch || idx} 
              className={`${styles.hourlyItem} ${isNow ? styles.activeItem : ''}`}
              id={`hourly-item-${idx}`}
            >
              <span className={styles.time}>
                {isNow ? 'Now' : formatTime(hourData.time)}
              </span>
              <WeatherIcon
                code={hourData.condition.code}
                iconUrl={hourData.condition.icon}
                size={38}
                alt={hourData.condition.text}
              />
              <span className={styles.temp}>{tempVal}°</span>
              <span className={styles.rainChance}>
                💧 {hourData.chance_of_rain}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
