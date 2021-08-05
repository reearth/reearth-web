import {
  Cartesian3,
  Color,
  ColorBlendMode,
  HeadingPitchRoll,
  Math as CesiumMath,
  ShadowMode,
  Transforms,
} from "cesium";
import React, { useMemo } from "react";
import { ModelGraphics, Entity } from "resium";

import type { Props as PrimitiveProps } from "../../../Primitive";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    model?: string;
    location?: { lat: number; lng: number };
    height?: number;
    heading?: number;
    pitch?: number;
    roll?: number;
    scale?: number;
    animation?: boolean; // default: true
  };
  appearance?: {
    shadow?: "disabled" | "enabled" | "cast_only" | "receive_only"; // default: disabled
    colorBlend?: "disabled" | "highlight" | "replace" | "mix"; // default: disabled
    color?: string;
    colorBlendAmount?: number;
    silhouette?: boolean;
    silhouetteColor?: string;
    silhouetteSize?: number; // default: 1
  };
};

export default function Model({ primitive }: PrimitiveProps<Property>) {
  const { id, isVisible, property } = primitive ?? {};
  const {
    location,
    height,
    heading,
    pitch,
    roll,
    model,
    scale,
    animation = true,
  } = (property as Property | undefined)?.default ?? {};
  const {
    shadow = "disabled",
    colorBlend = "disabled",
    color,
    colorBlendAmount,
    silhouette,
    silhouetteColor,
    silhouetteSize = 1,
  } = (property as Property | undefined)?.appearance ?? {};

  const position = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);
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
  const modelShadow = (
    {
      enabled: ShadowMode.ENABLED,
      cast_only: ShadowMode.CAST_ONLY,
      receive_only: ShadowMode.RECEIVE_ONLY,
    } as { [key in string]?: ShadowMode }
  )[shadow];
  const modelColorBlendMode = (
    {
      highlight: ColorBlendMode.HIGHLIGHT,
      replace: ColorBlendMode.REPLACE,
      mix: ColorBlendMode.MIX,
    } as { [key in string]?: ColorBlendMode }
  )[colorBlend];
  const modelColor = useMemo(() => {
    return modelColorBlendMode && color ? Color.fromCssColorString(color) : undefined;
  }, [modelColorBlendMode, color]);
  const modelSilhouetteColor = useMemo(() => {
    return silhouetteColor ? Color.fromCssColorString(silhouetteColor) : undefined;
  }, [silhouetteColor]);

  return !isVisible || !model || !position ? null : (
    <Entity id={id} position={position} orientation={orientation as any}>
      <ModelGraphics
        uri={model}
        scale={scale}
        shadows={modelShadow}
        colorBlendMode={modelColorBlendMode}
        colorBlendAmount={colorBlendAmount}
        color={modelColor}
        runAnimations={animation}
        silhouetteColor={modelSilhouetteColor}
        silhouetteSize={silhouette ? silhouetteSize : undefined}
      />
    </Entity>
  );
}
