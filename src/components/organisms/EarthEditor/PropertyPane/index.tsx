import React from "react";

import Loading from "@reearth/components/atoms/Loading";
import Wrapper from "@reearth/components/molecules/EarthEditor/PropertyPane";

import useHooks, { Mode as RawMode } from "./hooks";

export type Mode = RawMode;
export interface Props {
  mode: Mode;
}

const PropertyPane: React.FC<Props> = ({ mode }) => {
  const {
    pane,
    isLayerGroup,
    linkedDatasetSchemaId,
    linkedDatasetId,
    isInfoboxCreatable,
    isCapturing,
    camera,
    datasetSchemas,
    loading,
    layers,
    assets,
    isAssetsLoading,
    hasMoreAssets,
    assetSort,
    assetSearchTerm,
    getMoreAssets,
    createAssets,
    handleAssetSortChange,
    handleAssetSearch,
    selectedWidget,
    widgetAlignEditorActivated,
    changeValue,
    removeField,
    link,
    uploadFile,
    removeFile,
    createInfobox,
    removeInfobox,
    removeInfoboxField,
    onIsCapturingChange,
    onCameraChange,
    addPropertyItem,
    movePropertyItem,
    removePropertyItem,
    onWidgetAlignEditorActivate,
    updatePropertyItems,
  } = useHooks(mode);
  return (
    <>
      {pane && (
        <Wrapper
          key={pane.id}
          propertyId={pane.propertyId}
          mode={pane.mode}
          title={pane.title}
          items={pane.items}
          isTemplate={pane.group}
          isInfoboxCreatable={isInfoboxCreatable}
          isCapturing={isCapturing}
          camera={camera}
          isLinkable={isLayerGroup && !!linkedDatasetSchemaId}
          linkedDatasetSchemaId={linkedDatasetSchemaId}
          linkedDatasetId={linkedDatasetId}
          datasetSchemas={datasetSchemas}
          layers={layers}
          assets={assets}
          assetSort={assetSort}
          assetSearchTerm={assetSearchTerm}
          hasMoreAssets={hasMoreAssets}
          isAssetsLoading={isAssetsLoading}
          onCreateAssets={createAssets}
          onAssetSort={handleAssetSortChange}
          onAssetSearch={handleAssetSearch}
          onGetMoreAssets={getMoreAssets}
          selectedWidget={selectedWidget}
          widgetAlignEditorActivated={widgetAlignEditorActivated}
          onCreateInfobox={createInfobox}
          onChange={changeValue}
          onRemove={removeField}
          onLink={link}
          onUploadFile={uploadFile}
          onRemoveFile={removeFile}
          onIsCapturingChange={onIsCapturingChange}
          onCameraChange={onCameraChange}
          onItemAdd={addPropertyItem}
          onItemMove={movePropertyItem}
          onItemRemove={removePropertyItem}
          onItemsUpdate={updatePropertyItems}
          onWidgetAlignEditorActivate={onWidgetAlignEditorActivate}
          onRemovePane={
            mode === "infobox" ? removeInfobox : mode === "block" ? removeInfoboxField : undefined
          }
        />
      )}
      {loading && <Loading />}
    </>
  );
};

export default PropertyPane;
