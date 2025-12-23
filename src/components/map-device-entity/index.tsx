import { type FC, useEffect, useMemo, useState } from 'react';

import { Entity, ModelGraphics, useCesium } from 'resium';
import { Cartographic } from 'cesium';
import { SensorShadowArea } from './SensorShadowArea';
import { Color } from 'cesium';
import { Cartesian3 } from 'cesium';
import { HeadingPitchRange } from 'cesium';
import { FrustumVisualizer } from './FrustumVisualizer';

interface Point {
  lat: number;
  lon: number;
  hae: number;
}

const MODEL_CONFIG = {
  uri: '/models/drone_yellow.glb',
  minimumPixelSize: 30,
  maximumScale: 20,
  colorBlendAmount: 0.5,
  silhouetteAlpha: 0.3,
} as const;

export const MapDeviceEntity = ({ point, name, isMoving }: { point: Point, name?: string, isMoving?: boolean }) => {

  const currentViewSensorInfo = {
    hfov: 60,
    vfov: 20,
    range: point.hae + 700,
    azimuth: 0,
    elevation: -25,
  }

  const { viewer } = useCesium();

  return (
    <>
      <Entity
        name={name || "My Marker"}
        position={Cartesian3.fromDegrees(point.lon, point.lat, point.hae)}
      // point={{ pixelSize: 15, color: Color.RED }}
      >
        <ModelGraphics
          uri={MODEL_CONFIG.uri}
          scale={1.0}
          minimumPixelSize={64}
          maximumScale={20000}
          colorBlendAmount={0.5}
          silhouetteColor={Color.YELLOWGREEN}
          silhouetteSize={isMoving ? 2.0 : 0.0}
        />

        <SensorShadowArea
          point={point}
          currentViewSensorInfo={currentViewSensorInfo}
          isDeviceSelected={true}
        />
        <FrustumVisualizer
          point={point}
          azimuth={currentViewSensorInfo?.azimuth ?? 0}
          elevation={currentViewSensorInfo?.elevation ?? 0}
          hfov={currentViewSensorInfo?.hfov ?? 0}
          vfov={currentViewSensorInfo?.vfov ?? 0}
          range={currentViewSensorInfo.range}
          isDeviceSelected={true} />
      </Entity>

    </>
  );
}