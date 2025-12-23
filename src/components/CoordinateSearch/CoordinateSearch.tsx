import React, { useState } from 'react';
import { useCesium } from 'resium';
import { Cartesian3 } from 'cesium';
import './CoordinateSearch.css';

interface CoordinateSearchProps {
  isOpen: boolean;
  onToggle: () => void;
}

const CoordinateSearch: React.FC<CoordinateSearchProps> = ({ isOpen, onToggle }) => {
  const { viewer } = useCesium();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [height, setHeight] = useState('1000');
  const [error, setError] = useState('');

  const handleJump = () => {
    if (!viewer) return;

    setError('');
    
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const heightNum = parseFloat(height) || 1000;

    // Validate coordinates
    if (isNaN(latNum) || isNaN(lonNum)) {
      setError('נא להכניס קואורדינטות תקינות');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      setError('קו רוחב חייב להיות בין -90 ל-90');
      return;
    }

    if (lonNum < -180 || lonNum > 180) {
      setError('קו אורך חייב להיות בין -180 ל-180');
      return;
    }

    try {
      const destination = Cartesian3.fromDegrees(lonNum, latNum, heightNum);
      viewer.camera.flyTo({
        destination: destination,
        duration: 2.0,
      });
    } catch (err) {
      setError('שגיאה בקפיצה למקום');
      console.error(err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJump();
    }
  };

  const handleClose = () => {
    // Don't reset camera position when closing
    onToggle();
  };

  if (!isOpen) {
    return (
      <button className="toggle-search-button" onClick={onToggle} title="פתח חיפוש קואורדינטות">
        📍
      </button>
    );
  }

  return (
    <div className="coordinate-search">
      <div className="coordinate-search-header">
        <h3>קואורדינטות</h3>
        <button className="close-button" onClick={handleClose} title="סגור">
          ×
        </button>
      </div>
      <div className="coordinate-search-inputs">
        <div className="input-group">
          <label>קו רוחב (Latitude):</label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="40.7831"
            step="any"
          />
        </div>
        <div className="input-group">
          <label>קו אורך (Longitude):</label>
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="-73.9654"
            step="any"
          />
        </div>
        <div className="input-group">
          <label>גובה (Height):</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="1000"
            step="any"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleJump} className="jump-button">
          קפוץ למקום
        </button>
      </div>
    </div>
  );
};

export default CoordinateSearch;

