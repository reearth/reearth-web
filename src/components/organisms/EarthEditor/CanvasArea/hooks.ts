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
  useUpdateWidgetAlignSystemMutation,
  WidgetLocationInput,
  WidgetZoneType,
  WidgetSectionType,
  WidgetAreaType,
  WidgetAreaAlign,
} from "@reearth/gql";
import {
  useSceneId,
  useIsCapturing,
  useCamera,
  useSelected,
  useSelectedBlock,
  useWidgetAlignEditor,
} from "@reearth/state";

import { convertLayers, convertWidgets, convertToBlocks, convertProperty } from "./convert";
import { valueTypeToGQL, ValueType, ValueTypes, valueToGQL } from "@reearth/util/value";
import { Alignments } from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";

export type Location = {
  zone: string;
  section: string;
  area: string;
};

export default (isBuilt?: boolean) => {
  const [sceneId] = useSceneId();
  const [isCapturing, onIsCapturingChange] = useIsCapturing();
  const [camera, onCameraChange] = useCamera();
  const [selected, select] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [widgetAlignEditor] = useWidgetAlignEditor();

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

  const [updateWidgetMutation] = useUpdateWidgetMutation();
  const onWidgetUpdate = useCallback(
    async (id: string, location?: Location, extended?: boolean, index?: number) => {
      if (!sceneId) return;

      let loc: WidgetLocationInput | undefined;
      if (location) {
        loc = {
          zone: location.zone.toUpperCase() as WidgetZoneType,
          section: location.section.toUpperCase() as WidgetSectionType,
          area: location.area.toUpperCase() as WidgetAreaType,
        };
      }
      await updateWidgetMutation({
        variables: {
          sceneId,
          widgetId: id,
          enabled: true,
          location: loc,
          extended,
          index,
        },
        refetchQueries: ["GetEarthWidgets"],
      });
    },
    [sceneId, updateWidgetMutation],
  );

  const [updateWidgetAlignSystemMutation] = useUpdateWidgetAlignSystemMutation();
  const onWidgetAlignSystemUpdate = useCallback(
    async (location?: Location, align?: Alignments) => {
      if (!sceneId || !location) return;
      console.log(sceneId, "sceneId");
      console.log(location, "location");
      console.log(align, "align");
      console.log(align?.toUpperCase(), "alignUPP");

      updateWidgetAlignSystemMutation({
        variables: {
          sceneId,
          location: {
            zone: location.zone.toUpperCase() as WidgetZoneType,
            section: location.section.toUpperCase() as WidgetSectionType,
            area: location.area.toUpperCase() as WidgetAreaType,
          },
          align: align?.toUpperCase() as WidgetAreaAlign,
        },
      });
    },
    [sceneId, updateWidgetAlignSystemMutation],
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
    widgetAlignEditor,
    selectLayer,
    selectBlock,
    onBlockChange,
    onBlockMove,
    onBlockRemove,
    onBlockInsert,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
    onIsCapturingChange,
    onCameraChange,
    onFovChange,
  };
};
