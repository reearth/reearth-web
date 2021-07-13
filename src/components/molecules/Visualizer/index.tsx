import React, { PropsWithChildren } from "react";

import Filled from "@reearth/components/atoms/Filled";
import DropHolder from "@reearth/components/atoms/DropHolder";

import useHooks from "./hooks";
import { Provider } from "./context";
import Engine, { Props as EngineProps } from "./Engine";
import P, { Primitive as PrimitiveType } from "./Primitive";
import W, { Widget as WidgetType } from "./Widget";
import Infobox, { Block as BlockType, InfoboxProperty, Props as InfoboxProps } from "./Infobox";

export type { VisualizerContext } from "./context";

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

export type Props<SP = any> = PropsWithChildren<
  {
    rootLayerId?: string;
    primitives?: Primitive[];
    widgets?: Widget[];
    sceneProperty?: SP;
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onPrimitiveSelect?: (id?: string) => void;
  } & Omit<EngineProps, "children" | "property" | "onPrimitiveSelect"> &
    Pick<
      InfoboxProps,
      "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
    >
>;

export default function Visualizer<SP = any>({
  rootLayerId,
  primitives,
  widgets,
  sceneProperty,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  children,
  pluginBaseUrl,
  onPrimitiveSelect,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  ...props
}: Props<SP>): JSX.Element {
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
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    primitives,
    selectedPrimitiveId: outerSelectedPrimitiveId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
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
          onCameraChange={updateCamera}>
          {primitives?.map(primitive => (
            <P
              key={primitive.id}
              primitive={primitive}
              sceneProperty={sceneProperty}
              pluginProperty={primitive.pluginProperty}
              isHidden={hiddenPrimitives.includes(primitive.id)}
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              isSelected={selectedPrimitive?.id === primitive.id}
              selected={selectedPrimitiveId}
              pluginBaseUrl={pluginBaseUrl}
            />
          ))}
        </Engine>
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
