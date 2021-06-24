/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import { PolylineGraphics, Entity } from "resium";
import { Cartesian3 } from "cesium";

import { Coordinates, toColor } from "@reearth/util/value";
import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    coordinates?: Coordinates;
    strokeColor?: string;
    strokeWidth?: number;
  };
};

const Polyline: React.FC<PrimitiveProps<Property>> = ({
  api,
  primitive: { id, isVisible, property },
  isSelected,
}) => {
  const { coordinates, strokeColor, strokeWidth = 1 } = property?.default ?? {};

  const positions = useMemo(
    () => coordinates?.map(c => Cartesian3.fromDegrees(c.lng, c.lat, c.height)),
    [coordinates],
  );

  const material = useMemo(() => toColor(strokeColor), [strokeColor]);

  return !isVisible ? null : (
    <Entity id={id} onClick={() => api?.selectPrimitive(id)} selected={isSelected}>
      <PolylineGraphics positions={positions} width={strokeWidth} material={material} />
    </Entity>
  );
};

export default Polyline;
