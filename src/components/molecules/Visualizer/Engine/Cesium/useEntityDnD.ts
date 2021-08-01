import CesiumDnD, { Options } from "cesium-dnd";
import { CesiumComponentRef } from "resium";
import { Viewer } from "cesium";
import { RefObject } from "react";

export default (cesiumRef: RefObject<CesiumComponentRef<Viewer>> | null, options: Options) => {
  if (cesiumRef?.current?.cesiumElement) {
    const entityDnD = new CesiumDnD(cesiumRef.current.cesiumElement, {
      onDrag: options.onDrag,
      onDrop: options.onDrop,
    });
    return { entityDnD };
  }
  return {};
};
