import React, { useState, useEffect } from "react";
import { GridWrapper, GridSection, GridArea, GridItem } from "react-align";

import { styled, useTheme } from "@reearth/theme";

import W from "../Widget";

import useHooks, {
  WidgetAlignSystem as WidgetAlignSystemType,
  WidgetZone,
  WidgetArea,
  Location as LocationType,
  WidgetLayout as WidgetLayoutType,
  Alignments as AlignmentsType,
} from "./hooks";

export type WidgetAlignSystem = WidgetAlignSystemType;
export type WidgetLayout = WidgetLayoutType;
export type Location = LocationType;
export type Alignments = AlignmentsType;

type WidgetZoneProps = {
  zoneName: string;
  zone: WidgetZone;
  innerZone?: WidgetZone;
  onReorder: (id?: string, hoverIndex?: number) => void;
  onMove: (currentItem?: string, dropLocation?: Location, originalLocation?: Location) => void;
  onAlignChange: (location?: Location | undefined, align?: AlignmentsType | undefined) => void;
  onExtend: (currentItem?: string, extended?: boolean) => void;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
};

type WidgetAreaProps = {
  zone: string;
  section: string;
  area: WidgetArea;
  onReorder: (id?: string, hoverIndex?: number) => void;
  onMove: (currentItem?: string, dropLocation?: Location, originalLocation?: Location) => void;
  onAlignChange: (location?: Location | undefined, align?: AlignmentsType | undefined) => void;
  onExtend: (currentItem?: string, extended?: boolean) => void;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
};

type Props = {
  alignSystem: WidgetAlignSystemType;
  enabled?: boolean;
  onWidgetUpdate?: (
    id: string,
    location?: Location,
    extended?: boolean,
    index?: number,
  ) => Promise<void>;
  onWidgetAlignSystemUpdate?: (location?: Location, align?: Alignments) => Promise<void>;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
};

const WidgetAreaComponent: React.FC<WidgetAreaProps> = ({
  zone,
  section,
  area,
  onReorder,
  onMove,
  onAlignChange,
  onExtend,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
}) => {
  const [align, setAlign] = useState(area.align ?? "start");
  const theme = useTheme();

  useEffect(() => {
    if (!area.align) return;
    setAlign(area.align);
  }, [area]);

  useEffect(() => {
    onAlignChange({ zone, section, area: area.position }, align);
  }, [align, zone, section, area, onAlignChange]);

  return (
    <GridArea
      key={area.position}
      vertical={area.position === "middle"}
      stretch={area.position === "middle"}
      reverse={area.position !== "middle" && section === "right"}
      end={section === "right" || area.position === "bottom"}
      align={
        (area.position === "middle" || section === "center") &&
        area.widgets &&
        area.widgets.length > 0
          ? align
          : undefined
      }
      setAlign={setAlign}
      location={{ zone: zone, section: section, area: area.position }}
      editorStyles={{
        background:
          area.position === "middle" ? theme.alignSystem.blueBg : theme.alignSystem.orangeBg,
        border:
          area.position === "middle"
            ? `1px solid ${theme.alignSystem.blueHighlight}`
            : `1px solid ${theme.alignSystem.orangeHighlight}`,
      }}
      iconColor={area.position === "middle" ? "#4770FF" : "#E95518"}>
      {area.widgets?.map((widget, i) => (
        <GridItem
          key={widget?.id + "container"}
          id={widget?.id as string}
          index={i}
          onReorder={(id, _L, _CI, hoverIndex) => onReorder(id, hoverIndex)}
          onMoveArea={onMove}
          extended={
            ((widget?.extendable?.horizontally && section === "center") ||
              (widget?.extendable?.vertically && area.position === "middle")) &&
            widget?.extended
          }
          extendable={
            (widget?.extendable?.horizontally && section === "center") ||
            (widget?.extendable?.vertically && area.position === "middle")
          }
          onExtend={onExtend}
          styles={{ pointerEvents: "auto" }}>
          <W
            key={widget?.id}
            widget={widget}
            extendable={
              (widget?.extendable?.horizontally && section === "center") ||
              (widget?.extendable?.vertically && area.position === "middle")
            }
            sceneProperty={sceneProperty}
            pluginProperty={widget?.pluginProperty}
            isEditable={isEditable}
            isBuilt={isBuilt}
            pluginBaseUrl={pluginBaseUrl}
          />
        </GridItem>
      ))}
    </GridArea>
  );
};

const WidgetZoneComponent: React.FC<WidgetZoneProps> = ({
  zoneName,
  zone,
  innerZone,
  onReorder,
  onMove,
  onAlignChange,
  onExtend,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
}) => (
  <>
    <GridSection>
      {zone.left.map((a: WidgetArea) => (
        <WidgetAreaComponent
          key={a.position}
          zone={zoneName}
          section="left"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
          onExtend={onExtend}
          sceneProperty={sceneProperty}
          pluginBaseUrl={pluginBaseUrl}
          isEditable={isEditable}
          isBuilt={isBuilt}
        />
      ))}
    </GridSection>
    <GridSection stretch>
      {zone.center.map((a: WidgetArea) =>
        innerZone && a.position === "middle" ? (
          <div key={a.position} style={{ display: "flex", flex: "1 0 auto" }}>
            <WidgetZoneComponent
              zoneName="inner"
              zone={innerZone}
              onReorder={onReorder}
              onMove={onMove}
              onAlignChange={onAlignChange}
              onExtend={onExtend}
              sceneProperty={sceneProperty}
              pluginBaseUrl={pluginBaseUrl}
              isEditable={isEditable}
              isBuilt={isBuilt}
            />
          </div>
        ) : a.position !== "middle" ? (
          <WidgetAreaComponent
            key={a.position}
            zone={zoneName}
            section="center"
            area={a}
            onReorder={onReorder}
            onMove={onMove}
            onAlignChange={onAlignChange}
            onExtend={onExtend}
            sceneProperty={sceneProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
          />
        ) : undefined,
      )}
    </GridSection>
    <GridSection>
      {zone.right.map((a: WidgetArea) => (
        <WidgetAreaComponent
          key={a.position}
          zone={zoneName}
          section="right"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
          onExtend={onExtend}
          sceneProperty={sceneProperty}
          pluginBaseUrl={pluginBaseUrl}
          isEditable={isEditable}
          isBuilt={isBuilt}
        />
      ))}
    </GridSection>
  </>
);

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  enabled,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
}) => {
  const { alignState, onReorder, onMove, onAlignChange, onExtend } = useHooks({
    alignSystem,
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });

  return (
    <WidetAlignSystemWrapper editorMode={enabled}>
      <GridWrapper enabled={enabled}>
        <WidgetZoneComponent
          zoneName="outer"
          zone={alignState.outer}
          innerZone={alignState.inner}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
          onExtend={onExtend}
          sceneProperty={sceneProperty}
          pluginBaseUrl={pluginBaseUrl}
          isEditable={isEditable}
          isBuilt={isBuilt}
        />
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
