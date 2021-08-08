import React, { PropsWithChildren } from "react";

import Filled from "@reearth/components/atoms/Filled";
import DropHolder from "@reearth/components/atoms/DropHolder";

import useHooks from "./hooks";
import { Provider } from "./context";
import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import P, { Primitive as PrimitiveType } from "./Primitive";
import W, { Widget as WidgetType } from "./Widget";
import Infobox, { Block as BlockType, InfoboxProperty, Props as InfoboxProps } from "./Infobox";
import WidgetAlignSystem, {
  WidgetAlignSystem as WidgetAlignSystemType,
  Location,
  Alignments,
} from "./WidgetAlignSystem";
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
    widgets?: { floatWidgets: Widget[]; alignSystem: WidgetAlignSystemType };
    sceneProperty?: SceneProperty;
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    onWidgetUpdate?: (
      id: string,
      extended?: boolean | undefined,
      index?: number | undefined,
      align?: Alignments | undefined,
      location?: Location,
    ) => Promise<void>;
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
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  children,
  pluginBaseUrl,
  isPublished,
  onWidgetUpdate,
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
        {widgets && (
          <WidgetAlignSystem
            alignSystem={widgets.alignSystem}
            onWidgetUpdate={onWidgetUpdate}
            sceneProperty={sceneProperty}
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginBaseUrl={pluginBaseUrl}
          />
        )}
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
              isSelected={!!selectedPrimitiveId && selectedPrimitiveId === primitive.id}
              pluginBaseUrl={pluginBaseUrl}
            />
          ))}
          {widgets?.floatWidgets.map(widget => (
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
