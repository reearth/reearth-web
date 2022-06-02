import {
  Entity as CesiumEntity,
  Cartesian3,
  Color,
  HorizontalOrigin,
  VerticalOrigin,
  Cartesian2,
} from "cesium";
import React, { useMemo, useRef, useEffect } from "react";
import {
  Entity,
  BillboardGraphics,
  PointGraphics,
  LabelGraphics,
  PolylineGraphics,
  CesiumComponentRef,
} from "resium";

import { Typography, toCSSFont, toColor } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../Primitive";
import {
  useIcon,
  ho,
  vo,
  heightReference,
  unselectableTag,
  draggableTag,
  attachTag,
} from "../common";

import marker from "./marker.svg";

export type Props = PrimitiveProps<Property>;

type Property = {
  default?: {
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
};

const Marker: React.FC<PrimitiveProps<Property>> = ({ layer }) => {
  const { id, isVisible, property } = layer ?? {};
  const {
    location,
    height = 0,
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
  } = property?.default ?? {};

  const pos = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);

  const extrudePoints = useMemo(() => {
    return extrude && location
      ? [
          Cartesian3.fromDegrees(location.lng, location.lat, height),
          Cartesian3.fromDegrees(location.lng, location.lat, 0),
        ]
      : undefined;
  }, [extrude, location, height]);

  const [icon, img] = useIcon({
    image,
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
    const padding = imageSize ? 15 : 40;
    const x =
      (img?.width && imageSize && (!style || style === "image")
        ? img.width * imageSize
        : pointSize) /
        2 +
      padding;
    const y =
      (img?.height && imageSize && (!style || style === "image")
        ? img.height * imageSize
        : pointSize) /
        2 +
      padding;
    return new Cartesian2(
      labelPos.includes("left") || labelPos.includes("right")
        ? x * (labelPos.includes("left") ? -1 : 1)
        : 0,
      labelPos.includes("top") || labelPos.includes("bottom")
        ? y * (labelPos.includes("top") ? -1 : 1)
        : 0,
    );
  }, [img?.width, img?.height, style, imageSize, pointSize, labelPos]);

  const e = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    // draggable
    attachTag(e.current?.cesiumElement, draggableTag, "default.location");
  }, [pos, isVisible]);

  const ep = useRef<CesiumComponentRef<CesiumEntity>>(null);
  useEffect(() => {
    // disable selecting polyline
    attachTag(ep.current?.cesiumElement, unselectableTag, true);
  }, [pos, isVisible, extrudePoints]);

  return !pos || !isVisible ? null : (
    <>
      {extrudePoints && (
        <Entity ref={ep}>
          <PolylineGraphics
            positions={extrudePoints}
            material={Color.WHITE.withAlpha(0.4)}
            width={0.5}
          />
        </Entity>
      )}
      <Entity id={id} position={pos} ref={e}>
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
      </Entity>
    </>
  );
};

export default Marker;
