import { omit } from "lodash-es";
import React, { useCallback, useMemo, useState } from "react";
import { GridArea, GridItem } from "react-align";
import { useDeepCompareEffect } from "react-use";

import { useTheme } from "@reearth/theme";

import W from "../Widget";

import type { Widget, Alignment, WidgetLayoutConstraint, Location } from "./hooks";

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
  wrapContent?: boolean;
};

export default function WidgetAreaComponent({
  zone,
  section,
  area,
  align,
  widgets,
  pluginProperty,
  layoutConstraint,
  wrapContent,
  ...props
}: Props) {
  const theme = useTheme();
  const layout = useMemo(
    () => ({
      location: { zone, section, area },
      align,
    }),
    [align, area, section, zone],
  );

  const [overriddenExtended, overrideExtend] = useState<{ [id in string]?: boolean }>({});
  const handleExtend = useCallback((id: string, extended: boolean | undefined) => {
    overrideExtend(oe =>
      oe[id] === extended
        ? oe
        : {
            ...omit(oe, id),
            ...(typeof extended === "undefined" ? {} : { [id]: extended }),
          },
    );
  }, []);
  const widgetIds = widgets?.map(w => w.id) ?? [];
  useDeepCompareEffect(() => {
    overrideExtend(oe =>
      Object.fromEntries(Object.entries(oe).filter(e => widgetIds.includes(e[0]))),
    );
  }, [widgetIds]);

  return !(zone === "inner" && section === "center" && area === "middle") ? (
    <GridArea
      key={area}
      id={`${zone}/${section}/${area}`}
      vertical={area === "middle"}
      stretch={area === "middle"}
      // reverse={area !== "middle" && section === "right"}
      end={section === "right" || area === "bottom"}
      align={(area === "middle" || section === "center") && widgets?.length ? align : undefined}
      style={{ flexWrap: wrapContent ? "wrap" : undefined }}
      editorStyle={{
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
        const extended = extendable ? overriddenExtended[widget.id] : undefined;
        return (
          <GridItem
            key={widget.id}
            id={widget.id}
            index={i}
            extended={extended ?? widget.extended}
            extendable={extendable}
            style={{ pointerEvents: "auto" }}>
            {({ editing }) => (
              <W
                widget={widget}
                pluginProperty={
                  widget.pluginId && widget.extensionId
                    ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                    : undefined
                }
                layout={layout}
                extended={extended}
                editing={editing}
                onExtend={handleExtend}
                {...props}
              />
            )}
          </GridItem>
        );
      })}
    </GridArea>
  ) : null;
}

export function getLocationFromId(id: string): Location | undefined {
  const [z, s, a] = id.split("/");
  return (z === "inner" || z === "outer") &&
    (s === "left" || s === "center" || s === "right") &&
    (a === "top" || a === "middle" || a === "bottom")
    ? {
        zone: z,
        section: s,
        area: a,
      }
    : undefined;
}
