import React, { PropsWithChildren } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";

import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import useHooks from "./hooks";
import type { Layer } from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import { Provider } from "./Plugin";
import P from "./Primitive";
import W from "./Widget";
import type { Widget } from "./Widget";

export type { SceneProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Widget } from "./Widget";

export type { Layer } from "./hooks";

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    layers?: Layer[];
    layerMap?: Map<string, Layer>;
    widgets?: Widget[];
    sceneProperty?: SceneProperty;
    pluginProperty?: { [key: string]: any };
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onLayerSelect?: (id?: string) => void;
  } & Omit<EngineProps, "children" | "property" | "onLayerSelect"> &
    Pick<
      InfoboxProps,
      "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
    >
>;

export default function Visualizer({
  rootLayerId,
  layers,
  layerMap,
  widgets,
  sceneProperty,
  children,
  pluginProperty,
  pluginBaseUrl,
  isPublished,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  onLayerSelect,
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
    isLayerHidden,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    selectedBlockId,
    innerCamera,
    flattenLayers,
    infobox,
    selectLayer,
    selectBlock,
    updateCamera,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    layers,
    layerMap,
    selectedLayerId: outerSelectedLayerId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    onLayerSelect,
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
          selectedLayerId={selectedLayer?.id}
          layerSelectionReason={layerSelectionReason}
          onLayerSelect={selectLayer}
          {...props}
          camera={innerCamera}
          onCameraChange={updateCamera}>
          {flattenLayers?.map(layer =>
            !layer.isVisible ? null : (
              <P
                key={layer.id}
                layer={layer}
                sceneProperty={sceneProperty}
                pluginProperty={
                  layer.pluginId && layer.extensionId
                    ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
                    : undefined
                }
                isHidden={isLayerHidden(layer.id)}
                isEditable={props.isEditable}
                isBuilt={props.isBuilt}
                isSelected={!!selectedLayerId && selectedLayerId === layer.id}
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
          layer={infobox?.layer}
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
