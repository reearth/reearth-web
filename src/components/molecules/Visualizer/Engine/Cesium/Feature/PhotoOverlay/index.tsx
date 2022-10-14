import { Cartesian3 } from "cesium";
import React, { useMemo } from "react";
import nl2br from "react-nl2br";
import { BillboardGraphics } from "resium";

import defaultImage from "@reearth/components/atoms/Icon/Icons/primPhotoIcon.svg";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { Camera, LatLng } from "@reearth/util/value";

import type { Props as PrimitiveProps } from "../../../../Layers/Primitive";
import { heightReference, ho, useIcon, vo } from "../../common";
import { EntityExt } from "../utils";

import useHooks, { photoDuration, photoExitDuration, TransitionStatus } from "./hooks";

export type Props = PrimitiveProps<Property>;

export type Property = {
  location?: LatLng;
  height?: number;
  heightReference?: "none" | "clamp" | "relative";
  camera?: Camera; // You may also update the field name in storytelling widget
  image?: string;
  imageSize?: number;
  imageHorizontalOrigin?: "left" | "center" | "right";
  imageVerticalOrigin?: "top" | "center" | "baseline" | "bottom";
  imageCrop?: "none" | "rounded" | "circle";
  imageShadow?: boolean;
  imageShadowColor?: string;
  imageShadowBlur?: number;
  imageShadowPositionX?: number;
  imageShadowPositionY?: number;
  photoOverlayImage?: string;
  photoOverlayDescription?: string;
};

const PhotoOverlay: React.FC<PrimitiveProps<Property>> = ({
  id,
  isVisible,
  property,
  geometry,
  isSelected,
  layer,
  feature,
}) => {
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
    image,
    imageSize,
    imageHorizontalOrigin,
    imageVerticalOrigin,
    imageCrop,
    imageShadow,
    imageShadowColor,
    imageShadowBlur,
    imageShadowPositionX,
    imageShadowPositionY,
    heightReference: hr,
    camera,
    photoOverlayImage,
    photoOverlayDescription,
  } = property ?? {};

  const [canvas] = useIcon({
    image: image || defaultImage,
    imageSize: image ? imageSize : undefined,
    crop: image ? imageCrop : undefined,
    shadow: image ? imageShadow : undefined,
    shadowColor: image ? imageShadowColor : undefined,
    shadowBlur: image ? imageShadowBlur : undefined,
    shadowOffsetX: image ? imageShadowPositionX : undefined,
    shadowOffsetY: image ? imageShadowPositionY : undefined,
  });

  const theme = useTheme();

  const pos = useMemo(
    () =>
      coordinates
        ? Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2])
        : undefined,
    [coordinates],
  );

  const { photoOverlayImageTransiton, exitPhotoOverlay } = useHooks({
    camera,
    isSelected: isSelected && !!photoOverlayImage,
  });

  return !isVisible ? null : (
    <>
      <EntityExt id={id} position={pos} layerId={layer?.id} featureId={feature?.id} draggable>
        <BillboardGraphics
          image={canvas}
          horizontalOrigin={ho(imageHorizontalOrigin)}
          verticalOrigin={vo(imageVerticalOrigin)}
          heightReference={heightReference(hr)}
        />
      </EntityExt>
      {photoOverlayImageTransiton === "unmounted" ? null : (
        <PhotoWrapper transition={photoOverlayImageTransiton} onClick={exitPhotoOverlay}>
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
    transition === "entering" || transition === "exiting"
      ? `all ${transition === "exiting" ? photoExitDuration : photoDuration}s ease`
      : null};
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
