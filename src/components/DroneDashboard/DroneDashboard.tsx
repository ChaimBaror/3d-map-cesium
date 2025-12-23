import React, { useState } from 'react';
import { Drone, Point } from '../../hooks/useDrones';
import './DroneDashboard.css';

interface DroneDashboardProps {
  drones: Drone[];
  onAddDrone: (drone: Omit<Drone, 'id'>) => void;
  onJumpTo: (drone: Drone) => void;
  onRemoveDrone: (id: string) => void;
  onUpdateDrone: (id: string, updates: Partial<Drone>) => void;
  activeRouteDroneId: string | null;
  setActiveRouteDroneId: (id: string | null) => void;
  onClearRoute: (id: string) => void;
  isPickingInitialLocation: boolean;
  setIsPickingInitialLocation: (val: boolean) => void;
  tempInitialLocation: Point | null;
}

const DroneDashboard: React.FC<DroneDashboardProps> = ({
  drones,
  onAddDrone,
  onJumpTo,
  onRemoveDrone,
  onUpdateDrone,
  activeRouteDroneId,
  setActiveRouteDroneId,
  onClearRoute,
  isPickingInitialLocation,
  setIsPickingInitialLocation,
  tempInitialLocation,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'drone' | 'plane' | 'helicopter'>('drone');
  const [newSpeed, setNewSpeed] = useState(20);

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
              <li key={drone.id} className={`drone-item ${activeRouteDroneId === drone.id ? 'active-route' : ''}`}>
                <div className="drone-info" onClick={() => onJumpTo(drone)}>
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
                <div className="drone-actions">
                  <div className="speed-control">
                    <input
                      type="number"
                      value={drone.speed}
                      onChange={(e) => onUpdateDrone(drone.id, { speed: Number(e.target.value) })}
                      title="מהירות טיסה"
                    />
                  </div>
                  <button onClick={() => setActiveRouteDroneId(drone.id)} title="הגדר מסלול">🛣️</button>
                  <button onClick={() => onJumpTo(drone)} title="קפוץ אל">🎯</button>
                  <button onClick={() => onRemoveDrone(drone.id)} title="מחק">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DroneDashboard;

