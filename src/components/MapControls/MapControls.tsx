import React from 'react';
import { useCesium } from 'resium';
import './MapControls.css';

const MapControls: React.FC = () => {
  const { viewer } = useCesium();

  const handleZoomIn = () => {
    if (!viewer) return;
    const camera = viewer.camera;
    // Zoom in along the view vector
    const amount = camera.positionCartographic.height * 0.5;
    camera.zoomIn(amount);
  };

  const handleZoomOut = () => {
    if (!viewer) return;
    const camera = viewer.camera;
    // Zoom out along the view vector
    const amount = camera.positionCartographic.height;
    camera.zoomOut(amount);
  };

  return (
    <div className="map-controls">
      <div className="control-group">
        <button 
          className="control-button zoom-in" 
          onClick={handleZoomIn}
          title="זום אין"
        >
          +
        </button>
        <button 
          className="control-button zoom-out" 
          onClick={handleZoomOut}
          title="זום אאוט"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default MapControls;
