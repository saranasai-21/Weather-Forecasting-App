import { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

export function useWeather(city) {
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) {
      setCurrent(null);
      setForecast(null);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}`);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errCode = errData.error?.code;
          
          // Map errors based on specification
          if (res.status === 400 || errCode === 1006) {
            throw new Error("City not found. Please try another name.");
          } else if (res.status === 401 || res.status === 403) {
            throw new Error("Invalid server WeatherAPI key. Please verify the deployment environment variable.");
          } else if (res.status === 500) {
            throw new Error(errData.error?.message || "Server weather key is not configured.");
          } else {
            throw new Error(errData.error?.message || "Unable to fetch weather. Check your connection.");
          }
        }

        const data = await res.json();
        
        if (isMounted) {
          // Wrap location metadata into the current weather block for simple consumption
          setCurrent({ ...data.current, location: data.location });
          setForecast(data.forecast);
        }
      } catch (err) {
        if (isMounted) {
          setCurrent(null);
          setForecast(null);
          
          // Detect network/connection errors
          if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
            setError("Unable to fetch weather. Check your connection.");
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [city]);

  return { current, forecast, loading, error };
}
