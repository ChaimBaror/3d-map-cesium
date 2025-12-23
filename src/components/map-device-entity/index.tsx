import React, { type FC, useEffect, useMemo, useState } from 'react';

import { Entity, ModelGraphics, useCesium } from 'resium';
import { Cartographic } from 'cesium';
import { SensorShadowArea } from './SensorShadowArea';
import { Color } from 'cesium';
import { Cartesian3 } from 'cesium';
import { HeadingPitchRange } from 'cesium';
import { FrustumVisualizer } from './FrustumVisualizer';
import { SensorInfo } from '../../hooks/useDrones';

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

export const MapDeviceEntity = ({ point, name, isMoving, sensorInfo }: { point: Point, name?: string, isMoving?: boolean, sensorInfo: SensorInfo }) => {

  const { viewer } = useCesium();

  return (
    <>
      <Entity
        name={name || "My Marker"}
        position={Cartesian3.fromDegrees(point.lon, point.lat, point.hae)}
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
          currentViewSensorInfo={sensorInfo}
          isDeviceSelected={true}
        />
        <FrustumVisualizer
          point={point}
          azimuth={sensorInfo.azimuth}
          elevation={sensorInfo.elevation}
          hfov={sensorInfo.hfov}
          vfov={sensorInfo.vfov}
          range={sensorInfo.range}
          isDeviceSelected={true} />
      </Entity>

    </>
  );
}
