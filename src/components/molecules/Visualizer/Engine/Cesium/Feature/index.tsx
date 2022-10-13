import type { ComponentType } from "react";

import type { Props as PrimitiveProps } from "../../../Layers/Primitive";
import type { AppearanceTypes, FeatureComponentProps } from "../../../next";

import Ellipsoid from "./Ellipsoid";
import Marker from "./Marker";
import Model from "./Model";
import PhotoOverlay from "./PhotoOverlay";
import Polygon from "./Polygon";
import Polyline from "./Polyline";
import Rect from "./Rect";
import Resource from "./Resource";
import Tileset from "./Tileset";

export default function Feature({ layer, ...props }: FeatureComponentProps): JSX.Element | null {
  return (
    <>
      {[undefined, ...layer.features].flatMap(f =>
        (Object.keys(components) as (keyof AppearanceTypes)[]).map(k => {
          const C = components[k];
          if (!C || (f && !f[k]) || !layer[k]) return null;
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

const components: Record<keyof AppearanceTypes, ComponentType<PrimitiveProps>> = {
  marker: Marker,
  polyline: Polyline,
  polygon: Polygon,
  ellipsoid: Ellipsoid,
  model: Model,
  "3dtiles": Tileset,
  legacy_photooverlay: PhotoOverlay,
  legacy_resource: Resource,
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
