import React, { useCallback } from "react";

import ContentPicker from "@reearth/components/atoms/ContentPicker";
import FovSlider from "@reearth/components/molecules/EarthEditor/FovSlider";
import Visualizer, { Props as VisualizerProps } from "@reearth/components/molecules/Visualizer";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  isBuilt?: boolean;
};

// TODO: ErrorBoudaryでエラーハンドリング

const CanvasArea: React.FC<Props> = ({ className, isBuilt }) => {
  const {
    rootLayerId,
    selectedBlockId,
    sceneProperty,
    pluginProperty,
    layers,
    widgets,
    selectedLayerId,
    blocks,
    isCapturing,
    camera,
    widgetAlignEditorActivated,
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
    handleDragLayer,
    handleDropLayer,
    isDragging,
  } = useHooks(isBuilt);
  const renderInfoboxInsertionPopUp = useCallback<
    NonNullable<VisualizerProps["renderInfoboxInsertionPopUp"]>
  >(
    (onSelect, onClose) => (
      <ContentPicker items={blocks} onSelect={onSelect} onClickAway={onClose} />
    ),
    [blocks],
  );

  return (
    <Visualizer
      className={className}
      engine="cesium"
      isEditable={!isBuilt}
      isBuilt={!!isBuilt}
      layers={layers}
      widgets={widgets}
      selectedLayerId={selectedLayerId}
      selectedBlockId={selectedBlockId}
      rootLayerId={rootLayerId}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      camera={camera}
      ready={isBuilt || (!!layers && !!widgets)}
      onLayerSelect={selectLayer}
      widgetAlignEditorActivated={widgetAlignEditorActivated}
      onCameraChange={onCameraChange}
      onWidgetUpdate={onWidgetUpdate}
      onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
      onBlockSelect={selectBlock}
      onBlockChange={onBlockChange}
      onBlockMove={onBlockMove}
      onBlockDelete={onBlockRemove}
      onBlockInsert={onBlockInsert}
      renderInfoboxInsertionPopUp={renderInfoboxInsertionPopUp}
      onDragLayer={handleDragLayer}
      onDropLayer={handleDropLayer}
      isLayerDragging={isDragging}
      pluginBaseUrl={window.REEARTH_CONFIG?.plugins}>
      <FovSlider
        isCapturing={isCapturing}
        onIsCapturingChange={onIsCapturingChange}
        camera={camera}
        onFovChange={onFovChange}
      />
    </Visualizer>
  );
};

export default CanvasArea;
