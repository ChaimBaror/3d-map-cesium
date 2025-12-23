import React, { type FC, useEffect, useMemo, useState } from 'react';

import { Entity, ModelGraphics, useCesium } from 'resium';
import { Cartographic } from 'cesium';
import { SensorShadowArea } from './SensorShadowArea';
import { Color } from 'cesium';
import { Cartesian3 } from 'cesium';
import { HeadingPitchRange } from 'cesium';
import { FrustumVisualizer } from './FrustumVisualizer';
import { SensorInfo } from '../../hooks/useDrones';
import { ShadowMode } from 'cesium';

interface Point {
  lat: number;
  lon: number;
  hae: number;
}

export const MapDeviceEntity = ({ 
  point, 
  name, 
  isMoving, 
  sensorInfo, 
  modelUri 
}: { 
  point: Point, 
  name?: string, 
  isMoving?: boolean, 
  sensorInfo: SensorInfo,
  modelUri: string
}) => {

  const { viewer } = useCesium();

  return (
    <>
      <Entity
        name={name || "My Marker"}
        position={Cartesian3.fromDegrees(point.lon, point.lat, point.hae)}
      >
        <ModelGraphics
          uri={modelUri}
          scale={1.0}
          shadows={ShadowMode.DISABLED}
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
