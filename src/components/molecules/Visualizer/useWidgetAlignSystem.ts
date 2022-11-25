import { useEffect, useState, useCallback } from "react";

import type { WidgetLocationOptions } from "./Plugin/types";
import type {
  Widget,
  WidgetAlignSystem,
  WidgetSection,
  WidgetZone,
  WidgetArea,
} from "./WidgetAlignSystem";

export default ({ alignSystem }: { alignSystem: WidgetAlignSystem | undefined }) => {
  const [overriddenAlignSystem, setOverrideAlignSystem] = useState<WidgetAlignSystem | undefined>(
    alignSystem,
  );

  const moveWidget = useCallback((widgetId: string, options: WidgetLocationOptions) => {
    if (
      !widgetId ||
      !["outer", "inner"].includes(options.zone) ||
      !["left", "center", "right"].includes(options.section) ||
      !["top", "middle", "bottom"].includes(options.area) ||
      (options.section === "center" && options.area === "middle")
    )
      return;

    let tarWidget: Widget | undefined;

    setOverrideAlignSystem(alignSystem => {
      if (!alignSystem) return alignSystem;
      Object.keys(alignSystem).forEach(zoneName => {
        const zone = alignSystem[zoneName as keyof WidgetAlignSystem];
        if (zone) {
          Object.keys(zone).forEach(sectionName => {
            const section = zone[sectionName as keyof WidgetZone];
            if (section) {
              Object.keys(section).forEach(areaName => {
                const area = section[areaName as keyof WidgetSection];
                if (!tarWidget && area?.widgets) {
                  const tarIndex = area.widgets.findIndex(w => w.id === widgetId);
                  if (tarIndex !== -1) {
                    [tarWidget] = area.widgets.splice(tarIndex, 1);
                  }
                }
              });
            }
          });
        }
      });
      return { ...alignSystem };
    });

    setTimeout(() => {
      setOverrideAlignSystem(alignSystem => {
        if (!alignSystem || !tarWidget) return alignSystem;
        if (!alignSystem[options.zone]) {
          alignSystem[options.zone] = {
            left: undefined,
            center: undefined,
            right: undefined,
          };
        }

        const tarZone = alignSystem[options.zone] as WidgetZone;
        if (!tarZone[options.section]) {
          tarZone[options.section] = {
            top: undefined,
            middle: undefined,
            bottom: undefined,
          };
        }

        const tarSection = tarZone[options.section] as WidgetSection;
        if (!tarSection[options.area]) {
          tarSection[options.area] = {
            align: "start",
            widgets: [],
          };
        }

        const tarArea = tarSection[options.area] as WidgetArea;
        if (!tarArea.widgets) tarArea.widgets = [];
        if (options.method === "insert") {
          tarArea.widgets.unshift(tarWidget);
        } else {
          tarArea.widgets.push(tarWidget);
        }

        return { ...alignSystem };
      });
    }, 0);
  }, []);

  useEffect(() => {
    setOverrideAlignSystem(alignSystem);
  }, [alignSystem]);

  return {
    overriddenAlignSystem,
    moveWidget,
  };
};
