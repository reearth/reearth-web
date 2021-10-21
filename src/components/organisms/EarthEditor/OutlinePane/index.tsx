import React from "react";

import RawOutlinePane from "@reearth/components/molecules/EarthEditor/OutlinePane";

import useHooks from "./hooks";

export type Props = {
  className?: string;
};

const OutlinePane: React.FC<Props> = ({ className }) => {
  const {
    rootLayerId,
    layers,
    widgets,
    installableWidgets,
    sceneDescription,
    selectedType,
    selectedLayerId,
    selectedWidgetId,
    loading,
    selectLayer,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    selectScene,
    selectWidgets,
    selectWidget,
    addWidget,
    removeWidget,
    activateWidget,
    addLayerGroup,
    handleDrop,
  } = useHooks();

  return (
    <RawOutlinePane
      className={className}
      rootLayerId={rootLayerId}
      selectedLayerId={selectedLayerId}
      selectedWidgetId={selectedWidgetId}
      layers={layers}
      widgets={widgets}
      installableWidgets={installableWidgets}
      sceneDescription={sceneDescription}
      selectedType={selectedType}
      loading={loading}
      onLayerMove={moveLayer}
      onLayerVisibilityChange={updateLayerVisibility}
      onLayerRename={renameLayer}
      onLayerRemove={removeLayer}
      onLayerImport={importLayer}
      onLayerSelect={selectLayer}
      onLayerGroupCreate={addLayerGroup}
      onSceneSelect={selectScene}
      onWidgetsSelect={selectWidgets}
      onWidgetSelect={selectWidget}
      onWidgetAdd={addWidget}
      onWidgetRemove={removeWidget}
      onWidgetActivation={activateWidget}
      onDrop={handleDrop}
    />
  );
};

export default OutlinePane;
