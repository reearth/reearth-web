import { Rectangle, Color, ImageMaterialProperty } from "cesium";
import { useMemo } from "react";
import { RectangleGraphics } from "resium";

import { Rect as RectValue } from "@reearth/util/value";

import { heightReference, shadowMode } from "../../common";
import { EntityExt, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = {
  rect?: RectValue;
  height?: number;
  extrudedHeight?: number;
  style?: "color" | "image";
  fillColor?: string;
  image?: string;
  outlineColor?: string;
  outlineWidth?: number;
  heightReference?: "none" | "clamp" | "relative";
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
};

export default function Rect({ id, isVisible, property, layer, feature }: Props) {
  const {
    rect,
    image,
    style,
    fillColor,
    height,
    extrudedHeight,
    outlineColor,
    outlineWidth,
    heightReference: hr,
    shadows,
  } = property ?? {};

  const coordinates = useMemo(
    () =>
      typeof rect?.east === "number" &&
      typeof rect?.north === "number" &&
      typeof rect?.south === "number" &&
      typeof rect?.west === "number" &&
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
    [rect?.east, rect?.north, rect?.south, rect?.west],
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
    <EntityExt id={id} layerId={layer?.id} featureId={feature?.id}>
      <RectangleGraphics
        height={height}
        extrudedHeight={extrudedHeight}
        coordinates={coordinates}
        material={material}
        fill={!!material}
        outline={!!outline}
        outlineColor={outline}
        outlineWidth={outlineWidth}
        heightReference={heightReference(hr)}
        shadows={shadowMode(shadows)}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {};
