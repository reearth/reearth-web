import CesiumDnD, { Context } from "cesium-dnd";
import { CesiumComponentRef } from "resium";
import { Entity, Viewer, Cartesian3 } from "cesium";
import { RefObject } from "react";

export default (
  cesiumRef: RefObject<CesiumComponentRef<Viewer>> | null,
  // engineRef: EngineRef,
  options: {
    onDragLayer?: (e: Entity, position: Cartesian3 | undefined, context: Context) => void;
    onDropLayer?: (e: Entity, position: Cartesian3 | undefined, context: Context) => void;
  },
) => {
  console.log("pass---", options.onDragLayer);
  if (cesiumRef?.current?.cesiumElement) {
    const entityDnD = new CesiumDnD(cesiumRef.current.cesiumElement, {
      onDrag: options.onDragLayer,
      onDrop: options.onDropLayer,
    });
    return { entityDnD };
  }
  return {};
  // cesiumRef?.cesiumElement
  //   ? new CesiumDnD(cesiumRef.cesiumElement, {
  //       onDrag: options.onDragLayer,
  //       onDrop: options.onDropLayer,
  //     })
  //   : undefined;
};
