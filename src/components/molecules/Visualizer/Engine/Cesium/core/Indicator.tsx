import { BoundingSphere, Cartesian2, Cartesian3, SceneTransforms } from "cesium";
import React, { useEffect, useState } from "react";
import { useCesium } from "resium";

import { styled } from "@reearth/theme";

export type Props = {
  className?: string;
};

export default function Indicator({ className }: Props): JSX.Element | null {
  const { viewer } = useCesium();
  const [pos, setPos] = useState<Cartesian2>();

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
        setPos(undefined);
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
      } else {
        setPos(undefined);
      }
    };

    viewer.clock.onTick.addEventListener(handleTick);
    return () => {
      if (viewer.isDestroyed()) return;
      viewer.clock.onTick.removeEventListener(handleTick);
    };
  }, [viewer]);

  return pos ? <I className={className} style={{ left: pos.x + "px", top: pos.y + "px" }} /> : null;
}

const I = styled.div`
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: red;
  transform: translate(-50%, -50%);
`;
