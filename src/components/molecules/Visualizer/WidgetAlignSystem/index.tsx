import React from "react";
import { GridWrapper, GridSection, GridArea, GridItem, useContext } from "reearth-realign";
// import W from "../Widget";
import useHooks, {
  WidgetAlignSystem as WidgetAlignSystemType,
  WidgetZone,
  WidgetArea,
  Location,
} from "./hooks";

export type WidgetAlignSystem = WidgetAlignSystemType;

type WidgetZoneProps = {
  zone: WidgetZone;
  innerZone?: WidgetZone;
  onReorder: () => void;
  onMove: (currentItem?: string, dropLocation?: Location, originalLocation?: Location) => void;
};

type WidgetAreaProps = {
  section: keyof WidgetZone;
  area: WidgetArea;
  onReorder: () => void;
  onMove: (
    currentItem?: string,
    dropLocation?: { section?: string; area?: string },
    originalLocation?: { section?: string; area?: string },
  ) => void;
};

type Props = {
  alignSystem: WidgetAlignSystemType;
};

const WidgetAreaComponent: React.FC<WidgetAreaProps> = ({ section, area, onReorder, onMove }) => (
  <GridArea
    key={area.position}
    vertical={area.position === "middle"}
    stretch={area.position === "middle"}
    reverse={area.position !== "middle" && section === "right"}
    end={section === "right" || area.position === "bottom"}
    align={area.position === "middle" ? area.align : undefined}
    location={{ section: section, area: area.position }}
    editorStyles={{
      background: area.position === "middle" ? "rgba(71, 112, 255, 0.5)" : "rgba(233, 85, 24, 0.5)",
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

const WidgetZoneComponent: React.FC<WidgetZoneProps> = ({ zone, innerZone, onReorder, onMove }) => (
  <>
    <GridSection>
      {zone.left.map(a => (
        <WidgetAreaComponent
          key={a.position}
          section="left"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
        />
      ))}
    </GridSection>
    <GridSection stretch>
      {zone.center.map(a =>
        innerZone && a.position === "middle" ? (
          <div
            key={a.position}
            style={{ height: "100%", display: "flex", justifyContent: "space-between" }}>
            <WidgetZoneComponent zone={innerZone} onReorder={onReorder} onMove={onMove} />
          </div>
        ) : a.position !== "middle" ? (
          <WidgetAreaComponent
            key={a.position}
            section="center"
            area={a}
            onReorder={onReorder}
            onMove={onMove}
          />
        ) : undefined,
      )}
    </GridSection>
    <GridSection>
      {zone.right.map(a => (
        <WidgetAreaComponent
          key={a.position}
          section="right"
          area={a}
          onReorder={onReorder}
          onMove={onMove}
        />
      ))}
    </GridSection>
  </>
);

const WidgetAlignSystem: React.FC<Props> = ({ alignSystem }) => {
  const { editorMode } = useContext();
  const { alignState, onReorder, onMove } = useHooks({ alignSystem });
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
          zone={alignState.outer}
          innerZone={alignState.inner}
          onReorder={onReorder}
          onMove={onMove}
        />
      </GridWrapper>
    </div>
  );
};

export default WidgetAlignSystem;
