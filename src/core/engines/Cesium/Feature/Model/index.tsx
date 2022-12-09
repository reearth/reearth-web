import { Cartesian3, HeadingPitchRoll, Math as CesiumMath, Transforms } from "cesium";
import { useMemo } from "react";
import { ModelGraphics } from "resium";

import { toColor } from "@reearth/util/value";

import { colorBlendMode, heightReference, shadowMode } from "../../common";
import { EntityExt, type FeatureComponentConfig, type FeatureProps } from "../utils";

export type Props = FeatureProps<Property>;

export type Property = {
  model?: string;
  location?: { lat: number; lng: number };
  height?: number;
  heightReference?: "none" | "clamp" | "relative";
  heading?: number;
  pitch?: number;
  roll?: number;
  scale?: number;
  maximumScale?: number;
  minimumPixelSize?: number;
  animation?: boolean; // default: true
  shadows?: "disabled" | "enabled" | "cast_only" | "receive_only";
  colorBlend?: "none" | "highlight" | "replace" | "mix";
  color?: string;
  colorBlendAmount?: number;
  lightColor?: string;
  silhouette?: boolean;
  silhouetteColor?: string;
  silhouetteSize?: number; // default: 1
};

export default function Model({ id, isVisible, property, geometry, layer, feature }: Props) {
  const coordinates = useMemo(
    () =>
      geometry?.type === "Point"
        ? geometry.coordinates
        : property?.location
        ? [property.location.lng, property.location.lat, property.height ?? 0]
        : undefined,
    [geometry?.coordinates, geometry?.type, property?.height, property?.location],
  );

  const {
    model,
    heightReference: hr,
    heading,
    pitch,
    roll,
    scale,
    maximumScale,
    minimumPixelSize,
    animation = true,
    shadows = "disabled",
    colorBlend = "none",
    color,
    colorBlendAmount,
    lightColor,
    silhouette,
    silhouetteColor,
    silhouetteSize = 1,
  } = property ?? {};

  const position = useMemo(() => {
    return coordinates
      ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
      : undefined;
  }, [coordinates]);
  const orientation = useMemo(
    () =>
      position
        ? Transforms.headingPitchRollQuaternion(
            position,
            new HeadingPitchRoll(
              CesiumMath.toRadians(heading ?? 0),
              CesiumMath.toRadians(pitch ?? 0),
              CesiumMath.toRadians(roll ?? 0),
            ),
          )
        : undefined,
    [heading, pitch, position, roll],
  );
  const modelColor = useMemo(() => (colorBlend ? toColor(color) : undefined), [colorBlend, color]);
  const modelLightColor = useMemo(() => toColor(lightColor), [lightColor]);
  const modelSilhouetteColor = useMemo(() => toColor(silhouetteColor), [silhouetteColor]);

  return !isVisible || !model || !position ? null : (
    <EntityExt
      id={id}
      position={position}
      orientation={orientation as any}
      layerId={layer?.id}
      featureId={feature?.id}
      draggable>
      <ModelGraphics
        uri={model}
        scale={scale}
        shadows={shadowMode(shadows)}
        colorBlendMode={colorBlendMode(colorBlend)}
        colorBlendAmount={colorBlendAmount}
        color={modelColor}
        lightColor={modelLightColor}
        runAnimations={animation}
        silhouetteColor={modelSilhouetteColor}
        silhouetteSize={silhouette ? silhouetteSize : undefined}
        heightReference={heightReference(hr)}
        maximumScale={maximumScale}
        minimumPixelSize={minimumPixelSize}
      />
    </EntityExt>
  );
}

export const config: FeatureComponentConfig = {
  noFeature: true,
};