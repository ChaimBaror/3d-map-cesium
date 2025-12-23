import React, { useState, useEffect, useRef } from 'react';
import { Drone, Point, SensorInfo } from '../../hooks/useDrones';
import { Viewer, useCesium } from 'resium';
import { Cartesian3, HeadingPitchRoll, Math as CesiumMath } from 'cesium';
import './DroneDashboard.css';

interface DroneDashboardProps {
  drones: Drone[];
  onAddDrone: (drone: Omit<Drone, 'id' | 'isPaused' | 'sensorInfo' | 'modelUri'>) => void;
  onJumpTo: (drone: Drone) => void;
  onRemoveDrone: (id: string) => void;
  onUpdateDrone: (id: string, updates: Partial<Drone>) => void;
  activeRouteDroneId: string | null;
  setActiveRouteDroneId: (id: string | null) => void;
  onClearRoute: (id: string) => void;
  onUpdateRoutePoint: (droneId: string, pointIndex: number, updates: Partial<Point>) => void;
  onRemoveRoutePoint: (droneId: string, pointIndex: number) => void;
  isPickingInitialLocation: boolean;
  setIsPickingInitialLocation: (val: boolean) => void;
  tempInitialLocation: Point | null;
}

const CameraController: React.FC<{ drone: Drone }> = ({ drone }) => {
  const { viewer } = useCesium();
  const { point, sensorInfo } = drone;

  useEffect(() => {
    if (viewer) {
      const heading = CesiumMath.toRadians(sensorInfo.azimuth);
      const pitch = CesiumMath.toRadians(sensorInfo.elevation);
      const roll = 0;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(point.lon, point.lat, point.hae),
        orientation: {
          heading: heading,
          pitch: pitch,
          roll: roll
        }
      });
    }
  }, [viewer, point, sensorInfo]);

  return null;
};

