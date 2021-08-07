import React, { useState } from "react";
import { useEffect } from "react";
import { GridWrapper, GridSection, GridArea, GridItem, useContext } from "reearth-realign";
// import W from "../Widget";
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
  onReorder: () => void;
  onMove: (currentItem?: string, dropLocation?: Location) => void;
  onAlignChange: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
};

type WidgetAreaProps = {
  zone: string;
  section: keyof WidgetZone;
  area: WidgetArea;
  onReorder: () => void;
  onMove: (currentItem?: string, dropLocation?: Location) => void;
  onAlignChange: (currentItem?: string | undefined, align?: Alignments | undefined) => void;
};

type Props = {
  alignSystem: WidgetAlignSystemType;
  onWidgetUpdate: (
    id: string,
    extended?: boolean | undefined,
    index?: number | undefined,
    align?: Alignments | undefined,
    location?: Location,
  ) => Promise<void>;
};

const WidgetAreaComponent: React.FC<WidgetAreaProps> = ({
  zone,
  section,
  area,
  onReorder,
  onMove,
  onAlignChange,
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
      {area.widgets?.map((widget, i) => (
        <GridItem
          key={widget?.id}
          id={widget?.id as string}
          index={i}
          onReorder={onReorder}
          onMoveArea={onMove}>
          <p>Hello</p>
          {/* <W
              key={widget.id}
              widget={widget}
              sceneProperty={sceneProperty}
              pluginProperty={widget.pluginProperty}
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              pluginBaseUrl={pluginBaseUrl}
            /> */}
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
}) => (
  <>
    <GridSection>
      {zone.left.map(a => (
        <WidgetAreaComponent
          key={a.position}
          zone={zoneName}
          section="left"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
        />
      ))}
    </GridSection>
    <GridSection stretch>
      {zone.center.map(a =>
        innerZone && a.position === "middle" ? (
          <div
            key={a.position}
            style={{ height: "100%", display: "flex", justifyContent: "space-between" }}>
            <WidgetZoneComponent
              zoneName="inner"
              zone={innerZone}
              onReorder={onReorder}
              onMove={onMove}
              onAlignChange={onAlignChange}
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
          />
        ) : undefined,
      )}
    </GridSection>
    <GridSection>
      {zone.right.map(a => (
        <WidgetAreaComponent
          key={a.position}
          zone={zoneName}
          section="right"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
        />
      ))}
    </GridSection>
  </>
);

const WidgetAlignSystem: React.FC<Props> = ({ alignSystem, onWidgetUpdate }) => {
  const { editorMode } = useContext();
  const { alignState, onReorder, onMove, onAlignChange } = useHooks({
    alignSystem,
    onWidgetUpdate,
  });
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        zIndex: 1,
        position: "absolute",
        pointerEvents: `${editorMode ? "auto" : "none"}`,
      }}>
      <GridWrapper>
        <WidgetZoneComponent
          zoneName="outer"
          zone={alignState.outer}
          innerZone={alignState.inner}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onAlignChange}
        />
      </GridWrapper>
    </div>
  );
};

export default WidgetAlignSystem;
