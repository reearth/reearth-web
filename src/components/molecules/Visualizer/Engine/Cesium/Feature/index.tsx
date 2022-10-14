import type { ComponentType } from "react";

import type { Props as PrimitiveProps } from "../../../Layers/Primitive";
import type { AppearanceTypes, FeatureComponentProps } from "../../../next";

import Ellipsoid, { config as ellipsoidConfig } from "./Ellipsoid";
import Marker, { config as markerConfig } from "./Marker";
import Model, { config as modelConfig } from "./Model";
import PhotoOverlay, { config as photoOverlayConfig } from "./PhotoOverlay";
import Polygon, { config as polygonConfig } from "./Polygon";
import Polyline, { config as polylineConfig } from "./Polyline";
import Rect from "./Rect";
import Resource, { config as resourceConfig } from "./Resource";
import Tileset, { config as tilesetConfig } from "./Tileset";
import type { FeatureComponent, FeatureComponentConfig } from "./utils";

export default function Feature({ layer, ...props }: FeatureComponentProps): JSX.Element | null {
  return (
    <>
      {[undefined, ...layer.features].flatMap(f =>
        (Object.keys(components) as (keyof AppearanceTypes)[]).map(k => {
          const [C, config] = components[k] ?? [];
          if (
            !C ||
            (f && !f[k]) ||
            !layer[k] ||
            (config.noLayer && !f) ||
            (config.noFeature && f)
          ) {
            return null;
          }

          return (
            <C
              {...props}
              key={`${f?.id || ""}_${k}`}
              id={f ? f.id : layer.id}
              property={f ? f[k] : layer[k]}
              geometry={f?.geometry}
              feature={f}
              layer={layer}
            />
          );
        }),
      )}
    </>
  );
}

const components: Record<keyof AppearanceTypes, [FeatureComponent, FeatureComponentConfig]> = {
  marker: [Marker, markerConfig],
  polyline: [Polyline, polylineConfig],
  polygon: [Polygon, polygonConfig],
  ellipsoid: [Ellipsoid, ellipsoidConfig],
  model: [Model, modelConfig],
  "3dtiles": [Tileset, tilesetConfig],
  photooverlay: [PhotoOverlay, photoOverlayConfig],
  legacy_resource: [Resource, resourceConfig],
};

export const legacyBuiltin: Record<string, ComponentType<PrimitiveProps>> = {
  marker: Marker,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
  ellipsoid: Ellipsoid,
  photooverlay: PhotoOverlay,
  resource: Resource,
  model: Model,
  tileset: Tileset,
};
