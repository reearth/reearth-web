import { Cartesian3, Color, HorizontalOrigin, VerticalOrigin, Cartesian2 } from "cesium";
import { useMemo } from "react";
import { BillboardGraphics, PointGraphics, LabelGraphics, PolylineGraphics } from "resium";

import { Typography, toCSSFont, toColor } from "@reearth/util/value";

import { useIcon, ho, vo, heightReference } from "../../common";
import { EntityExt, type FeatureComponentConfig, type FeatureProps } from "../utils";

import marker from "./marker.svg";

export type Props = FeatureProps<Property>;

export type Property = {
  location?: { lat: number; lng: number };
  height?: number;
  heightReference?: "none" | "clamp" | "relative";
  style?: "none" | "point" | "image";
  pointSize?: number;
  pointColor?: string;
  pointOutlineColor?: string;
  pointOutlineWidth?: number;
  image?: string;
  imageSize?: number;
  imageHorizontalOrigin?: "left" | "center" | "right";
  imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
  imageColor?: string;
  imageCrop?: "none" | "rounded" | "circle";
  imageShadow?: boolean;
  imageShadowColor?: string;
  imageShadowBlur?: number;
  imageShadowPositionX?: number;
  imageShadowPositionY?: number;
  label?: boolean;
  labelText?: string;
  labelPosition?:
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "lefttop"
    | "leftbottom"
    | "righttop"
    | "rightbottom";
  labelTypography?: Typography;
  labelBackground?: boolean;
  extrude?: boolean;
};

export default function Marker({ property, id, isVisible, geometry, layer, feature }: Props) {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property.height, property.location],
  );

  const {
    extrude,
    pointSize = 10,
    style,
    pointColor,
    pointOutlineColor,
    pointOutlineWidth,
    label,
    labelTypography,
    labelText,
    labelPosition: labelPos = "right",
    labelBackground,
    image = marker,
    imageSize,
    imageHorizontalOrigin: horizontalOrigin,
    imageVerticalOrigin: verticalOrigin,
    imageColor,
    imageCrop: crop,
    imageShadow: shadow,
    imageShadowColor: shadowColor,
    imageShadowBlur: shadowBlur,
    imageShadowPositionX: shadowOffsetX,
    imageShadowPositionY: shadowOffsetY,
    heightReference: hr,
  } = property ?? {};

  const pos = useMemo(() => {
    return coordinates
      ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
      : undefined;
  }, [coordinates]);

  const extrudePoints = useMemo(() => {
    return extrude && coordinates && typeof coordinates[3] === "number"
      ? [
          Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]),
          Cartesian3.fromDegrees(coordinates[0], coordinates[1], 0),
        ]
      : undefined;
  }, [coordinates, extrude]);

  const isStyleImage = !style || style === "image";
  const [icon, imgw, imgh] = useIcon({
    image: isStyleImage ? image : undefined,
    imageSize,
    crop,
    shadow,
    shadowColor,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
  });

  const cesiumImageColor = useMemo(
    () => (imageColor ? Color.fromCssColorString(imageColor) : undefined),
    [imageColor],
  );

  const pixelOffset = useMemo(() => {
    const padding = 15;
    const x = (isStyleImage ? imgw : pointSize) / 2 + padding;
    const y = (isStyleImage ? imgh : pointSize) / 2 + padding;
    return new Cartesian2(
      labelPos.includes("left") || labelPos.includes("right")
        ? x * (labelPos.includes("left") ? -1 : 1)
        : 0,
      labelPos.includes("top") || labelPos.includes("bottom")
        ? y * (labelPos.includes("top") ? -1 : 1)
        : 0,
    );
  }, [isStyleImage, imgw, pointSize, imgh, labelPos]);

  return !pos || !isVisible ? null : (
    <>
      {extrudePoints && (
        <EntityExt layerId={layer?.id} featureId={feature?.id} unselectable>
          <PolylineGraphics
            positions={extrudePoints}
            material={Color.WHITE.withAlpha(0.4)}
            width={0.5}
          />
        </EntityExt>
      )}
      <EntityExt id={id} position={pos} layerId={layer?.id} featureId={feature?.id} draggable>
        {style === "point" ? (
          <PointGraphics
            pixelSize={pointSize}
            color={toColor(pointColor)}
            outlineColor={toColor(pointOutlineColor)}
            outlineWidth={pointOutlineWidth}
            heightReference={heightReference(hr)}
          />
        ) : (
          <BillboardGraphics
            image={icon}
            color={cesiumImageColor}
            horizontalOrigin={ho(horizontalOrigin)}
            verticalOrigin={vo(verticalOrigin)}
            heightReference={heightReference(hr)}
          />
        )}
        {label && (
          <LabelGraphics
            horizontalOrigin={
              labelPos === "right" || labelPos == "righttop" || labelPos === "rightbottom"
                ? HorizontalOrigin.LEFT
                : labelPos === "left" || labelPos === "lefttop" || labelPos === "leftbottom"
                ? HorizontalOrigin.RIGHT
                : HorizontalOrigin.CENTER
            }
            verticalOrigin={
              labelPos === "bottom" || labelPos === "rightbottom" || labelPos === "leftbottom"
                ? VerticalOrigin.TOP
                : labelPos === "top" || labelPos === "righttop" || labelPos === "lefttop"
                ? VerticalOrigin.BOTTOM
                : VerticalOrigin.CENTER
            }
            pixelOffset={pixelOffset}
            fillColor={toColor(labelTypography?.color)}
            font={toCSSFont(labelTypography, { fontSize: 30 })}
            text={labelText}
            showBackground={labelBackground}
            heightReference={heightReference(hr)}
          />
        )}
      </EntityExt>
    </>
  );
}

export const config: FeatureComponentConfig = {
  noLayer: true,
};
