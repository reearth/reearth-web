import React from "react";
import { GridWrapper } from "react-align";

import { styled } from "@reearth/theme";

import useHooks from "./hooks";
import MobileZone from "./MobileZone";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
  Theme,
  WidgetComponent,
} from "./types";
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
  Theme,
  WidgetComponent,
  WidgetProps,
} from "./types";

export type Props = {
  alignSystem?: WidgetAlignSystemType;
  editing?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isMobile?: boolean;
  theme?: Theme;
  widgetComponent?: WidgetComponent;
  onWidgetUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
};

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  editing,
  isMobile,
  layoutConstraint,
  theme,
  widgetComponent,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });
  const Zone = isMobile ? MobileZone : ZoneComponent;

  return (
    <WidetAlignSystemWrapper editorMode={editing}>
      <GridWrapper
        editing={editing}
        onMove={handleMove}
        onAlignChange={handleAlignmentChange}
        onExtend={handleExtend}>
        <Zone
          zoneName="outer"
          zone={alignSystem?.outer}
          layoutConstraint={layoutConstraint}
          theme={theme}
          widgetComponent={widgetComponent}>
          {(!isMobile || alignSystem?.inner) && (
            <ZoneComponent
              zoneName="inner"
              zone={alignSystem?.inner}
              layoutConstraint={layoutConstraint}
              widgetComponent={widgetComponent}
            />
          )}
        </Zone>
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
