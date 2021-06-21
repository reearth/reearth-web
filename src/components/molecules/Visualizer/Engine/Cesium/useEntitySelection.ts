import { RefObject, useCallback, useEffect } from "react";
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
      if (!(target instanceof Entity)) {
        select();
        onEntitySelect?.(undefined);
        return;
      }

      if (selectable(target)) {
        select(target.id);
        onEntitySelect?.(target.id);
      }
    },
    [onEntitySelect, select],
  );

  useEffect(() => {
    select(selectedId);
  }, [cesium, select, selectedId]);

  return selectViewerEntity;
}

const tag = "reearth_unselectable";
const selectable = (e: Entity | undefined) => {
  if (!e) return false;
  const p = e.properties;
  return !p || !p.hasProperty(tag);
};
