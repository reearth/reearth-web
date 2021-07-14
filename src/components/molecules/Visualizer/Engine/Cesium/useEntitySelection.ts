import { RefObject, useCallback } from "react";
import { Entity, Viewer } from "cesium";
import { CesiumComponentRef, CesiumMovementEvent } from "resium";

export default function useEntitySelection(
  cesium: RefObject<CesiumComponentRef<Viewer>>,
  selectedId?: string,
  onEntitySelect?: (id?: string) => void,
) {
  const select = useCallback(
    (selected?: string) => {
      const viewer = cesium.current?.cesiumElement;
      if (!viewer || viewer.isDestroyed()) return;
      viewer.selectedEntity = selected ? viewer.entities.getById(selected) : undefined;
    },
    [cesium],
  );

  const selectViewerEntity = useCallback(
    (_: CesiumMovementEvent, target: any) => {
      const viewer = cesium.current?.cesiumElement;

      if (!(target instanceof Entity)) {
        if (viewer?.selectedEntity) {
          select();
          onEntitySelect?.(undefined);
          return;
        }
      }

      if (selectable(target)) {
        if (viewer?.selectedEntity !== target) {
          select(target.id);
          onEntitySelect?.(target.id);
        }
      }
    },
    [cesium, onEntitySelect, select],
  );

  return selectViewerEntity;
}

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};
