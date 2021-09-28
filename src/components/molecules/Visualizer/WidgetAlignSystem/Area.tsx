import { set } from "lodash";
import React, { useCallback } from "react";
import { GridArea, GridItem } from "react-align";

import { useTheme } from "@reearth/theme";

import W from "../Widget";

import type { Widget, Alignment, Location, WidgetLayoutConstraint } from "./hooks";

type Props = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
  align: Alignment;
  widgets?: Widget[];
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginProperty?: { [key: string]: any };
  pluginBaseUrl?: string;
  layoutConstraint?: { [w in string]: WidgetLayoutConstraint };
  onReorder?: (id: string, location: Location, hoverIndex: number, originalIndex: number) => void;
  onMove?: (currentItem: string, dropLocation: Location, originalLocation: Location) => void;
  onAlignChange?: (location: Location, align: Alignment) => void;
  onExtend?: (currentItem: string, extended: boolean) => void;
};

const nop = () => {};

const locations: {
  [zone in "inner" | "outer"]: {
    [section in "left" | "center" | "right"]: {
      [area in "top" | "middle" | "bottom"]: {
        zone: "inner" | "outer";
        section: "left" | "center" | "right";
        area: "top" | "middle" | "bottom";
      };
    };
  };
} = {} as any;
for (const z of ["inner", "outer"] as const) {
  for (const s of ["left", "center", "right"] as const) {
    for (const a of ["top", "middle", "bottom"] as const) {
      set(locations, [z, s, a], { zone: z, section: s, area: a });
    }
  }
}

export default function WidgetAreaComponent({
  zone,
  section,
  area,
  align,
  widgets,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  layoutConstraint,
  onReorder,
  onMove,
  onAlignChange,
  onExtend,
}: Props) {
  const theme = useTheme();

  const handleAlignChange = useCallback(
    (align: Alignment) => {
      onAlignChange?.({ zone, section, area }, align);
    },
    [area, onAlignChange, section, zone],
  );

  const loc = locations[zone][section][area];

  return !(zone === "inner" && section === "center" && area === "middle") ? (
    <GridArea<Location>
      key={area}
      vertical={area === "middle"}
      stretch={area === "middle"}
      reverse={area !== "middle" && section === "right"}
      end={section === "right" || area === "bottom"}
      align={(area === "middle" || section === "center") && widgets?.length ? align : undefined}
      onAlignChange={handleAlignChange}
      location={loc}
      editorStyles={{
        background: area === "middle" ? theme.alignSystem.blueBg : theme.alignSystem.orangeBg,
        border:
          area === "middle"
            ? `1px solid ${theme.alignSystem.blueHighlight}`
            : `1px solid ${theme.alignSystem.orangeHighlight}`,
      }}
      iconColor={area === "middle" ? "#4770FF" : "#E95518"}>
      {widgets?.map((widget, i) => {
        const constraint =
          widget.pluginId && widget.extensionId
            ? layoutConstraint?.[`${widget.pluginId}/${widget.extensionId}`]
            : undefined;
        const extendable =
          (section === "center" && constraint?.extendable?.horizontally) ||
          (area === "middle" && constraint?.extendable?.vertically);
        return (
          <GridItem
            key={widget.id}
            id={widget.id}
            location={loc}
            index={i}
            onReorder={onReorder || nop}
            onMoveArea={onMove || nop}
            extended={widget.extended}
            extendable={extendable}
            onExtend={onExtend}
            styles={{ pointerEvents: "auto" }}>
            <W
              widget={widget}
              sceneProperty={sceneProperty}
              pluginProperty={
                widget.pluginId && widget.extensionId
                  ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                  : undefined
              }
              isEditable={isEditable}
              isBuilt={isBuilt}
              pluginBaseUrl={pluginBaseUrl}
              widgetLayout={{
                location: loc,
                align,
              }}
            />
          </GridItem>
        );
      })}
    </GridArea>
  ) : null;
}
