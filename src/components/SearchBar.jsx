import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, onLocate, isLoadingLoc, unit, setUnit }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city (e.g., London, Tokyo)..."
          className={styles.searchInput}
          id="city-search-input"
        />
        <button type="submit" className={styles.searchBtn} aria-label="Search city" id="search-button">
          <Search size={20} />
        </button>
      </form>

      <button
        onClick={onLocate}
        disabled={isLoadingLoc}
        className={styles.geoBtn}
        title="Detect Current Location"
        aria-label="Use current location"
        id="geolocation-button"
      >
        {isLoadingLoc ? (
          <Loader2 size={20} className={styles.loadingRotate} />
        ) : (
          <MapPin size={20} />
        )}
      </button>

      <div className={styles.unitToggleContainer}>
        <button
          onClick={() => setUnit('C')}
          className={`${styles.unitBtn} ${unit === 'C' ? styles.activeUnit : ''}`}
          aria-label="Switch to Celsius"
          id="unit-toggle-c"
        >
          °C
        </button>
        <button
          onClick={() => setUnit('F')}
          className={`${styles.unitBtn} ${unit === 'F' ? styles.activeUnit : ''}`}
          aria-label="Switch to Fahrenheit"
          id="unit-toggle-f"
        >
          °F
        </button>
      </div>
    </div>
  );
}
