import { ReactNode } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";
import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";
import { LatLng } from "@reearth/util/value";

import Engine, { Props as EngineProps, SceneProperty, ClusterProperty } from "./Engine";
import useHooks from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import Layers, { LayerStore, Layer } from "./Layers";
import PluginModal from "./Modal";
import { Provider } from "./Plugin";
import type { Tag } from "./Plugin/types";
import W from "./Widget";
import type { Widget } from "./Widget";
import WidgetAlignSystem, {
  Props as WidgetAlignSystemProps,
  WidgetAlignSystem as WidgetAlignSystemType,
} from "./WidgetAlignSystem";

export type { SceneProperty, ClusterProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Layer } from "./Layers";
export type { Tag } from "./Plugin/types";
export type {
  Widget,
  Alignment,
  Location,
  WidgetAlignSystem,
  WidgetLayout,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
} from "./WidgetAlignSystem";
export { LayerStore };

export type Props = {
  children?: ReactNode;
  rootLayerId?: string;
  rootLayer?: Layer;
  widgets?: {
    floatingWidgets?: Widget[];
    alignSystem?: WidgetAlignSystemType;
    layoutConstraint?: WidgetAlignSystemProps["layoutConstraint"];
  };
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  pluginProperty?: { [key: string]: any };
  clusterProperty?: ClusterProperty[];
  selectedLayerId?: string;
  selectedBlockId?: string;
  pluginBaseUrl?: string;
  isPublished?: boolean;
  widgetAlignEditorActivated?: boolean;
  onWidgetUpdate?: WidgetAlignSystemProps["onWidgetUpdate"];
  onWidgetAlignSystemUpdate?: WidgetAlignSystemProps["onWidgetAlignSystemUpdate"];
  renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
  onLayerSelect?: (id?: string) => void;
  onLayerDrop?: (layer: Layer, key: string, latlng: LatLng) => void;
} & Omit<EngineProps, "children" | "property" | "onLayerSelect" | "onLayerDrop"> &
  Pick<
    InfoboxProps,
    "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
  >;

export default function Visualizer({
  ready,
  rootLayerId,
  rootLayer,
  widgets,
  sceneProperty,
  tags,
  children,
  pluginProperty,
  clusterProperty,
  pluginBaseUrl,
  isPublished,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  widgetAlignEditorActivated,
  onLayerSelect,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  onLayerDrop,
  ...props
}: Props): JSX.Element {
  const {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayerId,
    selectedLayer,
    layers,
    layerSelectionReason,
    layerOverriddenProperties,
    isLayerDragging,
    selectedBlockId,
    innerCamera,
    infobox,
    overriddenSceneProperty,
    pluginModal,
    isLayerHidden,
    selectLayer,
    selectBlock,
    changeBlock,
    updateCamera,
    handleLayerDrag,
    handleLayerDrop,
    handleInfoboxMaskClick,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    rootLayer,
    selectedLayerId: outerSelectedLayerId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    tags,
    onLayerSelect,
    onBlockSelect,
    onBlockChange,
    onCameraChange: props.onCameraChange,
    onLayerDrop,
  });

  return (
    <Provider {...providerProps}>
      <Filled ref={wrapperRef}>
        {isDroppable && <DropHolder />}
        {ready && widgets?.alignSystem && (
          <WidgetAlignSystem
            alignSystem={widgets.alignSystem}
            editing={widgetAlignEditorActivated}
            onWidgetUpdate={onWidgetUpdate}
            onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
            sceneProperty={overriddenSceneProperty}
            pluginProperty={pluginProperty}
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginBaseUrl={pluginBaseUrl}
            layoutConstraint={widgets.layoutConstraint}
          />
        )}
        <Engine
          ref={engineRef}
          property={overriddenSceneProperty}
          selectedLayerId={selectedLayer?.id}
          layerSelectionReason={layerSelectionReason}
          ready={ready}
          camera={innerCamera}
          isLayerDragging={isLayerDragging}
          isLayerDraggable={props.isEditable}
          onLayerSelect={selectLayer}
          onCameraChange={updateCamera}
          onLayerDrop={handleLayerDrop}
          onLayerDrag={handleLayerDrag}
          {...props}>
          <Layers
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginProperty={pluginProperty}
            clusterProperty={clusterProperty}
            sceneProperty={overriddenSceneProperty}
            pluginBaseUrl={pluginBaseUrl}
            selectedLayerId={selectedLayerId}
            layers={layers}
            isLayerHidden={isLayerHidden}
            overriddenProperties={layerOverriddenProperties}
            clusterComponent={engineRef.current?.clusterComponent}
          />
          {ready &&
            widgets?.floatingWidgets?.map(widget => (
              <W
                key={widget.id}
                widget={widget}
                sceneProperty={overriddenSceneProperty}
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
        {ready && <PluginModal modal={pluginModal} />}
        {ready && (
          <Infobox
            title={infobox?.title}
            infoboxKey={infobox?.infoboxKey}
            visible={!!infobox?.visible}
            sceneProperty={overriddenSceneProperty}
            blocks={infobox?.blocks}
            layer={infobox?.layer}
            selectedBlockId={selectedBlockId}
            pluginProperty={pluginProperty}
            isBuilt={props.isBuilt}
            isEditable={props.isEditable && !!infobox?.isEditable}
            onBlockChange={changeBlock}
            onBlockDelete={onBlockDelete}
            onBlockMove={onBlockMove}
            onBlockInsert={onBlockInsert}
            onBlockSelect={selectBlock}
            renderInsertionPopUp={renderInfoboxInsertionPopUp}
            pluginBaseUrl={pluginBaseUrl}
            onMaskClick={handleInfoboxMaskClick}
          />
        )}
        {children}
        {!ready && (
          <LoadingWrapper>
            <Loading />
          </LoadingWrapper>
        )}
      </Filled>
    </Provider>
  );
}

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: ${({ theme }) => theme.zIndexes.loading};
`;
