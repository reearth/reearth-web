/* eslint-disable react-hooks/exhaustive-deps */
import { PolygonHierarchy, Cartesian3 } from "cesium";
import { isEqual } from "lodash";
import React, { useMemo } from "react";
import { PolygonGraphics, Entity } from "resium";
import { useCustomCompareMemo } from "use-custom-compare";

import { Polygon as PolygonValue, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../../Layers/Primitive";
import { heightReference, shadowMode } from "../../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  polygon?: PolygonValue;
  fill?: boolean;
  fillColor?: string;
  stroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  heightReference?: "none" | "clamp" | "relative";
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

const Polygon: React.FC<PrimitiveProps<Property>> = ({ id, isVisible, property, geometry }) => {
  const coordiantes = useMemo(
    () =>
      geometry?.type === "Polygon"
        ? geometry.coordinates
        : property.polygon
        ? property.polygon.map(p => p.map(q => [q.lng, q.lat, q.height]))
        : undefined,
    [geometry?.coordinates, geometry?.type, property.polygon],
  );

  const {
    fill = true,
    stroke,
    fillColor,
    strokeColor,
    strokeWidth = 1,
    heightReference: hr,
    shadows,
  } = property ?? {};

  const hierarchy = useCustomCompareMemo(
    () =>
      coordiantes?.[0]
        ? new PolygonHierarchy(
            coordiantes[0].map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])),
            coordiantes
              .slice(1)
              .map(p => new PolygonHierarchy(p.map(c => Cartesian3.fromDegrees(c[0], c[1], c[2])))),
          )
        : undefined,
    [coordiantes ?? []],
    isEqual,
  );

  const memoStrokeColor = useMemo(
    () => (stroke ? toColor(strokeColor) : undefined),
    [stroke, strokeColor],
  );
  const memoFillColor = useMemo(() => (fill ? toColor(fillColor) : undefined), [fill, fillColor]);

  return !isVisible ? null : (
    <Entity id={id}>
      <PolygonGraphics
        hierarchy={hierarchy}
        fill={fill}
        material={memoFillColor}
        outline={!!memoStrokeColor}
        outlineColor={memoStrokeColor}
        outlineWidth={strokeWidth}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </Entity>
  );
};

export default Polygon;
