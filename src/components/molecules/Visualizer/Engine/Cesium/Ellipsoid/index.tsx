/* eslint-disable react-hooks/exhaustive-deps */
import { Cartesian3, Entity as CesiumEntity } from "cesium";
import React, { useEffect, useMemo, useRef } from "react";
import { Entity, EllipsoidGraphics, CesiumComponentRef } from "resium";

import { LatLng, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Layers/Primitive";
import { attachTag, draggableTag, heightReference, shadowMode } from "../common";

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

const Ellipsoid: React.FC<PrimitiveProps<Property>> = ({ id, isVisible, property }) => {
  const {
    position,
    location,
    height,
    heightReference: hr,
    shadows,
    radius = 1000,
    fillColor,
  } = property ?? {};

  const actualPosition = useMemo(() => {
    const { position, location, height } = property ?? {};
    const pos = position || location;
    return pos ? Cartesian3.fromDegrees(pos.lng, pos.lat, height ?? 0) : undefined;
  }, [position?.lat, position?.lng, location?.lat, location?.lng, height]);

  const raddi = useMemo(() => {
    return new Cartesian3(radius, radius, radius);
  }, [radius]);

  const material = useMemo(() => toColor(fillColor), [fillColor]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    attachTag(
      e.current?.cesiumElement,
      draggableTag,
      location ? "default.location" : "default.position",
    );
  }, [isVisible, actualPosition, location]);

  return !isVisible || !actualPosition ? null : (
    <Entity id={id} position={actualPosition} ref={e}>
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
