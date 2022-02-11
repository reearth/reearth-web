import { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import {
  useGetScenePropertyQuery,
  useGetLayerPropertyQuery,
  useGetLinkableDatasetsQuery,
  useGetLayersFromLayerIdQuery,
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
} from "@reearth/gql";
import { Selected, useNotification } from "@reearth/state";

import { convert, Pane, convertLinkableDatasets, convertLayers } from "./convert";

export type Mode = "infobox" | "scene" | "layer" | "block" | "widgets" | "widget" | "cluster";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export default ({
  sceneId,
  rootLayerId,
  selected,
  selectedBlock,
  teamId,
  mode,
  locale,
}: {
  sceneId?: string;
  rootLayerId?: string;
  selected?: Selected;
  selectedBlock?: string;
  teamId?: string;
  mode: Mode;
  locale: string;
}) => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const {
    loading: layerLoading,
    error: layerError,
    data: layerData,
  } = useGetLayersFromLayerIdQuery({
    variables: { layerId: rootLayerId ?? "" },
    skip: !rootLayerId,
  });

  const {
    loading: scenePropertyLoading,
    error: scenePropertyError,
    data: scenePropertyData,
  } = useGetScenePropertyQuery({
    variables: { sceneId: sceneId || "", lang: locale },
    skip: !sceneId || (mode !== "scene" && mode != "widget" && mode != "cluster"),
  });

  const {
    loading: layerPropertyLoading,
    error: layerPropertyError,
    data: layerPropertyData,
  } = useGetLayerPropertyQuery({
    variables: { layerId: selected?.type === "layer" ? selected.layerId : "", lang: locale },
    skip:
      selected?.type !== "layer" || (mode !== "layer" && mode !== "block" && mode !== "infobox"),
  });

  const { data: linkableDatasets } = useGetLinkableDatasetsQuery({
    variables: {
      sceneId: sceneId ?? "",
    },
    skip: !sceneId,
  });

  const assetsPerPage = 20;

  const {
    data: assetsData,
    refetch,
    loading: loadingAssets,
    fetchMore,
    networkStatus,
  } = useAssetsQuery({
    variables: { teamId: teamId ?? "", pagination: { first: assetsPerPage } },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });
  const hasNextPage = assetsData?.assets.pageInfo.hasNextPage;
  const isRefetching = networkStatus === 3;
  const assets = assetsData?.assets.edges.map(e => e.node) as AssetNodes;

  const getMoreAssets = useCallback(() => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          first: assetsPerPage,
          after: assetsData?.assets.pageInfo.endCursor,
          delay: true,
        },
      });
    }
  }, [assetsData?.assets.pageInfo, fetchMore, hasNextPage]);

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (!teamId) return;

        const results = await Promise.all(
          Array.from(files).map(async file => {
            const result = await createAssetMutation({ variables: { teamId, file } });
            if (result.errors || !result.data?.createAsset) {
              setNotification({
                type: "error",
                text: intl.formatMessage({ defaultMessage: "Failed to add one or more assets." }),
              });
            }
          }),
        );
        if (results) {
          setNotification({
            type: "success",
            text: intl.formatMessage({ defaultMessage: "Successfully added one or more assets." }),
          });
          await refetch();
        }
      })(),
    [createAssetMutation, setNotification, refetch, teamId, intl],
  );

  const scene =
    scenePropertyData?.node?.__typename === "Scene" ? scenePropertyData.node : undefined;
  const sceneProperty = scene?.property;
  const layerProperty =
    mode === "layer" ? layerPropertyData?.layer?.property ?? undefined : undefined;
  const blockProperty =
    (selectedBlock && mode === "block"
      ? layerPropertyData?.layer?.infobox?.fields
      : undefined
    )?.find(f => f.id === selectedBlock)?.property ?? undefined;
  const infoboxProperty =
    mode === "infobox" && !selectedBlock
      ? layerPropertyData?.layer?.infobox?.property ?? undefined
      : undefined;
  const layerMergedProperty =
    mode === "layer" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.property ?? undefined
      : undefined;
  const infoboxMergedProperty =
    mode === "infobox" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.infobox?.property ?? undefined
      : undefined;
  const blockMergedProperty =
    (selectedBlock && mode === "block" && layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.merged?.infobox?.fields
      : undefined
    )?.find(f => f.originalId === selectedBlock)?.property ?? undefined;

  const property = sceneProperty ?? layerProperty ?? infoboxProperty ?? blockProperty;
  const propertyId = property?.id;
  const mergedProperty = layerMergedProperty ?? infoboxMergedProperty ?? blockMergedProperty;

  const items = useMemo(() => convert(property, mergedProperty), [property, mergedProperty]);

  const loading = scenePropertyLoading || layerPropertyLoading || layerLoading;
  const error = scenePropertyError ?? layerPropertyError ?? layerError;

  const isLayerGroup = layerPropertyData?.layer?.__typename === "LayerGroup";
  const linkedDatasetSchemaId =
    (layerPropertyData?.layer?.__typename === "LayerGroup"
      ? layerPropertyData.layer.linkedDatasetSchemaId
      : undefined) ??
    mergedProperty?.schema?.id ??
    undefined;
  const linkedDatasetId =
    layerPropertyData?.layer?.__typename === "LayerItem"
      ? layerPropertyData.layer.linkedDatasetId ?? undefined
      : undefined;
  const isInfoboxCreatable =
    selected?.type === "layer" && mode === "infobox" && !layerPropertyData?.layer?.infobox;
  const selectedWidget = useMemo(
    () =>
      selected?.type === "widget"
        ? scene?.widgets.find(w => selected.widgetId === w.id)
        : undefined,
    [scene?.widgets, selected],
  );

  const pane = useMemo<Pane | undefined>(() => {
    if (mode === "scene") {
      return {
        id: "reearth/cesium",
        mode: "scene",
        propertyId,
        items,
        title: layerPropertyData?.layer?.name,
      };
    }

    if (mode === "cluster") {
      if (selected?.type !== "cluster") return;

      const c = selected.clusterId
        ? scene?.clusters.find(c => selected.clusterId === c.id)
        : undefined;

      return {
        id: selected.clusterId,
        mode: "cluster",
        propertyId: c?.property?.id,
        extensionId: "cluster",
        items: convert(c?.property, null),
        title: layerPropertyData?.layer?.name,
      };
    }

    if (mode === "widget") {
      if (selected?.type !== "widget") return;
      const w = selected.widgetId
        ? scene?.widgets.find(w => selected.widgetId === w.id)
        : undefined;

      return {
        id: selected.widgetId || `${selected.pluginId}/${selected.extensionId}`,
        pluginId: selected.pluginId,
        extensionId: selected.extensionId,
        mode: "widget",
        propertyId: w?.property?.id,
        items: convert(w?.property, null),
        title: layerPropertyData?.layer?.name,
        enabled: !!w?.enabled,
      };
    }

    return {
      id: mode,
      mode,
      propertyId,
      items,
      title: layerPropertyData?.layer?.name,
      group: layerPropertyData?.layer?.__typename === "LayerGroup",
    };
  }, [
    mode,
    propertyId,
    items,
    layerPropertyData?.layer?.name,
    layerPropertyData?.layer?.__typename,
    selected,
    scene?.widgets,
    scene?.clusters,
  ]);
  const datasetSchemas = useMemo(
    () => convertLinkableDatasets(linkableDatasets),
    [linkableDatasets],
  );

  const layers = useMemo(() => convertLayers(layerData), [layerData]);

  return {
    loading,
    error,
    pane,
    isLayerGroup,
    linkedDatasetId,
    linkedDatasetSchemaId,
    isInfoboxCreatable,
    datasetSchemas,
    layers,
    assetsData: {
      assets,
      isLoading: loadingAssets ?? isRefetching,
      getMoreAssets,
      createAssets,
      hasNextPage,
    },
    selectedWidget,
  };
};
