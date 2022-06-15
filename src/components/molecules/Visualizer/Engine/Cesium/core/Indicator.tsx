import useTransition, { TransitionStatus } from "@rot1024/use-transition";
import { BoundingSphere, Cartesian3, SceneTransforms, Cartesian2 } from "cesium";
import React, { useEffect, useState } from "react";
import { useCesium } from "resium";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

import { SceneProperty } from "../../ref";
import { useIcon } from "../common";

export type Props = {
  className?: string;
  property?: SceneProperty;
};

export default function Indicator({ className, property }: Props): JSX.Element | null {
  const { viewer } = useCesium();
  const [isVisible, setIsVisible] = useState(true);
  const [pos, setPos] = useState<Cartesian2>();

  const transiton = useTransition(!!pos && isVisible, 500, {
    mountOnEnter: true,
    unmountOnExit: true,
  });
  const { indicator_type, indicator_image, indicator_img_scale } = property?.indicator ?? {};
  const [img, w, h] = useIcon({ image: indicator_image, imageSize: indicator_img_scale });

  useEffect(() => {
    if (!viewer) return;
    const handleTick = () => {
      if (viewer.isDestroyed()) return;
      const selected = viewer.selectedEntity;
      if (
        !selected ||
        !selected.isShowing ||
        !selected.isAvailable(viewer.clock.currentTime) ||
        !selected.position
      ) {
        setIsVisible(false);
        return;
      }

      // https://github.com/CesiumGS/cesium/blob/1.94/Source/Widgets/Viewer/Viewer.js#L1839
      let position: Cartesian3 | undefined = undefined;
      const boundingSphere = new BoundingSphere();
      const state = (viewer.dataSourceDisplay as any).getBoundingSphere(
        selected,
        true,
        boundingSphere,
      );
      // https://github.com/CesiumGS/cesium/blob/main/Source/DataSources/BoundingSphereState.js#L24
      if (state !== 2 /* BoundingSphereState.FAILED */) {
        position = boundingSphere.center;
      } else if (selected.position) {
        position = selected.position.getValue(viewer.clock.currentTime, position);
      }

      if (position) {
        const pos = SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
        setPos(pos);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    viewer.clock.onTick.addEventListener(handleTick);
    return () => {
      if (viewer.isDestroyed()) return;
      viewer.clock.onTick.removeEventListener(handleTick);
    };
  }, [viewer]);
  // console.log( indicator_type );
  return transiton !== "unmounted" && pos ? (
    indicator_type === "crosshair" ? (
      <StyledIcon
        icon="crosshair"
        className={className}
        transition={transiton}
        style={{ left: pos.x + "px", top: pos.y + "px" }}
      />
    ) : indicator_type === "default" ? (
      <I
        className={className}
        transition={transiton}
        style={{ left: pos.x + "px", top: pos.y + "px" }}
      />
    ) : (
      <Image
        src={img}
        width={w}
        height={h}
        transition={transiton}
        style={{ left: pos.x + "px", top: pos.y + "px" }}
      />
    )
  ) : null;
}

const I = styled.div<{ transition: TransitionStatus }>`
  position: absolute;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
  transition: ${({ transition }) =>
    transition === "entering" || transition === "exiting" ? "all 0.5s ease" : ""};
  opacity: ${({ transition }) => (transition === "entering" || transition === "entered" ? 1 : 0)};
`;

const StyledIcon = styled(Icon)<{ transition: TransitionStatus }>`
  position: absolute;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
  transition: ${({ transition }) =>
    transition === "entering" || transition === "exiting" ? "all 0.5s ease" : ""};
  opacity: ${({ transition }) => (transition === "entering" || transition === "entered" ? 1 : 0)};
`;

const Image = styled.img<{ transition: TransitionStatus }>`
  max-width: 100%;
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
    transition === "entering" || transition === "exiting" ? "all 0.5s ease" : ""};
  opacity: ${({ transition }) => (transition === "entering" || transition === "entered" ? 1 : 0)};
`;
