import React, { useState } from 'react';
import WeatherIcon from './WeatherIcon';
import styles from './Forecast5Day.module.css';

export default function Forecast5Day({ forecast, unit }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  if (!forecast || !forecast.forecastday) return null;

  const forecastDays = forecast.forecastday;

  // Helper to get day name safely without browser timezone offsets
  const getDayName = (dateStr, isToday, isTomorrow) => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Parse date as UTC to prevent browser locale timezone shifts from changing the day
        const date = new Date(Date.UTC(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        ));
        return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
      }
    } catch (e) {
      // Fallback if parsing fails
    }
    return dateStr;
  };

  const handleCardClick = (idx) => {
    if (selectedIdx === idx) {
      setSelectedIdx(null); // toggle close
    } else {
      setSelectedIdx(idx); // open details
    }
  };

  // Helper to format hour time (e.g. 15:00 -> 3 PM)
  const formatHourTime = (timeStr) => {
    try {
      const timePart = timeStr.split(' ')[1];
      const hourVal = parseInt(timePart.split(':')[0], 10);
      const ampm = hourVal >= 12 ? 'PM' : 'AM';
      const displayH = hourVal % 12 === 0 ? 12 : hourVal % 12;
      return `${displayH} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const selectedDay = selectedIdx !== null ? forecastDays[selectedIdx] : null;

  return (
    <div className={`${styles.container} glass-card fade-in`} id="forecast-5day-container">
      <h2 className={styles.title}>5-Day Forecast</h2>
      
      <div className={`${styles.scrollWrapper} custom-scrollbar`}>
        {forecastDays.map((day, idx) => {
          const isToday = idx === 0;
          const isTomorrow = idx === 1;
          const dayName = getDayName(day.date, isToday, isTomorrow);
          
          const maxTemp = unit === 'C' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f);
          const minTemp = unit === 'C' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f);
          const rainChance = day.day.daily_chance_of_rain || 0;

          return (
            <div 
              key={day.date_epoch || idx} 
              className={`${styles.dayCard} ${selectedIdx === idx ? styles.dayCardActive : ''}`}
              onClick={() => handleCardClick(idx)}
              id={`forecast-day-card-${idx}`}
            >
              <span className={styles.dayName}>{dayName}</span>
              <WeatherIcon
                code={day.day.condition.code}
                iconUrl={day.day.condition.icon}
                size={44}
                alt={day.day.condition.text}
              />
              <span className={styles.rainChance}>💧 {rainChance}%</span>
              <div className={styles.tempRange}>
                <span className={styles.maxTemp}>{maxTemp}°</span>
                <span className={styles.minTemp}>{minTemp}°</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable inline detail panel */}
      {selectedDay && (
        <div className={`${styles.detailPanel} fade-in`} id="forecast-day-detail-panel">
          <h3 className={styles.panelTitle}>
            Detailed Forecast for {getDayName(selectedDay.date, selectedIdx === 0, selectedIdx === 1)}
          </h3>

          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Avg Humidity</span>
              <span className={styles.detailVal}>{selectedDay.day.avghumidity}%</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Max Wind</span>
              <span className={styles.detailVal}>
                {unit === 'C' ? `${Math.round(selectedDay.day.maxwind_kph)} km/h` : `${Math.round(selectedDay.day.maxwind_mph)} mph`}
              </span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Sunrise</span>
              <span className={styles.detailVal}>{selectedDay.astro?.sunrise || '--'}</span>
            </div>
            <div className={styles.detailCard}>
              <span className={styles.detailLabel}>Sunset</span>
              <span className={styles.detailVal}>{selectedDay.astro?.sunset || '--'}</span>
            </div>
          </div>

          <div>
            <h4 className={styles.detailLabel} style={{ marginBottom: '8px' }}>Hourly Breakdown (3h intervals)</h4>
            <div className={`${styles.subHourlyWrapper} custom-scrollbar`}>
              {selectedDay.hour
                .filter((_, hIdx) => hIdx % 3 === 0) // filter 3h steps (00, 03, 06, 09, 12, 15, 18, 21)
                .map((hourData, hIdx) => {
                  const hourTempVal = unit === 'C' ? Math.round(hourData.temp_c) : Math.round(hourData.temp_f);
                  return (
                    <div key={hIdx} className={styles.subHourlyItem}>
                      <span className={styles.subHourlyTime}>{formatHourTime(hourData.time)}</span>
                      <WeatherIcon
                        code={hourData.condition.code}
                        iconUrl={hourData.condition.icon}
                        size={24}
                        alt={hourData.condition.text}
                      />
                      <span className={styles.subHourlyTemp}>{hourTempVal}°</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
