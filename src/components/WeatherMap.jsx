import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMap, FiLayers } from 'react-icons/fi';
import styles from './WeatherMap.module.css';

// Import Leaflet assets directly to resolve default marker 404 bugs in Vite bundler builds
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to dynamically pan/re-center map coordinates
function MapRecenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 9);
    }
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon, cityName, temp, unit }) {
  const [activeLayer, setActiveLayer] = useState(null); // null represents base OSM only

  // OpenWeatherMap tile layer construction through a server-side proxy
  const getOwmLayerUrl = (layerType) => {
    return `/api/owm-tile?layer=${layerType}&z={z}&x={x}&y={y}`;
  };

  const layers = [
    { id: 'temp', name: 'Temp', param: 'temp' },
    { id: 'precipitation', name: 'Precip', param: 'precipitation' },
    { id: 'wind', name: 'Wind', param: 'wind' }
  ];

  const handleToggleLayer = (layerId) => {
    if (activeLayer === layerId) {
      setActiveLayer(null);
    } else {
      setActiveLayer(layerId);
    }
  };

  if (!lat || !lon) return null;

  return (
    <div className={`${styles.mapWrapper} glass-card fade-in`} id="weather-map-wrapper">
      <div className={styles.mapHeader}>
        <span className={styles.title}>
          <FiMap size={18} /> Weather Radar & Map
        </span>
        <div className={styles.controls}>
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => handleToggleLayer(layer.id)}
              className={`${styles.mapBtn} ${activeLayer === layer.id ? styles.activeBtn : ''}`}
              title="Toggle weather overlay"
              id={`layer-toggle-btn-${layer.id}`}
            >
              <FiLayers size={12} /> {layer.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.mapContainer} id="leaflet-map-container">
        <MapContainer
          center={[lat, lon]}
          zoom={9}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Base OSM Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* OWM Overlay Tile Layer */}
          {activeLayer && (
            <TileLayer
              key={activeLayer}
              url={getOwmLayerUrl(activeLayer)}
              opacity={0.65}
              zIndex={10}
            />
          )}

          <Marker position={[lat, lon]}>
            <Popup>
              <div className={styles.popupText}>
                <span className={styles.popupCity}>{cityName}</span>
                <span className={styles.popupTemp}>Current temp: {Math.round(temp)}°{unit}</span>
              </div>
            </Popup>
          </Marker>

          <MapRecenter lat={lat} lon={lon} />
        </MapContainer>
      </div>
    </div>
  );
}
