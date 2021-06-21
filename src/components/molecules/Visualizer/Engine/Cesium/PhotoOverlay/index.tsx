import React, { useEffect, useMemo, useRef } from "react";
import { Entity, BillboardGraphics } from "resium";
import { Math as CesiumMath, Cartesian3, EasingFunction } from "cesium";
import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import nl2br from "react-nl2br";

import { styled, useTheme } from "@reearth/theme";
import { Camera, LatLng } from "@reearth/util/value";
import { useDelayedCount, Durations } from "@reearth/util/use-delayed-count";
import Text from "@reearth/components/atoms/Text";
import defaultImage from "@reearth/components/atoms/Icon/Icons/primPhotoIcon.svg"; // TODO: use Icon component

import type { Props as PrimitiveProps } from "../../../Primitive";
import { useIcon, ho, vo } from "../common";

export type Props = PrimitiveProps<Property>;

export type Property = {
  default?: {
    location?: LatLng;
    height?: number;
    camera?: Camera; // You may also update the field name in storytelling widget
    image?: string;
    imageSize?: number;
    imageHorizontalOrigin?: "left" | "center" | "right";
    imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
    imageClop?: "none" | "rounded" | "circle";
    imageShadow?: boolean;
    imageShadowColor?: string;
    imageShadowBlur?: number;
    imageShadowPositionX?: number;
    imageShadowPositionY?: number;
    photoOverlayImage?: string;
    photoOverlayDescription?: string;
  };
};

const cameraDuration = 3000;
const cameraExitDuration = 3000;
const fovDuration = 500;
const fovExitDuration = 599;
const photoDuration = 1000;
const photoExitDuration = 500;
const defaultFOV = CesiumMath.toRadians(60);

const durations: Durations = [
  [cameraDuration, cameraExitDuration],
  [fovDuration, fovExitDuration],
  [photoDuration, photoExitDuration],
];

const PhotoOverlay: React.FC<PrimitiveProps<Property>> = ({
  api,
  primitive: { isVisible, property },
  isSelected,
  selected,
  onSelect,
}) => {
  const {
    image,
    imageSize,
    imageHorizontalOrigin,
    imageVerticalOrigin,
    imageClop,
    imageShadow,
    imageShadowColor,
    imageShadowBlur,
    imageShadowPositionX,
    imageShadowPositionY,
    location,
    height,
    camera,
    photoOverlayImage,
    photoOverlayDescription,
  } = property?.default ?? {};

  const [canvas] = useIcon({
    image: image || defaultImage,
    imageSize: image ? imageSize : undefined,
    crop: image ? imageClop : undefined,
    shadow: image ? imageShadow : undefined,
    shadowColor: image ? imageShadowColor : undefined,
    shadowBlur: image ? imageShadowBlur : undefined,
    shadowOffsetX: image ? imageShadowPositionX : undefined,
    shadowOffsetY: image ? imageShadowPositionY : undefined,
  });

  // mode 0 = normal, 1 = flied, 2 = zoomed, 3 = photo
  const [mode, prevMode, startTransition] = useDelayedCount(durations);
  const prevCamera = useRef<Camera>();

  useEffect(() => {
    if (prevMode > 0 && mode === 0 && prevCamera.current) {
      api?.flyTo(prevCamera.current, {
        duration: cameraExitDuration / 1000,
        easing: EasingFunction.CUBIC_IN_OUT,
      });
    }

    if (prevMode === 0 && mode === 1 && camera) {
      const storytelling = selected?.[1] === "storytelling";
      prevCamera.current = storytelling ? camera : api?.camera;
      api?.flyTo(camera, {
        duration: cameraDuration / 1000,
        easing: EasingFunction.CUBIC_IN_OUT,
      });
    }

    if (prevMode === 1 && mode === 0) {
      prevCamera.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, mode, prevMode]);

  useEffect(() => {
    if (isSelected && !photoOverlayImage) return;
    startTransition(!isSelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const currentFov = mode >= 2 ? camera?.fov : prevCamera.current?.fov ?? defaultFOV;
  useEffect(() => {
    api?.flyTo(
      { fov: currentFov },
      {
        duration: cameraDuration / 1000,
        easing: EasingFunction.CUBIC_IN_OUT,
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFov]);

  const transition = useTransition(mode >= 3, mode === 2 ? photoExitDuration : photoDuration, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  const theme = useTheme();

  const pos = useMemo(() => {
    return location ? Cartesian3.fromDegrees(location.lng, location.lat, height ?? 0) : undefined;
  }, [location, height]);

  return !isVisible ? null : (
    <>
      <Entity position={pos} onClick={onSelect}>
        <BillboardGraphics
          image={canvas}
          horizontalOrigin={ho(imageHorizontalOrigin)}
          verticalOrigin={vo(imageVerticalOrigin)}
        />
      </Entity>
      {transition === "unmounted" ? null : (
        <PhotoWrapper
          transition={transition}
          onClick={() => {
            startTransition(true);
          }}>
          <Photo src={photoOverlayImage} />
          {photoOverlayDescription && (
            <Description size="xs" color={theme.main.text}>
              {nl2br(photoOverlayDescription)}
            </Description>
          )}
        </PhotoWrapper>
      )}
    </>
  );
};

const PhotoWrapper = styled.div<{ transition: TransitionStatus }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: ${({ transition }) =>
    transition === "entering" || transition === "exiting" ? `all ${photoDuration}ms ease` : ""};
  opacity: ${({ transition }) => (transition === "entering" || transition === "entered" ? 1 : 0)};
`;

const Photo = styled.img`
  max-width: 95%;
  max-height: 80%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 1);
`;

const Description = styled(Text)`
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  text-align: left;
`;

export default PhotoOverlay;