const DroneCameraView: React.FC<{ drone: Drone }> = ({ drone }) => {
  const { sensorInfo } = drone;

  return (
    <div className="drone-camera-view">
      <Viewer
        full
        selectionIndicator={false}
        timeline={false}
        animation={false}
        geocoder={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        fullscreenButton={false}
        infoBox={false}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraController drone={drone} />
      </Viewer>
      {/* Invisible overlay to block interactions */}
      <div className="camera-interaction-blocker" />
      <div className="camera-overlay">
        <div className="camera-crosshair">+</div>
        <div className="camera-info">
          AZ: {sensorInfo.azimuth}° | EL: {sensorInfo.elevation}°
        </div>
      </div>
    </div>
  );
};

const DroneDashboard: React.FC<DroneDashboardProps> = ({
  drones,
  onAddDrone,
  onJumpTo,
  onRemoveDrone,
  onUpdateDrone,
  activeRouteDroneId,
  setActiveRouteDroneId,
  onClearRoute,
  onUpdateRoutePoint,
  onRemoveRoutePoint,
  isPickingInitialLocation,
  setIsPickingInitialLocation,
  tempInitialLocation,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'drone' | 'plane' | 'helicopter'>('drone');
  const [newSpeed, setNewSpeed] = useState(20);
  const [editingRouteDroneId, setEditingRouteDroneId] = useState<string | null>(null);
  const droneRefs = useRef<{ [key: string]: HTMLLIElement | null }>({});

  useEffect(() => {
    const targetId = editingRouteDroneId || activeRouteDroneId;
    if (targetId && droneRefs.current[targetId]) {
      droneRefs.current[targetId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [editingRouteDroneId, activeRouteDroneId]);

  const handleAdd = () => {
    if (!newName || !tempInitialLocation) return;
    onAddDrone({
      name: newName,
      type: newType,
      point: tempInitialLocation,
      route: [],
      speed: newSpeed,
    });
    setNewName('');
    setNewSpeed(20);
    setIsPickingInitialLocation(false);
  };

  return (
    <div className={`drone-dashboard ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="dashboard-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>{isExpanded ? 'מרכז שליטה' : '🛰️'}</h3>
        {isExpanded && (
          <div className="header-actions">
            <span className="drone-count-badge">{drones.length}</span>
            <button className="toggle-btn">━</button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="dashboard-content">
          {activeRouteDroneId ? (
            <div className="route-mode-banner">
              <span>הגדרת מסלול: {drones.find(d => d.id === activeRouteDroneId)?.name}</span>
              <div className="route-actions">
                <button onClick={() => onClearRoute(activeRouteDroneId)}>נקה הכל</button>
                <button className="done-btn" onClick={() => setActiveRouteDroneId(null)}>אישור וסיום</button>
              </div>
              <p className="route-hint">לחץ על המפה להוספת נקודות טיסה</p>
            </div>
          ) : (
            <div className="add-drone-section">
              <div className="section-title">כלי טיס חדש</div>
              <div className="add-drone-inputs">
                <input
                  type="text"
                  placeholder="שם כלי טיס..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <select value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                  <option value="drone">🚁 רחפן</option>
                  <option value="plane">✈️ מטוס</option>
                  <option value="helicopter">🚁 מסוק</option>
                </select>
              </div>
              <div className="add-drone-speed">
                <label>מהירות (קמ"ש):</label>
                <input
                  type="number"
                  value={newSpeed}
                  onChange={(e) => setNewSpeed(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="add-drone-location">
                <button 
                  className={`pick-location-btn ${isPickingInitialLocation ? 'active' : ''}`}
                  onClick={() => setIsPickingInitialLocation(!isPickingInitialLocation)}
                >
                  {tempInitialLocation ? '📍 מיקום נבחר' : '🎯 בחר מיקום'}
                </button>
                <button 
                  disabled={!newName || !tempInitialLocation} 
                  onClick={handleAdd}
                  className="submit-btn"
                >
                  הוסף
                </button>
              </div>
            </div>
          )}

          <ul className="drone-list">
            {drones.map((drone) => (
              <li 
                key={drone.id} 
                ref={el => { droneRefs.current[drone.id] = el; }}
                className={`drone-item ${activeRouteDroneId === drone.id ? 'active-route' : ''} ${editingRouteDroneId === drone.id ? 'expanded' : ''}`}
              >
                <div className="drone-item-main" onClick={() => setEditingRouteDroneId(editingRouteDroneId === drone.id ? null : drone.id)}>
                  <div className="drone-info">
                    <span className="drone-icon">
                      {drone.type === 'drone' ? '🚁' : drone.type === 'plane' ? '✈️' : '🚁'}
                    </span>
                    <div className="drone-text">
                      <span className="drone-name">{drone.name}</span>
                      <div className="drone-meta">
                        <span className="route-count">📍 {drone.route.length} נקודות</span>
                        <span className="speed-info">⚡ {drone.speed} קמ"ש</span>
                      </div>
                    </div>
                  </div>
                  <div className="drone-main-actions">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateDrone(drone.id, { isPaused: !drone.isPaused }); }} 
                      title={drone.isPaused ? "המשך תנועה" : "עצור תנועה"}
                      className={drone.isPaused ? "paused-btn" : "playing-btn"}
                    >
                      {drone.isPaused ? "▶️" : "⏸️"}
                    </button>
                    <span className={`accordion-arrow ${editingRouteDroneId === drone.id ? 'up' : 'down'}`}>▼</span>
                  </div>
                </div>
                {editingRouteDroneId === drone.id && (
                  <div className="route-edit-panel">
                    <div className="drone-quick-actions">
                      <button onClick={(e) => { e.stopPropagation(); onJumpTo(drone); }} title="קפוץ אל">🎯 התמקד</button>
                      <button onClick={(e) => { e.stopPropagation(); setActiveRouteDroneId(drone.id); }} title="הגדר מסלול">🛣️ צייר מסלול</button>
                      <button onClick={(e) => { e.stopPropagation(); onRemoveDrone(drone.id); }} title="מחק" className="delete-drone-btn">🗑️ מחק</button>
                    </div>
                    <div className="speed-setting">
                      <label>מהירות טיסה (קמ"ש):</label>
                      <input
                        type="number"
                        value={drone.speed}
                        onChange={(e) => onUpdateDrone(drone.id, { speed: Number(e.target.value) })}
                      />
                    </div>

                    <DroneCameraView drone={drone} />

                    <div className="sensor-settings">
                      <div className="point-title">הגדרות מצלמה (מפתח)</div>
                      <div className="sensor-controls">
                        <div className="control-group">
                          <label>דגם תלת-ממד:</label>
                          <select 
                            value={drone.modelUri} 
                            onChange={(e) => onUpdateDrone(drone.id, { modelUri: e.target.value })}
                            className="model-select"
                          >
                            <option value="/models/drone_yellow.glb">רחפן צהוב</option>
                            <option value="/models/drone.glb">רחפן סטנדרטי</option>
                            <option value="/models/base_basic_pbr.glb">מטוס / בסיס</option>
                          </select>
                        </div>
                        <div className="control-group">
                          <label>אזימוט: {drone.sensorInfo.azimuth}°</label>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={drone.sensorInfo.azimuth} 
                            onChange={(e) => onUpdateDrone(drone.id, { sensorInfo: { ...drone.sensorInfo, azimuth: Number(e.target.value) } })}
                          />
                        </div>
                        <div className="control-group">
                          <label>הטיה (Pitch): {drone.sensorInfo.elevation}°</label>
                          <input 
                            type="range" 
                            min="-90" 
                            max="0" 
                            value={drone.sensorInfo.elevation} 
                            onChange={(e) => onUpdateDrone(drone.id, { sensorInfo: { ...drone.sensorInfo, elevation: Number(e.target.value) } })}
                          />
                        </div>
                        <div className="control-row">
                          <div className="input-group">
                            <label>HFOV</label>
                            <input 
                              type="number" 
                              value={drone.sensorInfo.hfov} 
                              onChange={(e) => onUpdateDrone(drone.id, { sensorInfo: { ...drone.sensorInfo, hfov: Number(e.target.value) } })}
                            />
                          </div>
                          <div className="input-group">
                            <label>VFOV</label>
                            <input 
                              type="number" 
                              value={drone.sensorInfo.vfov} 
                              onChange={(e) => onUpdateDrone(drone.id, { sensorInfo: { ...drone.sensorInfo, vfov: Number(e.target.value) } })}
                            />
                          </div>
                          <div className="input-group">
                            <label>טווח</label>
                            <input 
                              type="number" 
                              value={drone.sensorInfo.range} 
                              onChange={(e) => onUpdateDrone(drone.id, { sensorInfo: { ...drone.sensorInfo, range: Number(e.target.value) } })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="current-pos-edit">
                      <div className="point-title">מיקום נוכחי</div>
                      <div className="point-inputs">
                        <div className="input-group">
                          <label>Lat</label>
                          <input 
                            type="number" 
                            value={drone.point.lat.toFixed(6)} 
                            onChange={(e) => onUpdateDrone(drone.id, { point: { ...drone.point, lat: Number(e.target.value) } })}
                            step="0.000001"
                          />
                        </div>
                        <div className="input-group">
                          <label>Lon</label>
                          <input 
                            type="number" 
                            value={drone.point.lon.toFixed(6)} 
                            onChange={(e) => onUpdateDrone(drone.id, { point: { ...drone.point, lon: Number(e.target.value) } })}
                            step="0.000001"
                          />
                        </div>
                        <div className="input-group">
                          <label>Alt</label>
                          <input 
                            type="number" 
                            value={Math.round(drone.point.hae)} 
                            onChange={(e) => onUpdateDrone(drone.id, { point: { ...drone.point, hae: Number(e.target.value) } })}
                          />
                        </div>
                      </div>
                    </div>
                    {drone.route.length > 0 && (
                      <div className="route-points-list">
                        <div className="point-title">נקודות מסלול</div>
                        {drone.route.map((p, idx) => (
                          <div key={idx} className="route-point-item">
                            <span className="point-index">{idx + 1}</span>
                            <div className="point-inputs">
                              <input 
                                type="number" 
                                value={p.lat.toFixed(6)} 
                                onChange={(e) => onUpdateRoutePoint(drone.id, idx, { lat: Number(e.target.value) })}
                                step="0.000001"
                                title="Latitude"
                              />
                              <input 
                                type="number" 
                                value={p.lon.toFixed(6)} 
                                onChange={(e) => onUpdateRoutePoint(drone.id, idx, { lon: Number(e.target.value) })}
                                step="0.000001"
                                title="Longitude"
                              />
                              <input 
                                type="number" 
                                value={Math.round(p.hae)} 
                                onChange={(e) => onUpdateRoutePoint(drone.id, idx, { hae: Number(e.target.value) })}
                                title="Altitude"
                              />
                            </div>
                            <button className="remove-point-btn" onClick={() => onRemoveRoutePoint(drone.id, idx)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DroneDashboard;

