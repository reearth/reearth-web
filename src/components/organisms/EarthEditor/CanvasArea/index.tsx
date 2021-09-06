import React, { useCallback } from "react";

import Visualizer, { Props as VisualizerProps } from "@reearth/components/molecules/Visualizer";
import ContentPicker from "@reearth/components/atoms/ContentPicker";
import FovSlider from "@reearth/components/molecules/EarthEditor/FovSlider";

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
    layers,
    widgets,
    selectedLayer,
    blocks,
    isCapturing,
    camera,
    ready,
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
    handleDraggingLayer,
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
      primitives={layers}
      widgets={widgets}
      selectedPrimitiveId={selectedLayer?.id}
      selectedBlockId={selectedBlockId}
      rootLayerId={rootLayerId}
      sceneProperty={sceneProperty}
      camera={camera}
      ready={ready}
      onPrimitiveSelect={selectLayer}
      onCameraChange={onCameraChange}
      onBlockSelect={selectBlock}
      onBlockChange={onBlockChange}
      onBlockMove={onBlockMove}
      onBlockDelete={onBlockRemove}
      onBlockInsert={onBlockInsert}
      renderInfoboxInsertionPopUp={renderInfoboxInsertionPopUp}
      onDragLayer={handleDragLayer}
      onDraggingLayer={handleDraggingLayer}
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
