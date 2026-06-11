import React from 'react';
import styles from './WeatherIcon.module.css';

export default function WeatherIcon({ code, iconUrl, size = 64, alt = "Weather status" }) {
  const numericCode = Number(code);

  // Fallback icon handling (in case URL is relative, prepend protocol)
  const getFallbackUrl = (url) => {
    if (!url) return '';
    return url.startsWith('//') ? `https:${url}` : url;
  };

  const renderIcon = () => {
    switch (numericCode) {
      // Clear / Sunny
      case 1000:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Sunny/Clear">
            <circle className={styles.sun} cx="32" cy="32" r="12" />
            <path
              className={styles.sun}
              d="M32 8V12M32 52V56M8 32H12M52 32H56M15 15L17.8 17.8M46.2 46.2L49 49M15 49L17.8 46.2M46.2 17.8L49 15"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        );

      // Partly Cloudy
      case 1003:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Partly Cloudy">
            <g transform="translate(4, -2)">
              <circle className={styles.sun} cx="36" cy="24" r="9" />
              <path
                className={styles.sun}
                d="M36 6V9M36 39V42M18 24H21M51 24H54M23.3 11.3L25.4 13.4M46.6 34.6L48.7 36.7M23.3 36.7L25.4 34.6M46.6 13.4L48.7 11.3"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
            <path
              className={styles.cloud}
              d="M46 38A10 10 0 0036.5 28.5a14 14 0 00-24 5.5A11 11 0 0013.5 48h28A10 10 0 0046 38z"
            />
          </svg>
        );

      // Cloudy / Overcast
      case 1006:
      case 1009:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Cloudy/Overcast">
            <g transform="scale(0.85) translate(8, 4)">
              <path
                className={styles.cloudDark}
                d="M48 36A10 10 0 0038.5 26.5a14 14 0 00-24 5.5A11 11 0 0015 46h28A10 10 0 0048 36z"
              />
            </g>
            <path
              className={styles.cloud}
              d="M44 38A9 9 0 0035.5 29.5a12.6 12.6 0 00-21.6 5a9.9 9.9 0 001.3 19.5h25.2A9 9 0 0044 38z"
            />
          </svg>
        );

      // Mist / Fog
      case 1030:
      case 1135:
      case 1147:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Mist/Fog">
            <line className={`${styles.fogLine} ${styles.fogLine1}`} x1="16" y1="22" x2="48" y2="22" />
            <line className={`${styles.fogLine} ${styles.fogLine2}`} x1="12" y1="32" x2="52" y2="32" />
            <line className={`${styles.fogLine} ${styles.fogLine3}`} x1="20" y1="42" x2="44" y2="42" />
          </svg>
        );

      // Rain / Showers
      case 1063:
      case 1150:
      case 1153:
      case 1180:
      case 1183:
      case 1186:
      case 1189:
      case 1192:
      case 1195:
      case 1240:
      case 1243:
      case 1246:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Rain">
            <path
              className={styles.cloud}
              d="M46 30A10 10 0 0036.5 20.5a14 14 0 00-24 5.5A11 11 0 0013.5 40h28A10 10 0 0046 30z"
            />
            <line className={styles.raindrop1} x1="20" y1="42" x2="20" y2="52" strokeLinecap="round" strokeWidth="2.5" />
            <line className={styles.raindrop2} x1="28" y1="45" x2="28" y2="55" strokeLinecap="round" strokeWidth="2.5" />
            <line className={styles.raindrop3} x1="36" y1="42" x2="36" y2="52" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        );

      // Thunderstorms
      case 1087:
      case 1273:
      case 1276:
      case 1279:
      case 1282:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Thunderstorm">
            <path
              className={styles.cloudDark}
              d="M46 30A10 10 0 0036.5 20.5a14 14 0 00-24 5.5A11 11 0 0013.5 40h28A10 10 0 0046 30z"
            />
            <line className={styles.raindrop1} x1="18" y1="42" x2="18" y2="50" strokeLinecap="round" strokeWidth="2" />
            <line className={styles.raindrop3} x1="38" y1="42" x2="38" y2="50" strokeLinecap="round" strokeWidth="2" />
            <polygon className={styles.lightning} points="28,36 33,36 27,45 32,45 25,55 35,42 29,42" />
          </svg>
        );

      // Snow
      case 1066:
      case 1114:
      case 1117:
      case 1210:
      case 1213:
      case 1216:
      case 1219:
      case 1222:
      case 1225:
      case 1255:
      case 1258:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Snow">
            <path
              className={styles.cloud}
              d="M46 30A10 10 0 0036.5 20.5a14 14 0 00-24 5.5A11 11 0 0013.5 40h28A10 10 0 0046 30z"
            />
            <circle className={`${styles.snowflake} ${styles.snowflake1}`} cx="20" cy="44" r="2.5" />
            <circle className={`${styles.snowflake} ${styles.snowflake2}`} cx="28" cy="46" r="2" />
            <circle className={`${styles.snowflake} ${styles.snowflake3}`} cx="36" cy="43" r="2.2" />
          </svg>
        );

      // Sleet / Freezing Rain
      case 1069:
      case 1072:
      case 1168:
      case 1171:
      case 1198:
      case 1201:
      case 1204:
      case 1207:
      case 1237:
      case 1249:
      case 1252:
      case 1261:
      case 1264:
        return (
          <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Sleet">
            <path
              className={styles.cloud}
              d="M46 30A10 10 0 0036.5 20.5a14 14 0 00-24 5.5A11 11 0 0013.5 40h28A10 10 0 0046 30z"
            />
            <line className={styles.raindrop1} x1="18" y1="42" x2="18" y2="50" strokeLinecap="round" strokeWidth="2" />
            <circle className={`${styles.snowflake} ${styles.snowflake2}`} cx="28" cy="45" r="2" />
            <line className={styles.raindrop3} x1="36" y1="42" x2="36" y2="50" strokeLinecap="round" strokeWidth="2" />
          </svg>
        );

      // Default fallback to API provided static icon
      default:
        return iconUrl ? (
          <img
            src={getFallbackUrl(iconUrl)}
            alt={alt}
            width={size}
            height={size}
            className={styles.fallbackImg}
            loading="lazy"
          />
        ) : (
          // Simple emoji if all else fails
          <span style={{ fontSize: `${size * 0.6}px` }}>☁️</span>
        );
    }
  };

  return <div className={styles.iconWrapper} style={{ width: size, height: size }}>{renderIcon()}</div>;
}
