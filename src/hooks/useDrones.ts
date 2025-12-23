import { useState, useCallback, useEffect } from 'react';

export interface Point {
  lat: number;
  lon: number;
  hae: number;
}

export interface SensorInfo {
  hfov: number;
  vfov: number;
  range: number;
  azimuth: number;
  elevation: number;
}

export interface Drone {
  id: string;
  name: string;
  type: 'drone' | 'plane' | 'helicopter';
  point: Point;
  route: Point[];
  speed: number; // Speed in km/h
  isPaused: boolean;
  sensorInfo: SensorInfo;
  modelUri: string;
}

export const useDrones = () => {
  const [drones, setDrones] = useState<Drone[]>([
    {
      id: '1',
      name: 'Drone Alpha',
      type: 'drone',
      point: { lat: 40.7831, lon: -73.9844, hae: 150 },
      route: [],
      speed: 20,
      isPaused: false,
      sensorInfo: {
        hfov: 60,
        vfov: 40,
        range: 1000,
        azimuth: 0,
        elevation: -25,
      },
      modelUri: '/models/drone_yellow.glb',
    },
  ]);

  // Simulation effect to move drones along their route
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prevDrones) =>
        prevDrones.map((drone) => {
          if (drone.isPaused || drone.route.length === 0) return drone;

          // Target is the first point in the route
          const target = drone.route[0];
          const current = drone.point;
          
          // Speed km/h -> m/s / 20 (since interval is 50ms)
          const distancePerInterval = (drone.speed * 1000) / 3600 * 0.05;

          const dLat = target.lat - current.lat;
          const dLon = target.lon - current.lon;
          const dHae = target.hae - current.hae;
          
          const latRad = (current.lat * Math.PI) / 180;
          const metersLat = dLat * 111320; // More precise
          const metersLon = dLon * 111320 * Math.cos(latRad);
          
          const distanceMeters = Math.sqrt(metersLat * metersLat + metersLon * metersLon + dHae * dHae);

          if (distanceMeters < distancePerInterval || distanceMeters < 0.1) {
            // Reached target
            const newRoute = drone.route.slice(1);
            return { 
              ...drone, 
              point: { ...target }, 
              route: newRoute 
            };
          }

          // Move towards target
          const ratio = distancePerInterval / (distanceMeters || 1);
          const nextPoint = {
            lat: current.lat + dLat * ratio,
            lon: current.lon + dLon * ratio,
            hae: current.hae + dHae * ratio,
          };

          return {
            ...drone,
            point: nextPoint,
          };
        })
      );
    }, 50); // Increased frequency for smoother movement

    return () => clearInterval(interval);
  }, []);

  const addDrone = useCallback((drone: Omit<Drone, 'id' | 'isPaused' | 'sensorInfo' | 'modelUri'>) => {
    let defaultModel = '/models/drone_yellow.glb';
    if (drone.type === 'plane') defaultModel = '/models/base_basic_pbr.glb';
    else if (drone.type === 'helicopter') defaultModel = '/models/drone.glb';

    const newDrone: Drone = {
      ...drone,
      id: Math.random().toString(36).substr(2, 9),
      isPaused: false,
      sensorInfo: {
        hfov: 60,
        vfov: 40,
        range: 1000,
        azimuth: 0,
        elevation: -25,
      },
      modelUri: defaultModel,
    };
    setDrones((prev) => [...prev, newDrone]);
  }, []);

  const updateDrone = useCallback((id: string, updates: Partial<Drone>) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const removeDrone = useCallback((id: string) => {
    setDrones((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const clearRoute = useCallback((id: string) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, route: [] } : d))
    );
  }, []);

  const addPointToRoute = useCallback((id: string, point: Point) => {
    setDrones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, route: [...d.route, point] } : d))
    );
  }, []);

  const updateRoutePoint = useCallback((droneId: string, pointIndex: number, updates: Partial<Point>) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id !== droneId) return d;
        const newRoute = [...d.route];
        newRoute[pointIndex] = { ...newRoute[pointIndex], ...updates };
        return { ...d, route: newRoute };
      })
    );
  }, []);

  const removeRoutePoint = useCallback((droneId: string, pointIndex: number) => {
    setDrones((prev) =>
      prev.map((d) => {
        if (d.id !== droneId) return d;
        const newRoute = d.route.filter((_, i) => i !== pointIndex);
        return { ...d, route: newRoute };
      })
    );
  }, []);

  return {
    drones,
    addDrone,
    updateDrone,
    removeDrone,
    clearRoute,
    addPointToRoute,
    updateRoutePoint,
    removeRoutePoint,
  };
};

