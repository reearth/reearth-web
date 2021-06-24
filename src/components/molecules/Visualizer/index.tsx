import React, { PropsWithChildren } from "react";

import Filled from "@reearth/components/atoms/Filled";
import DropHolder from "@reearth/components/atoms/DropHolder";

import useHooks from "./hooks";
import Engine, { Props as EngineProps } from "./Engine";
import P, { Primitive as PrimitiveType } from "./Primitive";
import W, { Widget as WidgetType } from "./Widget";
import Infobox, { Block as BlockType, InfoboxProperty, Props as InfoboxProps } from "./InfoBox";

export type { CommonAPI, FlyToCamera, FlyToOptions } from "./commonApi";

export type Infobox = {
  blocks?: Block[];
  property?: InfoboxProperty;
};

export type Primitive = PrimitiveType & {
  title?: string;
  infobox?: Infobox;
  infoboxEditable?: boolean;
};

export type Widget = WidgetType & { id: string };

export type Block = BlockType;

export type Props<SP = any> = PropsWithChildren<
  {
    rootLayerId?: string;
    primitives?: Primitive[];
    widgets?: Widget[];
    sceneProperty?: SP;
    selectedBlockId?: string;
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
    commonAPI,
    selectedPrimitive,
    selectedPrimitiveId,
    selectedBlockId,
    selectPrimitive,
    selectBlock,
  } = useHooks({
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    primitives,
    selectedPrimitiveId: outerSelectedPrimitiveId,
    selectedBlockId: outerSelectedBlockId,
    onPrimitiveSelect,
    onBlockSelect,
  });

  return (
    <Filled ref={wrapperRef}>
      {isDroppable && <DropHolder />}
      <Engine
        ref={engineRef}
        property={sceneProperty}
        selectedPrimitiveId={selectedPrimitive?.id}
        onPrimitiveSelect={selectPrimitive}
        {...props}>
        {primitives?.map(primitive => (
          <P
            key={primitive.id}
            api={commonAPI}
            primitive={primitive}
            sceneProperty={sceneProperty}
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            isSelected={selectedPrimitive?.id === primitive.id}
            selected={selectedPrimitiveId}
          />
        ))}
      </Engine>
      {widgets?.map(widget => (
        <W
          key={widget.id}
          api={commonAPI}
          widget={widget}
          sceneProperty={sceneProperty}
          isEditable={props.isEditable}
          isBuilt={props.isBuilt}
        />
      ))}
      <Infobox
        api={commonAPI}
        title={selectedPrimitive?.title}
        infoboxKey={selectedPrimitive?.id}
        visible={!!selectedPrimitive?.infobox}
        property={selectedPrimitive?.infobox?.property}
        sceneProperty={sceneProperty}
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
      />
      {children}
    </Filled>
  );
}
