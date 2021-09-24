import React, { PropsWithChildren } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";

import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import useHooks from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import Layers, { LayerStore } from "./Layer";
import { Provider } from "./Plugin";
import W from "./Widget";
import type { Widget } from "./Widget";

export type { SceneProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Widget } from "./Widget";
export type { Layer } from "./Layer";
export { LayerStore } from "./Layer";

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    layers?: LayerStore;
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
    providerProps,
    isLayerHidden,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    selectedBlockId,
    innerCamera,
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
    selectedLayerId: outerSelectedLayerId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    onLayerSelect,
    onBlockSelect,
    onCameraChange: props.onCameraChange,
  });

  return (
    <Provider {...providerProps}>
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
          <Layers
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            selectedLayerId={selectedLayerId}
            layers={layers}
            isLayerHidden={isLayerHidden}
          />
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
