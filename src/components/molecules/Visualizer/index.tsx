import React, { PropsWithChildren } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";

import { Provider } from "./context";
import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import useHooks from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import P from "./Primitive";
import type { Primitive as RawPrimitive } from "./Primitive";
import W from "./Widget";
import type { Widget } from "./Widget";

export type { VisualizerContext } from "./context";
export type { SceneProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Widget } from "./Widget";

export type Primitive = RawPrimitive & {
  infoboxEditable?: boolean;
};

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    primitives?: Primitive[];
    widgets?: Widget[];
    sceneProperty?: SceneProperty;
    pluginProperty?: { [key: string]: any };
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onPrimitiveSelect?: (id?: string) => void;
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
  children,
  pluginProperty,
  pluginBaseUrl,
  isPublished,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  onPrimitiveSelect,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  ...props
}: Props): JSX.Element {
  const {
    engineRef,
    wrapperRef,
    isDroppable,
    visualizerContext,
    isPrimitiveHidden,
    selectedPrimitive,
    selectedPrimitiveId,
    primitiveSelectionReason,
    selectedBlockId,
    innerCamera,
    infobox,
    selectPrimitive,
    selectBlock,
    updateCamera,
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
          primitiveSelectionReason={primitiveSelectionReason}
          onPrimitiveSelect={selectPrimitive}
          {...props}
          camera={innerCamera}
          onCameraChange={updateCamera}>
          {primitives?.map(primitive =>
            !primitive.isVisible ? null : (
              <P
                key={primitive.id}
                primitive={primitive}
                sceneProperty={sceneProperty}
                pluginProperty={
                  primitive.pluginId && primitive.extensionId
                    ? pluginProperty?.[`${primitive.pluginId}/${primitive.extensionId}`]
                    : undefined
                }
                isHidden={isPrimitiveHidden(primitive.id)}
                isEditable={props.isEditable}
                isBuilt={props.isBuilt}
                isSelected={!!selectedPrimitiveId && selectedPrimitiveId === primitive.id}
                pluginBaseUrl={pluginBaseUrl}
              />
            ),
          )}
          {widgets?.map(widget => (
            <W
              key={widget.id}
              widget={widget}
              sceneProperty={sceneProperty}
              pluginProperty={
                widget.pluginId && widget.extensionId
                  ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                  : undefined
              }
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              pluginBaseUrl={pluginBaseUrl}
            />
          ))}
        </Engine>
        <Infobox
          title={infobox?.title}
          infoboxKey={infobox?.infoboxKey}
          visible={!!infobox?.visible}
          sceneProperty={sceneProperty}
          primitive={infobox?.primitive}
          selectedBlockId={selectedBlockId}
          pluginProperty={pluginProperty}
          isBuilt={props.isBuilt}
          isEditable={props.isEditable && !!infobox?.isEditable}
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
