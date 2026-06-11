import React from 'react';
import { FiSunrise, FiSunset } from 'react-icons/fi';
import { WiMoonrise, WiMoonset } from 'react-icons/wi';
import styles from './AstronomyCard.module.css';

export default function AstronomyCard({ astronomy, forecastday }) {
  if (!astronomy || !astronomy.astro) return null;

  const { sunrise, sunset, moonrise, moonset, moon_phase, moon_illumination } = astronomy.astro;

  // Parser helper to add/subtract minutes for golden hour calculation
  const parseTime = (timeStr) => {
    const [time, ampm] = timeStr.split(' ');
    const [hrs, mins] = time.split(':');
    let h = parseInt(hrs, 10);
    const m = parseInt(mins, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return { h, m };
  };

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m.toString().padStart(2, '0');
    return `${displayHour}:${displayMin} ${ampm}`;
  };

  const getGoldenHour = (sunriseStr, sunsetStr) => {
    try {
      const sr = parseTime(sunriseStr);
      const ss = parseTime(sunsetStr);

      // Morning Golden Hour: 30 minutes starting from sunrise
      let srMins = sr.m + 30;
      let srHrs = sr.h;
      if (srMins >= 60) {
        srMins -= 60;
        srHrs = (srHrs + 1) % 24;
      }

      // Evening Golden Hour: 30 minutes before sunset to sunset
      let ssMins = ss.m - 30;
      let ssHrs = ss.h;
      if (ssMins < 0) {
        ssMins += 60;
        ssHrs = (ssHrs - 1 + 24) % 24;
      }

      return {
        morning: `${sunriseStr} - ${formatTime(srHrs, srMins)}`,
        evening: `${formatTime(ssHrs, ssMins)} - ${sunsetStr}`
      };
    } catch (e) {
      return { morning: "05:30 AM - 06:00 AM", evening: "06:15 PM - 06:45 PM" };
    }
  };

  const goldenHour = getGoldenHour(sunrise, sunset);

  // Renders the exact illuminated curve of the moon based on its current phase name
  const renderMoonSvg = (phase) => {
    const normalized = (phase || 'new moon').trim().toLowerCase();
    
    return (
      <svg viewBox="0 0 100 100" className={styles.moonSvg} aria-label={`Moon phase: ${phase}`}>
        {/* Dark Slate Base representing the unilluminated shadow side */}
        <circle cx="50" cy="50" r="40" fill="#334155" />
        
        {/* Illumination overlays */}
        {normalized === 'full moon' && (
          <circle cx="50" cy="50" r="40" fill="#fef08a" />
        )}
        
        {normalized === 'waxing crescent' && (
          <path d="M 50 10 A 40 40 0 0 1 50 90 A 20 40 0 0 0 50 10" fill="#fef08a" />
        )}
        
        {normalized === 'first quarter' && (
          <path d="M 50 10 A 40 40 0 0 1 50 90 Z" fill="#fef08a" />
        )}
        
        {normalized === 'waxing gibbous' && (
          <path d="M 50 10 A 40 40 0 0 1 50 90 A 20 40 0 0 1 50 10" fill="#fef08a" />
        )}
        
        {normalized === 'waning gibbous' && (
          <path d="M 50 10 A 40 40 0 0 0 50 90 A 20 40 0 0 0 50 10" fill="#fef08a" />
        )}
        
        {normalized === 'third quarter' && (
          <path d="M 50 10 A 40 40 0 0 0 50 90 Z" fill="#fef08a" />
        )}
        
        {normalized === 'waning crescent' && (
          <path d="M 50 10 A 40 40 0 0 0 50 90 A 20 40 0 0 1 50 10" fill="#fef08a" />
        )}
      </svg>
    );
  };

  return (
    <div className={`${styles.card} glass-card fade-in`} id="astronomy-card-node">
      <h2 className={styles.title}>Sun & Moon Cycles</h2>

      <div className={styles.astronomyGrid}>
        <div className={styles.astroSection}>
          <span className={styles.astroTitle}>Solar</span>
          <div className={styles.astroRow}>
            <FiSunrise size={22} className={styles.astroIcon} />
            <div className={styles.moonText}>
              <span className={styles.astroLabel}>Sunrise</span>
              <span className={styles.astroValue}>{sunrise}</span>
            </div>
          </div>
          <div className={styles.astroRow}>
            <FiSunset size={22} className={styles.astroIcon} />
            <div className={styles.moonText}>
              <span className={styles.astroLabel}>Sunset</span>
              <span className={styles.astroValue}>{sunset}</span>
            </div>
          </div>
        </div>

        <div className={styles.astroSection}>
          <span className={styles.astroTitle}>Lunar</span>
          <div className={styles.astroRow}>
            <WiMoonrise size={26} className={styles.moonIcon} />
            <div className={styles.moonText}>
              <span className={styles.astroLabel}>Moonrise</span>
              <span className={styles.astroValue}>{moonrise}</span>
            </div>
          </div>
          <div className={styles.astroRow}>
            <WiMoonset size={26} className={styles.moonIcon} />
            <div className={styles.moonText}>
              <span className={styles.astroLabel}>Moonset</span>
              <span className={styles.astroValue}>{moonset}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.moonVisualContainer}>
        {renderMoonSvg(moon_phase)}
        <div className={styles.moonText}>
          <span className={styles.moonPhaseName}>{moon_phase}</span>
          <span className={styles.moonIllum}>Illumination: {moon_illumination}%</span>
        </div>
      </div>

      <div className={styles.goldenHourContainer}>
        <div className={styles.goldenHourBanner}>
          <span className={styles.goldenLabel}>🌅 Golden Hour Morning</span>
          <span className={styles.goldenValue}>{goldenHour.morning}</span>
        </div>
        <div className={styles.goldenHourBanner}>
          <span className={styles.goldenLabel}>🌇 Golden Hour Evening</span>
          <span className={styles.goldenValue}>{goldenHour.evening}</span>
        </div>
      </div>
    </div>
  );
}
