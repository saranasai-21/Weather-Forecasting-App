import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudLightning, Sun, Moon, Loader2, AlertTriangle, 
  Search, MapPin, X, HelpCircle, ShieldCheck, Cpu,
  Thermometer, BarChart3, Brain, TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

import { useWeather } from './hooks/useWeather';
import { predictNextDays } from './utils/weatherPredictor';

import CanvasBackground from './components/CanvasBackground';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import Forecast5Day from './components/Forecast5Day';
import AqiGauge from './components/AqiGauge';
import AstronomyCard from './components/AstronomyCard';
import WeatherMap from './components/WeatherMap';
import OutfitSuggestions from './components/OutfitSuggestions';
import WeatherComparison from './components/WeatherComparison';
import LinkedInCard from './components/LinkedInCard';
import { parseLocationFromUrl } from './utils/linkParser';

import styles from './App.module.css';

export default function App() {
  const dashboardRef = useRef(null);
  const heroRef = useRef(null);
  const midRef = useRef(null);
  const insightsRef = useRef(null);
  const chartRef = useRef(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  // Theme state: default to dark, synced with globals.css rules
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('temp_unit') || 'C';
  });

  const [showKeyForm, setShowKeyForm] = useState(false);

  // Search, Autocomplete & History states
  const [city, setCity] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem('recent_searches') || '[]');
  });

  // Main cities data streams
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  // Compare Mode states
  const [showCompare, setShowCompare] = useState(false);
  const [compareInput, setCompareInput] = useState('');
  const [compareCity, setCompareCity] = useState('');
  const [compareSuggestions, setCompareSuggestions] = useState([]);
  const [compareWeatherData, setCompareWeatherData] = useState(null);
  const [compareForecastData, setCompareForecastData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);

  // Map toggle state
  const [showMap, setShowMap] = useState(false);

  // Alert detailed description expanding state
  const [alertExpanded, setAlertExpanded] = useState(false);

  // LinkedIn Profile state
  const [linkedInProfile, setLinkedInProfile] = useState(null);

  // Synchronize CSS theme configurations on body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist temp unit choice
  useEffect(() => {
    localStorage.setItem('temp_unit', unit);
  }, [unit]);

  // Monitor scroll progress and active view index
  useEffect(() => {
    const dashboard = dashboardRef.current;
    if (!dashboard) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = dashboard;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        setScrollProgress((scrollTop / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }

      const sections = [
        { id: 'hero', ref: heroRef },
        { id: 'mid', ref: midRef },
        { id: 'insights', ref: insightsRef },
        { id: 'chart', ref: chartRef }
      ];

      let currentActive = 'hero';
      const containerRect = dashboard.getBoundingClientRect();

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top - containerRect.top < containerRect.height * 0.4) {
            currentActive = section.id;
          }
        }
      }
      setActiveSection(currentActive);
    };

    dashboard.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      dashboard.removeEventListener('scroll', handleScroll);
    };
  }, [weatherData, showCompare, showMap]);

  // Debounced search autocomplete for primary city
  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput)}`);
        if (res.ok) {
          const list = await res.json();
          setSuggestions(list.slice(0, 5));
        }
      } catch (e) {
        console.error('Autocomplete query failed:', e);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounced search autocomplete for comparison city
  useEffect(() => {
    if (compareInput.trim().length < 2) {
      setCompareSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(compareInput)}`);
        if (res.ok) {
          const list = await res.json();
          setCompareSuggestions(list.slice(0, 5));
        }
      } catch (e) {
        console.error('Autocomplete compare query failed:', e);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [compareInput]);

  // Invoke hooks to fetch weather forecasts
  const weatherResult = useWeather(city);
  const compareResult = useWeather(compareCity);

  // Sync main weather data
  useEffect(() => {
    setWeatherData(weatherResult.current);
    setForecastData(weatherResult.forecast);
    setLoading(weatherResult.loading);
    setError(weatherResult.error);
    
    // Add successful queries to recent history list
    if (weatherResult.current && weatherResult.current.location) {
      const name = weatherResult.current.location.name;
      setRecentSearches(prev => {
        const filtered = prev.filter(c => c.toLowerCase() !== name.toLowerCase());
        const next = [name, ...filtered].slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(next));
        return next;
      });
    }
  }, [weatherResult.current, weatherResult.forecast, weatherResult.loading, weatherResult.error]);

  // Sync comparison city data
  useEffect(() => {
    setCompareWeatherData(compareResult.current);
    setCompareForecastData(compareResult.forecast);
    setCompareLoading(compareResult.loading);
    setCompareError(compareResult.error);
  }, [compareResult.current, compareResult.forecast, compareResult.loading, compareResult.error]);

  // Geolocation Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setCity('Hyderabad');
      setLinkedInProfile(null);
      return;
    }

    setIsLoadingLoc(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLoadingLoc(false);
        setCity(`${latitude},${longitude}`);
        setLinkedInProfile(null);
      },
      (err) => {
        console.warn('Geolocation failed. Silently falling back to Hyderabad.');
        setIsLoadingLoc(false);
        setCity('Hyderabad');
        setLinkedInProfile(null);
      },
      { timeout: 8000 }
    );
  };

  // Initial load hook
  useEffect(() => {
    handleLocateUser();
  }, []);

  const handleResetApiKey = () => {
    setWeatherData(null);
    setForecastData(null);
    setCity('');
    setCompareCity('');
    setShowCompare(false);
    setShowKeyForm(false);
    setLinkedInProfile(null);
    handleLocateUser();
  };

  const processSearchQuery = (query, isCompare = false) => {
    if (!query) return false;
    
    const parsed = parseLocationFromUrl(query);
    if (parsed) {
      if (parsed.type === 'linkedin' && parsed.profile) {
        if (isCompare) {
          setCompareCity(parsed.location);
          setCompareInput('');
          setCompareSuggestions([]);
          setLinkedInProfile(parsed.profile);
        } else {
          setCity(parsed.location);
          setSearchInput('');
          setSuggestions([]);
          setLinkedInProfile(parsed.profile);
        }
      } else {
        if (isCompare) {
          setCompareCity(parsed.location);
          setCompareInput('');
          setCompareSuggestions([]);
        } else {
          setCity(parsed.location);
          setSearchInput('');
          setSuggestions([]);
          setLinkedInProfile(null);
        }
      }
      return true;
    }
    return false;
  };

  const handleSelectCity = (cityName) => {
    setCity(cityName);
    setSearchInput('');
    setSuggestions([]);
    setLinkedInProfile(null);
  };

  const handleSelectCompareCity = (cityName) => {
    setCompareCity(cityName);
    setCompareInput('');
    setCompareSuggestions([]);
  };

  const handleGoHome = () => {
    setCity('');
    setSearchInput('');
    setSuggestions([]);
    setCompareCity('');
    setCompareInput('');
    setShowCompare(false);
    setShowMap(false);
    setLinkedInProfile(null);
    handleLocateUser();
  };

  // Parse server weather alert levels
  const getAlertSeverityColor = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s.includes('extreme')) return '#ff0000';
    if (s.includes('severe')) return '#ff6b00';
    if (s.includes('moderate')) return '#ffd700';
    return '#00b894';
  };

  const activeAlerts = forecastData?.alerts?.alert || [];

  // Parse weekday dates for chart axis
  const getDayName = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    } catch (e) {
      return dateStr;
    }
  };

  // Recharts Temperature chart builder
  const chartData = forecastData?.forecastday?.map(day => ({
    name: getDayName(day.date),
    Max: unit === 'C' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f),
    Min: unit === 'C' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)
  })) || [];

  // rule-based client insights generator
  const aiInsights = predictNextDays(forecastData, weatherData);

  return (
    <div className={styles.appContainer}>
      {/* Immersive weather-reactive animation canvas */}
      {weatherData && (
        <CanvasBackground 
          code={weatherData.condition.code} 
          isDay={weatherData.is_day} 
        />
      )}

      {/* Pulsing severe weather header alert banner */}
      {activeAlerts.length > 0 && !showKeyForm && (
        <div className={styles.alertsBanner} id="severe-weather-alerts-banner">
          <span>⚠️ SEVERE WEATHER ALERT: {activeAlerts[0].event} active for {weatherData?.location?.name}</span>
          <button 
            onClick={() => document.getElementById('alerts-card-node')?.scrollIntoView({ behavior: 'smooth' })} 
            style={{ background: 'transparent', border: '1px solid #fca5a5', color: '#fca5a5', borderRadius: '20px', padding: '2px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Read details
          </button>
        </div>
      )}

      <header className={styles.topBar}>
        <div 
          className={styles.logoGroup} 
          onClick={handleGoHome} 
          style={{ cursor: 'pointer' }}
          title="Go to Home / Current Location"
        >
          <CloudLightning size={28} className={styles.loadingSpinner} style={{ animationDuration: '3s', marginBottom: 0 }} />
          <span className={styles.appTitle}>SkyGlass Pro</span>
        </div>

        {/* Floating Autocomplete Search input */}
        {!showKeyForm && (
          <div className={styles.searchSection} id="primary-search-box">
            <div className={styles.searchForm}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for a city or paste profile link..."
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  if (val.trim() && (val.includes('http') || val.includes('www.') || val.includes('linkedin.com') || val.includes('.org') || val.includes('.com/'))) {
                    const parsed = parseLocationFromUrl(val);
                    if (parsed) {
                      processSearchQuery(val, false);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                      const wasUrl = processSearchQuery(query, false);
                      if (!wasUrl) {
                        setCity(query);
                        setSearchInput('');
                        setSuggestions([]);
                        setLinkedInProfile(null);
                      }
                    }
                  }
                }}
                className={styles.searchInput}
                id="city-autocomplete-input"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className={styles.clearBtn}>
                  <X size={16} />
                </button>
              )}
            </div>
            {suggestions.length > 0 && (
              <ul className={styles.suggestionsList}>
                {suggestions.map((s) => (
                  <li 
                    key={s.id} 
                    onClick={() => handleSelectCity(`${s.name}, ${s.country}`)}
                    className={styles.suggestionItem}
                  >
                    {s.name}, {s.region ? `${s.region}, ` : ''}{s.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={styles.headerActions}>
          {!showKeyForm && (
            <>
              {/* Compare City Button */}
              <button
                onClick={() => {
                  setShowCompare(!showCompare);
                  if (showCompare) {
                    setCompareCity('');
                    setCompareInput('');
                  }
                }}
                className={`${styles.iconBtn} ${showCompare ? styles.compareActive : ''}`}
                title="Compare Cities"
                aria-label="Toggle comparison mode"
                id="compare-mode-toggle"
                style={{ width: 'auto', borderRadius: '20px', padding: '0 12px', fontWeight: 600, fontSize: '0.8rem' }}
              >
                ⚖️ {showCompare ? 'Exit Compare' : 'Compare City'}
              </button>

              <button
                onClick={handleLocateUser}
                disabled={isLoadingLoc}
                className={styles.iconBtn}
                title="Detect Geolocation"
                id="gps-locate-button"
              >
                {isLoadingLoc ? <Loader2 size={18} className={styles.loadingSpinner} style={{ marginBottom: 0 }} /> : <MapPin size={18} />}
              </button>
            </>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={styles.iconBtn}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
            id="theme-switch-btn"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Scroll Progress Bar */}
      {!showKeyForm && weatherData && !loading && !error && !showCompare && (
        <div className={styles.scrollProgressContainer}>
          <div 
            className={styles.scrollProgressBar} 
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Recent history selector pill row */}
      {!showKeyForm && recentSearches.length > 0 && (
        <div className={styles.recentRow} id="recent-searches-row">
          <span>Recent:</span>
          {recentSearches.map((name, i) => (
            <button 
              key={i} 
              onClick={() => handleSelectCity(name)}
              className={styles.recentPill}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {!showKeyForm && (
        <>
          {loading && !weatherData && (
            <div className={styles.stateContainer} id="loading-spinner-wrapper">
              <Loader2 size={48} className={styles.loadingSpinner} />
              <p>Fetching weather systems...</p>
            </div>
          )}

          {error && !loading && (
            <div className={`${styles.stateContainer} glass-card fade-in`} id="dashboard-error-panel">
              <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
              <h2>Connection Error</h2>
              <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px 0' }}>{error}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleResetApiKey} className={styles.iconBtn} style={{ borderRadius: '20px', width: 'auto', padding: '0 20px', background: '#d97706', borderColor: '#d97706', color: 'white' }}>
                  Retry
                </button>
                <button onClick={handleLocateUser} className={styles.iconBtn} style={{ borderRadius: '20px', width: 'auto', padding: '0 20px', background: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: 'white' }}>
                  Load Default
                </button>
              </div>
            </div>
          )}

          {weatherData && !loading && !error && (
            <>
              {/* Compare Mode Layout (Side-by-side columns) */}
              {showCompare ? (
                <div className={styles.compareModeGrid} id="compare-mode-grid">
                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '6px' }} className="custom-scrollbar">
                    {/* Primary City Mini Dashboard Card */}
                    <div className="glass-card" style={{ padding: '20px' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 600 }}>Active Search Dashboard</span>
                      <CurrentWeather current={weatherData} todayForecast={forecastData?.forecastday?.[0]?.day} unit={unit} />
                    </div>
                  </div>

                  <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Secondary City Search & Table */}
                    <div className="glass-card" style={{ padding: '20px', position: 'relative', zIndex: 1000 }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Select Target Comparison City</span>
                      <div className={styles.searchForm}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                          type="text"
                          placeholder="Compare city or paste link..."
                          value={compareInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCompareInput(val);
                            if (val.trim() && (val.includes('http') || val.includes('www.') || val.includes('linkedin.com') || val.includes('.org') || val.includes('.com/'))) {
                              const parsed = parseLocationFromUrl(val);
                              if (parsed) {
                                processSearchQuery(val, true);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const query = e.target.value.trim();
                              if (query) {
                                const wasUrl = processSearchQuery(query, true);
                                if (!wasUrl) {
                                  setCompareCity(query);
                                  setCompareInput('');
                                  setCompareSuggestions([]);
                                }
                              }
                            }
                          }}
                          className={styles.searchInput}
                          id="compare-city-autocomplete-input"
                        />
                        {compareInput && (
                          <button onClick={() => setCompareInput('')} className={styles.clearBtn}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {compareSuggestions.length > 0 && (
                        <ul className={styles.suggestionsList} style={{ zIndex: 1002 }}>
                          {compareSuggestions.map(s => (
                            <li 
                              key={s.id} 
                              onClick={() => handleSelectCompareCity(`${s.name}, ${s.country}`)}
                              className={styles.suggestionItem}
                            >
                              {s.name}, {s.country}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {compareLoading && (
                      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 size={32} className={styles.loadingSpinner} />
                        <p>Loading comparison data...</p>
                      </div>
                    )}

                    {compareError && (
                      <div className="glass-card" style={{ padding: '30px', textAlign: 'center', borderColor: '#ef4444' }}>
                        <AlertTriangle size={36} style={{ color: '#ef4444', marginBottom: '10px' }} />
                        <p>{compareError}</p>
                      </div>
                    )}

                    {compareWeatherData && !compareLoading && !compareError && (
                      <WeatherComparison
                        cityAData={weatherData ? { current: weatherData, location: weatherData.location } : null}
                        cityBData={compareWeatherData ? { current: compareWeatherData, location: compareWeatherData.location } : null}
                        onClose={() => {
                          setShowCompare(false);
                          setCompareCity('');
                          setCompareWeatherData(null);
                        }}
                        unit={unit}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Main Dashboard Fullscreen grid */
                <>
                  <div className={`${styles.dashboardGrid} custom-scrollbar`} ref={dashboardRef}>
                    <div className={styles.leftPanel} ref={heroRef}>
                    {linkedInProfile && (
                      <LinkedInCard 
                        profile={linkedInProfile} 
                        onDismiss={() => setLinkedInProfile(null)} 
                      />
                    )}
                    <CurrentWeather 
                      current={weatherData} 
                      todayForecast={forecastData?.forecastday?.[0]?.day} 
                      unit={unit} 
                    />
                    
                    <button 
                      onClick={() => setShowMap(!showMap)} 
                      className={styles.mapToggleBtn}
                      id="toggle-map-btn"
                    >
                      🗺️ {showMap ? 'Hide Map Panel' : 'View Weather Map'}
                    </button>

                    {showMap && (
                      <WeatherMap 
                        lat={weatherData.location.lat} 
                        lon={weatherData.location.lon} 
                        cityName={weatherData.location.name}
                        temp={weatherData.temp_c}
                        unit={unit}
                      />
                    )}
                  </div>

                  <div className={styles.rightPanel}>
                    <HourlyForecast 
                      forecast={forecastData} 
                      location={weatherData.location} 
                      unit={unit} 
                    />
                    
                    <Forecast5Day 
                      forecast={forecastData} 
                      unit={unit} 
                    />
                  </div>

                  <div className={styles.middleSection} ref={midRef}>
                    <AqiGauge 
                      airQuality={weatherData.air_quality} 
                      humidity={weatherData.humidity}
                      windSpeed={weatherData.wind_kph}
                    />
                    
                    <AstronomyCard 
                      astronomy={{ astro: forecastData?.forecastday?.[0]?.astro }} 
                    />

                    {/* Severe Weather Alerts details card */}
                    <div className={`${styles.alertsCard} glass-card fade-in`} id="alerts-card-node">
                      <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#ff6b00', fontWeight: 600 }}>Severe Weather alerts</span>
                      {activeAlerts.length > 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span 
                            className={styles.alertBadge} 
                            style={{ backgroundColor: getAlertSeverityColor(activeAlerts[0].severity), alignSelf: 'flex-start' }}
                          >
                            {activeAlerts[0].severity}
                          </span>
                          <h3 className={styles.alertHeadline}>{activeAlerts[0].event}</h3>
                          <span className={styles.alertMeta}>Effective: {activeAlerts[0].effective}</span>
                          <span className={styles.alertMeta}>Expires: {activeAlerts[0].expires}</span>
                          <p className={styles.alertDesc}>
                            {alertExpanded 
                              ? activeAlerts[0].desc 
                              : `${activeAlerts[0].desc.slice(0, 140)}...`}
                          </p>
                          <button onClick={() => setAlertExpanded(!alertExpanded)} className={styles.readMoreBtn}>
                            {alertExpanded ? 'Read less' : 'Read full advisory'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div className={styles.greenBadge}>
                            <ShieldCheck size={18} />
                            No Active Warnings
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                            Meteorological alert systems are calm. No alerts for your coordinates.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.middleSection2} ref={insightsRef}>
                    <OutfitSuggestions current={weatherData} />

                    {/* AI Weather predictions insights card */}
                    <div className={`${styles.aiPredictCard} glass-card fade-in`} id="ai-predictions-card">
                      <h3 className={styles.aiHeader}>
                        <Cpu size={20} /> AI Weather Insights
                      </h3>
                      <ul className={styles.aiList}>
                        {aiInsights.map((pred, i) => (
                          <li key={i} className={styles.aiBullet}>
                            <div className={styles.aiBulletHeader}>
                              <span>{pred.emoji}</span>
                              <span 
                                className={`${styles.aiTag} ${
                                  pred.type === 'warning' ? styles.tagWarning :
                                  pred.type === 'info' ? styles.tagInfo :
                                  pred.type === 'good' ? styles.tagGood :
                                  styles.tagExtreme
                                }`}
                              >
                                {pred.tag}
                              </span>
                            </div>
                            <p className={styles.aiText}>{pred.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recharts Area temperature trends card */}
                  <div className={styles.bottomSection} ref={chartRef}>
                    <div className={`${styles.chartCard} glass-card`}>
                      <h3 className={styles.chartTitle}>5-Day Temperature Trend</h3>
                      <div style={{ width: '100%', height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={chartData} 
                            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="name" 
                              stroke="#cbd5e1" 
                              fontSize={11} 
                              tickLine={false} 
                            />
                            <YAxis 
                              stroke="#cbd5e1" 
                              fontSize={11} 
                              tickLine={false} 
                              domain={['dataMin - 3', 'dataMax + 3']} 
                            />
                            <Tooltip 
                              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#f8fafc' }} 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Max" 
                              stroke="#f59e0b" 
                              fillOpacity={1} 
                              fill="url(#colorMax)" 
                              strokeWidth={2}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="Min" 
                              stroke="#60a5fa" 
                              fillOpacity={1} 
                              fill="url(#colorMin)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Sidebar (Height Bar Indicator) */}
                {!showKeyForm && weatherData && !loading && !error && !showCompare && (
                  <div className={styles.heightBarNav} id="quick-scroll-navigator">
                    <div className={styles.heightBarTrack}>
                      <div 
                        className={styles.heightBarIndicator} 
                        style={{ height: `${scrollProgress}%` }}
                      />
                    </div>
                    <button 
                      onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className={`${styles.navDot} ${activeSection === 'hero' ? styles.navDotActive : ''}`}
                      title="Current & Forecast"
                      aria-label="Scroll to Current Conditions"
                    >
                      <span className={styles.dotIcon}><Thermometer size={16} /></span>
                      <span className={styles.dotLabel}>Overview</span>
                    </button>
                    <button 
                      onClick={() => midRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className={`${styles.navDot} ${activeSection === 'mid' ? styles.navDotActive : ''}`}
                      title="Air Quality & Astronomy"
                      aria-label="Scroll to Air Quality and Astronomy"
                    >
                      <span className={styles.dotIcon}><BarChart3 size={16} /></span>
                      <span className={styles.dotLabel}>Metrics</span>
                    </button>
                    <button 
                      onClick={() => insightsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className={`${styles.navDot} ${activeSection === 'insights' ? styles.navDotActive : ''}`}
                      title="Outfits & AI Predictions"
                      aria-label="Scroll to Smart Suggestions"
                    >
                      <span className={styles.dotIcon}><Brain size={16} /></span>
                      <span className={styles.dotLabel}>Insights</span>
                    </button>
                    <button 
                      onClick={() => chartRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className={`${styles.navDot} ${activeSection === 'chart' ? styles.navDotActive : ''}`}
                      title="5-Day Temperature Trend"
                      aria-label="Scroll to Temp Chart"
                    >
                      <span className={styles.dotIcon}><TrendingUp size={16} /></span>
                      <span className={styles.dotLabel}>Trends</span>
                    </button>
                  </div>
                )}
              </>
            )}
            </>
          )}
        </>
      )}
    </div>
  );
}
