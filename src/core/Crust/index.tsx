import { ReactNode, RefObject } from "react";

import { Tag } from "@reearth/core/mantle/compat/types";

import { ComputedFeature, ComputedLayer, Feature } from "../mantle";
import { LayerSelectionReason } from "../Map";
import { Viewport } from "../Visualizer/useViewport";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { Block, InfoboxProperty } from "./Infobox";
import Plugins from "./Plugins";
import { ExternalPluginProps } from "./Plugins/Plugin";
import ModalContainer from "./Plugins/Plugin/ModalContainer";
import PopupContainer from "./Plugins/Plugin/PopupContainer";
import { usePublishTheme } from "./theme";
import { ValueTypes, ValueType, MapRef, SceneProperty, Camera, Clock } from "./types";
import Widgets, {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
  InternalWidget,
} from "./Widgets";

export type { ValueTypes, ValueType } from "./types";

export type { Block } from "./Infobox";

export type {
  Context,
  WidgetLayoutConstraint,
  WidgetAlignSystem,
  Alignment,
  Location,
} from "./Widgets";

export type Props = {
  // common
  engineName?: string;
  isEditable?: boolean;
  inEditor?: boolean;
  isBuilt?: boolean;
  isMobile?: boolean;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: SceneProperty;
  viewport?: Viewport;
  camera?: Camera;
  clock?: Clock;
  selectedComputedLayer?: ComputedLayer;
  selectedComputedFeature?: ComputedFeature;
  selectedFeature?: Feature;
  selectedReason?: LayerSelectionReason;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  tags?: Tag[];
  // widgets
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  floatingWidgets?: InternalWidget[];
  // infobox
  infoboxProperty?: InfoboxProperty;
  blocks?: Block[];
  infoboxTitle?: string;
  selectedBlockId?: string;
  showInfoboxTitle?: boolean;
  infoboxVisible?: boolean;
  // plugin
  externalPlugin: ExternalPluginProps;
  // widget events
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignmentUpdate?: (location: Location, align: Alignment) => void;
  // infobox events
  onInfoboxMaskClick?: () => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends ValueType>(
    blockId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onBlockMove?: (id: string, fromIndex: number, toIndex: number) => void;
  onBlockDelete?: (id: string) => void;
  onBlockInsert?: (bi: number, i: number, pos?: "top" | "bottom") => void;
  renderInfoboxInsertionPopup?: (onSelect: (bi: number) => void, onClose: () => void) => ReactNode;
  overrideSceneProperty: (pluginId: string, property: SceneProperty) => void;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  inEditor,
  isMobile,
  mapRef,
  sceneProperty,
  viewport,
  camera,
  clock,
  tags,
  selectedLayerId,
  selectedReason,
  selectedComputedLayer,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  blocks,
  infoboxProperty,
  infoboxTitle,
  infoboxVisible,
  selectedBlockId,
  externalPlugin,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onInfoboxMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  renderInfoboxInsertionPopup,
  overrideSceneProperty,
}: Props): JSX.Element | null {
  const {
    renderBlock,
    renderWidget,
    shownPluginModalInfo,
    shownPluginPopupInfo,
    onPluginModalShow,
    pluginModalContainerRef,
    pluginPopupContainerRef,
  } = useHooks({ mapRef, ...externalPlugin });
  const theme = usePublishTheme(sceneProperty?.theme);
  const widgetContext = useWidgetContext({ mapRef, camera, clock, sceneProperty, selectedLayerId });

  return (
    <Plugins
      engineName={engineName}
      mapRef={mapRef}
      sceneProperty={sceneProperty}
      inEditor={inEditor}
      tags={tags}
      selectedLayer={selectedComputedLayer}
      layerSelectionReason={selectedReason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      overrideSceneProperty={overrideSceneProperty}>
      <ModalContainer
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
        ref={pluginModalContainerRef}
      />
      <PopupContainer shownPluginPopupInfo={shownPluginPopupInfo} ref={pluginPopupContainerRef} />
      <Widgets
        isMobile={isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        alignSystem={widgetAlignSystem}
        editing={widgetAlignSystemEditing}
        layoutConstraint={widgetLayoutConstraint}
        theme={theme}
        context={widgetContext}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onAlignmentUpdate={onWidgetAlignmentUpdate}
        renderWidget={renderWidget}
      />
      <Infobox
        isBuilt={isBuilt}
        isEditable={isEditable}
        blocks={blocks}
        infoboxKey={selectedLayerId?.layerId}
        property={infoboxProperty}
        title={infoboxTitle}
        visible={infoboxVisible}
        selectedBlockId={selectedBlockId}
        theme={theme}
        layer={selectedComputedLayer?.layer}
        onMaskClick={onInfoboxMaskClick}
        onBlockSelect={onBlockSelect}
        onBlockChange={onBlockChange}
        onBlockDelete={onBlockDelete}
        onBlockMove={onBlockMove}
        onBlockInsert={onBlockInsert}
        renderBlock={renderBlock}
        renderInsertionPopup={renderInfoboxInsertionPopup}
      />
    </Plugins>
  );
}
