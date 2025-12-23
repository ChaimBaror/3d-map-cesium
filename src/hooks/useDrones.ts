import { useState, useCallback, useEffect } from 'react';

export interface Point {
  lat: number;
  lon: number;
  hae: number;
}

export interface Drone {
  id: string;
  name: string;
  type: 'drone' | 'plane' | 'helicopter';
  point: Point;
  route: Point[];
  speed: number; // Speed in km/h
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
    },
  ]);

  // Simulation effect to move drones along their route
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prevDrones) =>
        prevDrones.map((drone) => {
          if (drone.route.length === 0) return drone;

          const target = drone.route[0];
          const current = drone.point;
          
          // Speed to distance per interval (0.1 seconds)
          // Speed km/h -> m/s / 10
          const distancePerInterval = (drone.speed * 1000) / 3600 * 0.1;

          // Simple linear interpolation in degrees (rough approximation)
          // For real flight we should use Cartesian3 math, but this is a good start
          const dLat = target.lat - current.lat;
          const dLon = target.lon - current.lon;
          const dHae = target.hae - current.hae;
          
          // Rough conversion: 1 degree latitude is ~111,000 meters
          // 1 degree longitude varies by latitude, but roughly 111,000 * cos(lat)
          const latRad = (current.lat * Math.PI) / 180;
          const metersLat = dLat * 111000;
          const metersLon = dLon * 111000 * Math.cos(latRad);
          
          const distanceMeters = Math.sqrt(metersLat * metersLat + metersLon * metersLon + dHae * dHae);

          if (distanceMeters < distancePerInterval || distanceMeters === 0) {
            // Reached target, move to next point in route
            const newRoute = drone.route.slice(1);
            return { ...drone, point: target, route: newRoute };
          }

          // Move towards target
          const ratio = distancePerInterval / distanceMeters;
          return {
            ...drone,
            point: {
              lat: current.lat + dLat * ratio,
              lon: current.lon + dLon * ratio,
              hae: current.hae + dHae * ratio,
            },
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const addDrone = useCallback((drone: Omit<Drone, 'id'>) => {
    const newDrone = {
      ...drone,
      id: Math.random().toString(36).substr(2, 9),
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

  return {
    drones,
    addDrone,
    updateDrone,
    removeDrone,
    clearRoute,
    addPointToRoute,
  };
};

