import React, { useState, useCallback, useRef, useEffect } from "react";
import { Viewer, CameraFlyTo, Cesium3DTileset, Entity, PolylineGraphics } from "resium";
import { Cartesian3, CesiumTerrainProvider, Ion, IonResource, Viewer as CesiumViewer, Color, Cartographic, ColorMaterialProperty } from "cesium";
import { MapDeviceEntity } from "./map-device-entity";
import CompassComponent from "./Compass/CompassComponent";
import CoordinateSearch from "./CoordinateSearch";
import MapControls from "./MapControls";
import { useDrones, Drone, Point } from "../hooks/useDrones";
import DroneDashboard from "./DroneDashboard/DroneDashboard";

const cesiumIonToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMzBhZTlmMy00ZDQ4LTRmMGQtYjEzNy1mNWZkNTBmZTc5YmQiLCJpZCI6MjkwNjk3LCJpYXQiOjE3NDM2ODgxNDJ9.6CszVte8ux1ipX1fLH0EAVBS5L2m_lzpi0-H80Nf_LA"
if (cesiumIonToken) {
    Ion.defaultAccessToken = cesiumIonToken;
}

const CesiumMap = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeRouteDroneId, setActiveRouteDroneId] = useState<string | null>(null);
    const [isPickingInitialLocation, setIsPickingInitialLocation] = useState(false);
    const [tempInitialLocation, setTempInitialLocation] = useState<Point | null>(null);
    const [terrainTileset, setTerrainTileset] = useState<any>(null);

    const { drones, addDrone, removeDrone, updateDrone, addPointToRoute, clearRoute } = useDrones();
    const viewerRef = useRef<CesiumViewer | null>(null);

    const cameraPositions = Cartesian3.fromDegrees(-73.9654, 40.7831, 2500)

    useEffect(() => {
        // Load terrain
        CesiumTerrainProvider.fromIonAssetId(1)
            .then(tp => {
                if (viewerRef.current) {
                    viewerRef.current.terrainProvider = tp;
                }
            })
            .catch(err => console.error("Terrain load error:", err));

        // Load 3D Tileset
        IonResource.fromAssetId(2275207)
            .then(resource => {
                setTerrainTileset(resource);
            })
            .catch(err => console.error("Tileset load error:", err));
    }, []);

    const handleJumpTo = useCallback((drone: Drone) => {
        if (viewerRef.current) {
            viewerRef.current.camera.flyTo({
                destination: Cartesian3.fromDegrees(drone.point.lon, drone.point.lat, drone.point.hae + 500),
                duration: 2
            });
        }
    }, []);

    const handleMapClick = useCallback((movement: any) => {
        if (!viewerRef.current) return;

        const scene = viewerRef.current.scene;
        let cartesian;

        // Try to pick position on terrain/tiles
        if (scene.pickPositionSupported) {
            cartesian = scene.pickPosition(movement.position);
        }

        // Fallback to ellipsoid if pickPosition fails (e.g. clicking sky or empty space)
        if (!cartesian) {
            cartesian = viewerRef.current.camera.pickEllipsoid(movement.position);
        }

        if (cartesian) {
            const cartographic = Cartographic.fromCartesian(cartesian);
            const lat = (cartographic.latitude * 180) / Math.PI;
            const lon = (cartographic.longitude * 180) / Math.PI;
            
            // Get terrain height at this point if possible
            const terrainHeight = scene.globe.getHeight(cartographic) || cartographic.height;
            const finalHeight = terrainHeight + 100; // Default 100m above ground

            if (isPickingInitialLocation) {
                setTempInitialLocation({ lat, lon, hae: finalHeight });
                setIsPickingInitialLocation(false);
            } else if (activeRouteDroneId) {
                addPointToRoute(activeRouteDroneId, { lat, lon, hae: finalHeight });
            }
        }
    }, [activeRouteDroneId, addPointToRoute, isPickingInitialLocation]);

    const handleAddDrone = useCallback((drone: Omit<Drone, 'id'>) => {
        addDrone(drone);
        setTempInitialLocation(null);
    }, [addDrone]);

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#000' }}>
            <Viewer
                ref={(e) => { 
                    viewerRef.current = e?.cesiumElement || null; 
                    if (viewerRef.current) {
                        viewerRef.current.scene.globe.depthTestAgainstTerrain = true;
                    }
                }}
                style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}
                geocoder={false}
                animation={false}
                sceneModePicker={false}
                timeline={false}
                infoBox={false}
                baseLayerPicker={false}
                navigationHelpButton={false}
                homeButton={false}
                fullscreenButton={false}
                selectionIndicator={false}
                onClick={handleMapClick}
            >
                <CameraFlyTo
                    destination={cameraPositions}
                    duration={2}
                    once={true}
                    orientation={{
                        heading: 2.0,
                        pitch: -Math.PI / 10,
                        roll: 0
                    }}
                />

                {drones.map(drone => (
                    <React.Fragment key={drone.id}>
                        <MapDeviceEntity point={drone.point} name={drone.name} />
                        {drone.route.length > 1 && (
                            <Entity name={`Route for ${drone.name}`}>
                                <PolylineGraphics
                                    positions={drone.route.map(p => Cartesian3.fromDegrees(p.lon, p.lat, p.hae))}
                                    width={3}
                                    material={Color.YELLOW.withAlpha(0.6)}
                                />
                            </Entity>
                        )}
                    </React.Fragment>
                ))}

                {tempInitialLocation && (
                    <Entity
                        name="נקודת התחלה חדשה"
                        position={Cartesian3.fromDegrees(tempInitialLocation.lon, tempInitialLocation.lat, tempInitialLocation.hae)}
                        point={{ pixelSize: 10, color: Color.ORANGE }}
                    />
                )}

                {terrainTileset && (
                    <Cesium3DTileset
                        url={terrainTileset}
                        onError={(error) =>
                            console.error('Failed to load terrain tileset:', error)
                        }
                    />
                )}

                <CompassComponent />
                <CoordinateSearch isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
                <MapControls />
            </Viewer>

            <DroneDashboard
                drones={drones}
                onAddDrone={handleAddDrone}
                onJumpTo={handleJumpTo}
                onRemoveDrone={removeDrone}
                onUpdateDrone={updateDrone}
                activeRouteDroneId={activeRouteDroneId}
                setActiveRouteDroneId={setActiveRouteDroneId}
                onClearRoute={clearRoute}
                isPickingInitialLocation={isPickingInitialLocation}
                setIsPickingInitialLocation={setIsPickingInitialLocation}
                tempInitialLocation={tempInitialLocation}
            />
        </div>
    );
};

export default CesiumMap;
