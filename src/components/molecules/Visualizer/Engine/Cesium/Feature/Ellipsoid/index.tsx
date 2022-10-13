/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3, Entity as CesiumEntity } from "cesium";
import React, { useEffect, useMemo, useRef } from "react";
import { Entity, EllipsoidGraphics, CesiumComponentRef } from "resium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../../Layers/Primitive";
import { attachTag, draggableTag, heightReference, shadowMode } from "../../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  position?: LatLng;
  location?: LatLng;
  height?: number;
  heightReference?: "none" | "clamp" | "relative";
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  radius?: number;
  fillColor?: string;
};

const Ellipsoid: React.FC<PrimitiveProps<Property>> = ({ id, isVisible, property, geometry }) => {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property.position
        ? [property.position.lng, property.position.lat, property.height ?? 0]
        : property.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property.height, property.location],
  );

  const { heightReference: hr, shadows, radius = 1000, fillColor } = property ?? {};

  const pos = useMemo(
    () =>
      coordinates
        ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
        : undefined,
    [coordinates],
  );

  const raddi = useMemo(() => {
    return new Cartesian3(radius, radius, radius);
  }, [radius]);

  const material = useMemo(() => toColor(fillColor), [fillColor]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    attachTag(
      e.current?.cesiumElement,
      draggableTag,
      // TODO: support geometry
      property.location ? "default.location" : "default.position",
    );
  }, [isVisible, pos, property.location]);

  return !isVisible || !pos ? null : (
    <Entity id={id} position={pos} ref={e}>
      <EllipsoidGraphics
        radii={raddi}
        material={material}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Ellipsoid;
