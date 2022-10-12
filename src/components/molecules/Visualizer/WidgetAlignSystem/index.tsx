import React from "react";
import { GridWrapper } from "react-align";
import { useMedia } from "react-use";

import { styled } from "@reearth/theme";

import type { PluginModalInfo } from "../Plugin/ModalContainer";

import useHooks from "./hooks";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
} from "./hooks";
import MobileZone from "./MobileZone";
import ZoneComponent from "./Zone";

export type {
  WidgetAlignSystem,
  WidgetLayout,
  Location,
  Alignment,
  Widget,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
} from "./hooks";

export type Props = {
  alignSystem?: WidgetAlignSystemType;
  editing?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginProperty?: { [key: string]: any };
  pluginModalContainer?: HTMLElement | DocumentFragment;
  shownPluginModalInfo?: PluginModalInfo;
  showPluginModal?: (modalInfo?: PluginModalInfo) => void;
  pluginBaseUrl?: string;
  onWidgetUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
  overrideSceneProperty?: (pluginId: string, property: any) => void;
};

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  editing,
  sceneProperty,
  pluginProperty,
  pluginModalContainer,
  shownPluginModalInfo,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  layoutConstraint,
  showPluginModal,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });
  const isSmallWindow = useMedia("(max-width: 768px)");

  return (
    <WidetAlignSystemWrapper editorMode={editing}>
      <GridWrapper
        editing={editing}
        onMove={handleMove}
        onAlignChange={handleAlignmentChange}
        onExtend={handleExtend}>
        {isSmallWindow ? (
          <MobileZone
            zoneName="outer"
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginModalContainer={pluginModalContainer}
            shownPluginModalInfo={shownPluginModalInfo}
            showPluginModal={showPluginModal}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}>
            {alignSystem?.inner && (
              <ZoneComponent
                zoneName="inner"
                zone={alignSystem?.inner}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginModalContainer={pluginModalContainer}
                shownPluginModalInfo={shownPluginModalInfo}
                showPluginModal={showPluginModal}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
                layoutConstraint={layoutConstraint}
              />
            )}
          </MobileZone>
        ) : (
          <ZoneComponent
            zoneName="outer"
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginModalContainer={pluginModalContainer}
            shownPluginModalInfo={shownPluginModalInfo}
            showPluginModal={showPluginModal}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}>
            <ZoneComponent
              zoneName="inner"
              zone={alignSystem?.inner}
              sceneProperty={sceneProperty}
              pluginProperty={pluginProperty}
              pluginModalContainer={pluginModalContainer}
              shownPluginModalInfo={shownPluginModalInfo}
              showPluginModal={showPluginModal}
              pluginBaseUrl={pluginBaseUrl}
              isEditable={isEditable}
              isBuilt={isBuilt}
              layoutConstraint={layoutConstraint}
            />
          </ZoneComponent>
        )}
      </GridWrapper>
    </WidetAlignSystemWrapper>
  );
};

export default WidgetAlignSystem;

const WidetAlignSystemWrapper = styled.div<{ editorMode?: boolean }>`
  width: 100%;
  height: 100%;
  z-index: ${({ theme }) => theme.zIndexes.base};
  position: absolute;
  pointer-events: ${({ editorMode }) => (editorMode ? "auto" : "none")};
`;
