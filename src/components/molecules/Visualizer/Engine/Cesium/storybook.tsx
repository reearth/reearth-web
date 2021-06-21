import React from "react";
import { CameraFlyTo } from "resium";
import { Cartesian3 } from "cesium";
import { action } from "@storybook/addon-actions";

import CesiumEngine from ".";

export const location = { lat: 35.652832, lng: 139.839478, height: 1000 };

// For storybook
export const V: React.FC<{ location?: { lat: number; lng: number } }> = ({
  children,
  location: l = location,
}) => {
  return (
    <CesiumEngine
      ready
      property={{ tiles: [{ id: "default", tile_type: "default" }] }}
      onLayerSelect={action("Cesium: onLayerSelect")}>
      <CameraFlyTo
        destination={Cartesian3.fromDegrees((l ?? location).lng, (l ?? location).lat, 10000)}
        duration={0}
        once
      />
      {children}
    </CesiumEngine>
  );
};
