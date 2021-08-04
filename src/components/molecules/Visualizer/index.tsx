import React, { PropsWithChildren } from "react";

import Filled from "@reearth/components/atoms/Filled";
import DropHolder from "@reearth/components/atoms/DropHolder";

import useHooks from "./hooks";
import { Provider } from "./context";
import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import P, { Primitive as PrimitiveType } from "./Primitive";
import W, { Widget as WidgetType } from "./Widget";
import Infobox, { Block as BlockType, InfoboxProperty, Props as InfoboxProps } from "./Infobox";
import { LatLngHeight } from "@reearth/util/value";

export type { VisualizerContext } from "./context";
export type { SceneProperty } from "./Engine";

export type Infobox = {
  blocks?: Block[];
  property?: InfoboxProperty;
};

export type Primitive = PrimitiveType & {
  infoboxEditable?: boolean;
  pluginProperty?: any;
};

export type Widget = WidgetType & {
  pluginProperty?: any;
};

export type Block = BlockType;

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    primitives?: Primitive[];
    widgets?: Widget[];
    sceneProperty?: SceneProperty;
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onPrimitiveSelect?: (id?: string) => void;
    onDragLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
    onDraggingLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
    onDropLayer?: (layerId: string, position: LatLngHeight | undefined) => void;
  } & Omit<EngineProps, "children" | "property" | "onPrimitiveSelect"> &
    Pick<
      InfoboxProps,
      "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
    >
>;

export default function Visualizer({
  rootLayerId,
  primitives,
  widgets,
  sceneProperty,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  children,
  pluginBaseUrl,
  isPublished,
  onPrimitiveSelect,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  onDragLayer,
  onDraggingLayer,
  onDropLayer,
  ...props
}: Props): JSX.Element {
  const {
    engineRef,
    wrapperRef,
    isDroppable,
    hiddenPrimitives,
    visualizerContext,
    selectedPrimitive,
    selectedPrimitiveId,
    selectedBlockId,
    innerCamera,
    selectPrimitive,
    selectBlock,
    updateCamera,
    isLayerDraggable,
    enableLayerDragging,
    disableLayerDragging,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    primitives,
    selectedPrimitiveId: outerSelectedPrimitiveId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    onPrimitiveSelect,
    onBlockSelect,
    onCameraChange: props.onCameraChange,
  });

  return (
    <Provider value={visualizerContext}>
      <Filled ref={wrapperRef}>
        {isDroppable && <DropHolder />}
        <Engine
          ref={engineRef}
          property={sceneProperty}
          selectedPrimitiveId={selectedPrimitive?.id}
          onPrimitiveSelect={selectPrimitive}
          {...props}
          camera={innerCamera}
          onCameraChange={updateCamera}
          onDragLayer={onDragLayer}
          onDraggingLayer={onDraggingLayer}
          onDropLayer={onDropLayer}
          isLayerDraggable={isLayerDraggable}>
          {primitives?.map(primitive => (
            // <DraggableEntity
            //   key={primitive.id}
            //   enableLayerDragging={enableLayerDragging}
            //   disableLayerDragging={disableLayerDragging}
            //   isLayerDraggable={isLayerDraggable}>
            <P
              key={primitive.id}
              primitive={primitive}
              sceneProperty={sceneProperty}
              pluginProperty={primitive.pluginProperty}
              isHidden={hiddenPrimitives.includes(primitive.id)}
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              isSelected={!!selectedPrimitiveId && selectedPrimitiveId === primitive.id}
              pluginBaseUrl={pluginBaseUrl}
              enableLayerDragging={enableLayerDragging}
              disableLayerDragging={disableLayerDragging}
              isDraggable={isLayerDraggable}
            />
            // </DraggableEntity>
          ))}
          {widgets?.map(widget => (
            <W
              key={widget.id}
              widget={widget}
              sceneProperty={sceneProperty}
              pluginProperty={widget.pluginProperty}
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              pluginBaseUrl={pluginBaseUrl}
            />
          ))}
        </Engine>
        <Infobox
          title={selectedPrimitive?.title}
          infoboxKey={selectedPrimitive?.id}
          visible={!!selectedPrimitive?.infobox}
          property={selectedPrimitive?.infobox?.property}
          sceneProperty={sceneProperty}
          primitive={selectedPrimitive}
          blocks={selectedPrimitive?.infobox?.blocks}
          selectedBlockId={selectedBlockId}
          isBuilt={props.isBuilt}
          isEditable={props.isEditable && !!selectedPrimitive?.infoboxEditable}
          onBlockChange={onBlockChange}
          onBlockDelete={onBlockDelete}
          onBlockMove={onBlockMove}
          onBlockInsert={onBlockInsert}
          onBlockSelect={selectBlock}
          renderInsertionPopUp={renderInfoboxInsertionPopUp}
          pluginBaseUrl={pluginBaseUrl}
        />
        {children}
      </Filled>
    </Provider>
  );
}
