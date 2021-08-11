import React, { useState, CSSProperties } from "react";
import { useEffect } from "react";
import { GridWrapper, GridSection, GridArea, GridItem, useContext } from "reearth-realign";
import W from "../Widget";
import { styled } from "@reearth/theme";
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
  onAlignChange: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
  onExtend: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
  styles?: CSSProperties;
};

type WidgetAreaProps = {
  zone: string;
  section: keyof WidgetZone;
  area: WidgetArea;
  onReorder: (id?: string, hoverIndex?: number) => void;
  onMove: (currentItem?: string, dropLocation?: Location, originalLocation?: Location) => void;
  onAlignChange: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
  onExtend: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginBaseUrl?: string;
};

type Props = {
  alignSystem: WidgetAlignSystemType;
  onWidgetUpdate?: (
    id: string,
    extended?: boolean | undefined,
    index?: number | undefined,
    align?: Alignments | undefined,
    location?: Location,
  ) => Promise<void>;
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

  useEffect(() => {
    if (!area.align) return;
    setAlign(area.align);
  }, [area]);

  useEffect(() => {
    if (!area.widgets?.[0]) return;
    onAlignChange(area.widgets[0].id, align);
  }, [align, area, onAlignChange]);

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
          area.position === "middle" ? "rgba(71, 112, 255, 0.5)" : "rgba(233, 85, 24, 0.5)",
        border: area.position === "middle" ? "1px solid #4770FF" : "1px solid #E95518",
      }}
      iconColor={area.position === "middle" ? "#4770FF" : "#E95518"}>
      {area.widgets?.map(
        (widget, i) =>
          widget && (
            <GridItem
              key={widget.id}
              id={widget.id as string}
              index={i}
              onReorder={(id, _L, _CI, hoverIndex) => onReorder(id, hoverIndex)}
              onMoveArea={onMove}
              extended={widget.extended}
              extendable={widget.extendable}
              onExtend={onExtend}
              styles={{ pointerEvents: "auto" }}>
              <W
                key={widget.id}
                widget={widget}
                sceneProperty={sceneProperty}
                pluginProperty={widget.pluginProperty}
                isEditable={isEditable}
                isBuilt={isBuilt}
                pluginBaseUrl={pluginBaseUrl}
              />
            </GridItem>
          ),
      )}
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
  styles,
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
              styles={styles}
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
  onWidgetUpdate,
  sceneProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
}) => {
  const { editorMode } = useContext();
  const { alignState, onReorder, onMove, onAlignChange, onExtend } = useHooks({
    alignSystem,
    onWidgetUpdate,
  });

  return (
    <WidetAlignSystemWrapper editorMode={editorMode}>
      <GridWrapper>
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
          styles={{ background: "red" }}
        />
      </GridWrapper>
    </WidetAlignSystemWrapper>
  );
};

export default WidgetAlignSystem;

const WidetAlignSystemWrapper = styled.div<{ editorMode?: boolean }>`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: absolute;
  pointer-events: ${({ editorMode }) => (editorMode ? "auto" : "none")};
`;
