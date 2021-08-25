import { useMemo, useEffect, useCallback } from "react";

import {
  useGetLayersQuery,
  useGetEarthWidgetsQuery,
  useMoveInfoboxFieldMutation,
  useRemoveInfoboxFieldMutation,
  useChangePropertyValueMutation,
  useAddInfoboxFieldMutation,
  useGetBlocksQuery,
  useUpdateWidgetMutation,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";

import { convertLayers, convertWidgets, convertToBlocks, convertProperty } from "./convert";
import { valueTypeToGQL, ValueType, ValueTypes, Camera, valueToGQL } from "@reearth/util/value";
import {
  Location,
  Alignments,
} from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";

export default (isBuilt?: boolean) => {
  const [
    { sceneId, selectedLayer, selectedBlock, isCapturing, camera, widgetAlignEditor },
    setLocalState,
  ] = useLocalState(
    ({ sceneId, selectedLayer, selectedBlock, isCapturing, camera, widgetAlignEditor }) => ({
      sceneId,
      selectedLayer,
      selectedBlock,
      isCapturing,
      camera,
      widgetAlignEditor,
    }),
  );

  const selectLayer = useCallback(
    (id?: string) => setLocalState({ selectedLayer: id, selectedType: "layer" }),
    [setLocalState],
  );
  const selectBlock = useCallback(
    (id?: string) => setLocalState({ selectedBlock: id }),
    [setLocalState],
  );

  const [moveInfoboxField] = useMoveInfoboxFieldMutation();
  const [removeInfoboxField] = useRemoveInfoboxFieldMutation();
  const [changePropertyValue] = useChangePropertyValueMutation();

  const onBlockMove = useCallback(
    async (id: string, _fromIndex: number, toIndex: number) => {
      if (!selectedLayer) return;
      await moveInfoboxField({
        variables: {
          layerId: selectedLayer,
          infoboxFieldId: id,
          index: toIndex,
        },
      });
    },
    [moveInfoboxField, selectedLayer],
  );

  const onBlockRemove = useCallback(
    async (id: string) => {
      if (!selectedLayer) return;
      await removeInfoboxField({
        variables: {
          layerId: selectedLayer,
          infoboxFieldId: id,
        },
      });
    },
    [removeInfoboxField, selectedLayer],
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
  const layers = useMemo(() => convertLayers(layerData, selectedLayer), [layerData, selectedLayer]);
  const widgets = useMemo(() => convertWidgets(widgetData), [widgetData]);
  const sceneProperty = useMemo(() => convertProperty(scene?.property), [scene?.property]);

  const onIsCapturingChange = useCallback(
    (isCapturing: boolean) => setLocalState({ isCapturing }),
    [setLocalState],
  );

  const onCameraChange = useCallback(
    (value: Camera) => setLocalState({ camera: { ...camera, ...value } }),
    [setLocalState, camera],
  );

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
    if (b?.pluginId && b?.extensionId && selectedLayer) {
      addInfoboxField({
        variables: {
          layerId: selectedLayer,
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

  // update widget alignment
  const [updateWidgetMutation] = useUpdateWidgetMutation();
  const onWidgetUpdate = useCallback(
    async (
      id: string,
      extended?: boolean,
      index?: number,
      align?: Alignments,
      location?: Location,
    ) => {
      if (!sceneId || !id) return;

      let loc: { zone: string; section: string; area: string } | undefined;
      if (location?.zone && location.section && location.area) {
        loc = { zone: location.zone, section: location.section, area: location.area };
      }
      await updateWidgetMutation({
        variables: {
          sceneId,
          widgetId: id,
          enabled: true,
          layout: {
            extended,
            location: loc,
            index,
            align,
          },
        },
        refetchQueries: ["GetEarthWidgets"],
      });
    },
    [sceneId, updateWidgetMutation],
  );

  return {
    sceneId,
    rootLayerId,
    selectedLayerId: selectedLayer,
    selectedBlockId: selectedBlock,
    sceneProperty,
    widgets,
    layers: layers?.layers,
    selectedLayer: layers?.selectedLayer,
    blocks,
    isCapturing,
    camera,
    ready: !isBuilt || (!!layerData && !!widgetData),
    widgetAlignEditor,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
  };
};
