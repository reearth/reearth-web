import { useMemo, useEffect, useCallback, useState } from "react";

import {
  useGetLayersQuery,
  useGetEarthWidgetsQuery,
  useMoveInfoboxFieldMutation,
  useRemoveInfoboxFieldMutation,
  useChangePropertyValueMutation,
  useUpdatePropertyValueLatLngMutation,
  useAddInfoboxFieldMutation,
  useGetBlocksQuery,
} from "@reearth/gql";
import {
  useSceneId,
  useIsCapturing,
  useCamera,
  useSelected,
  useSelectedBlock,
} from "@reearth/state";

import { convertLayers, convertWidgets, convertToBlocks, convertProperty } from "./convert";
import {
  valueTypeToGQL,
  ValueType,
  ValueTypes,
  valueToGQL,
  LatLngHeight,
} from "@reearth/util/value";

export default (isBuilt?: boolean) => {
  const [sceneId] = useSceneId();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, onCameraChange] = useCamera();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [isDragging, setIsDragging] = useState(false);

  const selectLayer = useCallback(
    (id?: string) => select(id ? { layerId: id, type: "layer" } : undefined),
    [select],
  );

  const [moveInfoboxField] = useMoveInfoboxFieldMutation();
  const [removeInfoboxField] = useRemoveInfoboxFieldMutation();
  const [changePropertyValue] = useChangePropertyValueMutation();

  const onBlockMove = useCallback(
    async (id: string, _fromIndex: number, toIndex: number) => {
      if (selected?.type !== "layer") return;
      await moveInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
          index: toIndex,
        },
      });
    },
    [moveInfoboxField, selected],
  );

  const onBlockRemove = useCallback(
    async (id: string) => {
      if (selected?.type !== "layer") return;
      await removeInfoboxField({
        variables: {
          layerId: selected.layerId,
          infoboxFieldId: id,
        },
      });
    },
    [removeInfoboxField, selected],
  );

  const onBlockChange = useCallback(
    async <T extends ValueType>(
      propertyId: string,
      schemaItemId: string,
      fid: string,
      v: ValueTypes[T],
      vt: T,
    ) => {
      const gvt = valueTypeToGQL(vt);
      if (!gvt) return;

      await changePropertyValue({
        variables: {
          propertyId,
          schemaItemId,
          fieldId: fid,
          type: gvt,
          value: valueToGQL(v, vt),
        },
      });
    },
    [changePropertyValue],
  );

  const { data: layerData } = useGetLayersQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });
  const { data: widgetData } = useGetEarthWidgetsQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });

  const rootLayerId =
    layerData?.node?.__typename === "Scene" ? layerData.node.rootLayer?.id : undefined;
  const scene = widgetData?.node?.__typename === "Scene" ? widgetData.node : undefined;

  // convert data
  const layers = useMemo(
    () => convertLayers(layerData, selected?.type === "layer" ? selected.layerId : undefined),
    [layerData, selected],
  );

  useEffect(() => {
    console.log(layers?.layers);
  }, [layers]);

  // const layers = convertLayers(
  //   layerData,
  //   selected?.type === "layer" ? selected.layerId : undefined,
  // );

  const widgets = useMemo(() => convertWidgets(widgetData), [widgetData]);
  const sceneProperty = useMemo(() => convertProperty(scene?.property), [scene?.property]);

  const onFovChange = useCallback(
    (fov: number) => camera && onCameraChange({ ...camera, fov }),
    [camera, onCameraChange],
  );

  // block selector
  const [addInfoboxField] = useAddInfoboxFieldMutation();
  const { data: blockData } = useGetBlocksQuery({
    variables: { sceneId: sceneId ?? "" },
    skip: !sceneId,
  });
  const blocks = useMemo(() => convertToBlocks(blockData), [blockData]);
  const onBlockInsert = (bi: number, i: number, p?: "top" | "bottom") => {
    const b = blocks?.[bi];
    if (b?.pluginId && b?.extensionId && selected?.type === "layer") {
      addInfoboxField({
        variables: {
          layerId: selected.layerId,
          pluginId: b.pluginId,
          extensionId: b.extensionId,
          index: p ? i + (p === "bottom" ? 1 : 0) : undefined,
        },
      });
    }
  };

  const title = scene?.project?.publicTitle;
  useEffect(() => {
    if (!isBuilt || !title) return;
    document.title = title;
  }, [isBuilt, title]);

  const [updateLayerLatLng] = useUpdatePropertyValueLatLngMutation();

  const handleDragLayer = useCallback((_layerId: string, _position: LatLngHeight | undefined) => {
    setIsDragging(true);
  }, []);

  const handleDropLayer = useCallback(
    async (layerId: string, position?: LatLngHeight | undefined) => {
      setIsDragging(false);
      if (!position) return;
      const layerProperty = layers?.layers.find(l => l.id === layerId)?.rawProperty;
      const propertyItem =
        layerProperty && "items" in layerProperty
          ? layerProperty?.items.find(
              i => i.__typename === "PropertyGroup" && i.fields.find(f => f.fieldId === "location"),
            )
          : undefined;
      if (!layerProperty?.id || !position || !propertyItem) return;
      await updateLayerLatLng({
        variables: {
          propertyId: layerProperty.id,
          itemId: propertyItem.id,
          schemaItemId: "default",
          fieldId: "location",
          lat: position?.lat,
          lng: position?.lng,
        },
      });
    },
    [layers?.layers, updateLayerLatLng],
  );

  return {
    sceneId,
    rootLayerId,
    selectedLayerId: selected?.type === "layer" ? selected.layerId : undefined,
    selectedBlockId: selectedBlock,
    sceneProperty,
    widgets,
    layers: layers?.layers,
    selectedLayer: layers?.selectedLayer,
    blocks,
    isCapturing,
    camera,
    ready: !isBuilt || (!!layerData && !!widgetData),
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
    handleDragLayer,
    handleDropLayer,
    isDragging,
  };
};
