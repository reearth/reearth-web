import React, { useMemo } from "react";
import { RectangleGraphics, Entity } from "resium";
import { Rectangle, Color, ImageMaterialProperty } from "cesium";

import { Rect as RectValue } from "@reearth/util/value";
import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    rect?: RectValue;
    height?: number;
    extrudedHeight?: number;
    style?: "color" | "image";
    fillColor?: string;
    image?: string;
    outlineColor?: string;
    outlineWidth?: number;
  };
};

const Rect: React.FC<PrimitiveProps<Property>> = ({ primitive }) => {
  const { id, isVisible, property } = primitive ?? {};
  const { rect, image, style, fillColor, height, extrudedHeight, outlineColor, outlineWidth } =
    (property as Property | undefined)?.default ?? {};

  const coordinates = useMemo(
    () =>
      rect &&
      rect.west <= rect.east &&
      rect.south <= rect.north &&
      rect.east >= -180 &&
      rect.east <= 180 &&
      rect.west >= -180 &&
      rect.west <= 180 &&
      rect.south >= -90 &&
      rect.south <= 90 &&
      rect.north >= -90 &&
      rect.north <= 90
        ? Rectangle.fromDegrees(rect.west, rect.south, rect.east, rect.north)
        : undefined,
    [rect],
  );

  const material = useMemo(
    () =>
      style === "image"
        ? image
          ? new ImageMaterialProperty({
              image,
            })
          : undefined
        : fillColor
        ? Color.fromCssColorString(fillColor)
        : undefined,
    [style, image, fillColor],
  );

  const outline = useMemo(
    () => (outlineColor ? Color.fromCssColorString(outlineColor) : undefined),
    [outlineColor],
  );

  return !isVisible ? null : (
    <Entity id={id}>
      <RectangleGraphics
        height={height}
        extrudedHeight={extrudedHeight}
        coordinates={coordinates}
        material={material}
        fill={!!material}
        outline={!!outline}
        outlineColor={outline}
        outlineWidth={outlineWidth}
      />
    </Entity>
  );
};

export default Rect;
