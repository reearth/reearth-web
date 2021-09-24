import { mapValues } from "lodash-es";
import { useState, useMemo, useEffect } from "react";

import { Primitive, Widget, Block } from "@reearth/components/molecules/Visualizer";
import {
  WidgetAlignSystem,
  WidgetZone,
  WidgetSection,
  WidgetArea,
  Alignments,
} from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";
import {
  Maybe,
  WidgetAlignSystem as WidgetAlignSystemType,
  WidgetSection as WidgetSectionType,
  WidgetArea as WidgetAreaType,
  WidgetZone as WidgetZoneType,
} from "@reearth/gql";

import { PublishedData } from "./types";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const sceneProperty = processProperty(data?.property);

  const layers = useMemo<Primitive[] | undefined>(
    () =>
      data?.layers?.map<Primitive>(l => ({
        id: l.id,
        title: l.name || "",
        pluginId: l.pluginId,
        extensionId: l.extensionId,
        isVisible: true,
        property: processProperty(l.property),
        pluginProperty: processProperty(data.plugins?.[l.pluginId]?.property),
        infobox: l.infobox
          ? {
              property: processProperty(l.infobox.property),
              blocks: l.infobox.fields.map<Block>(f => ({
                id: f.id,
                pluginId: f.pluginId,
                extensionId: f.extensionId,
                property: processProperty(f.property),
                pluginProperty: processProperty(data.plugins?.[f.pluginId]?.property),
                // propertyId is not required in non-editable mode
              })),
            }
          : undefined,
      })),
    [data],
  );

  const widgetSystem = useMemo<
    { floatWidgets: Widget[]; alignSystem: WidgetAlignSystem } | undefined
  >(() => {
    if (!data || !data.widgets || !data.widgetAlignSystem) return undefined;

    const widgets = data?.widgets?.map<Widget>(w => ({
      id: w.id,
      pluginId: w.pluginId,
      extensionId: w.extensionId,
      property: processProperty(w.property),
      enabled: true,
      floating: w.floating,
      extended: w.extended,
      extendable: w.extendable
        ? {
            vertically: w.extendable.vertically as boolean,
            horizontally: w.extendable.horizontally as boolean,
          }
        : undefined,
      pluginProperty: processProperty(data.plugins?.[w.pluginId]?.property),
    }));

    const filterWidgets = (widgets: Widget[], layout: WidgetAlignSystemType): WidgetAlignSystem => {
      const handleWidgetZone = (zone?: Maybe<WidgetZoneType>): WidgetZone => {
        return {
          left: handleWidgetSection(zone?.left),
          center: handleWidgetSection(zone?.center),
          right: handleWidgetSection(zone?.right),
        };
      };

      const handleWidgetSection = (section?: Maybe<WidgetSectionType>): WidgetSection | [] => {
        return [
          handleWidgetArea("top", section?.top),
          handleWidgetArea("middle", section?.middle),
          handleWidgetArea("bottom", section?.bottom),
        ];
      };

      const handleWidgetArea = (position: string, area?: Maybe<WidgetAreaType>): WidgetArea => {
        return {
          position,
          align: area?.align.toLowerCase() as Alignments,
          widgets: area?.widgetIds.map(w => widgets.find(w2 => w === w2.id)),
        };
      };

      return {
        outer: handleWidgetZone(layout.outer),
        inner: handleWidgetZone(layout.inner),
      };
    };

    return {
      floatWidgets: widgets.filter(w => w.floating === true),
      alignSystem: filterWidgets(widgets, data.widgetAlignSystem),
    };
  }, [data]);

  const actualAlias = useMemo(
    () => alias || new URLSearchParams(window.location.search).get("alias") || undefined,
    [alias],
  );

  useEffect(() => {
    const url = dataUrl(actualAlias);
    (async () => {
      try {
        const res = await fetch(url, {});
        if (res.status >= 300) {
          setError(true);
          return;
        }
        const d = (await res.json()) as PublishedData | undefined;
        if (d?.schemaVersion !== 1) {
          // TODO: not supported version
          return;
        }

        // For compability: map tiles are not shown by default
        if (
          new Date(d.publishedAt) < new Date(2021, 0, 13, 18, 20, 0) &&
          (!d?.property?.tiles || d.property.tiles.length === 0)
        ) {
          d.property = {
            ...d.property,
            tiles: [{ id: "___default_tile___" }],
          };
        }

        setData(d);
      } catch (e) {
        // TODO: display error for users
        console.error(e);
      } finally {
        setReady(true);
      }
    })();
  }, [actualAlias]);

  return {
    alias: actualAlias,
    sceneProperty,
    layers,
    widgets: widgetSystem,
    ready,
    error,
  };
};

function processProperty(p: any): any {
  if (typeof p !== "object") return p;
  return mapValues(p, g =>
    Array.isArray(g) ? g.map(h => processPropertyGroup(h)) : processPropertyGroup(g),
  );
}

function processPropertyGroup(g: any): any {
  if (typeof g !== "object") return g;
  return mapValues(g, v => {
    // For compability
    if (Array.isArray(v)) {
      return v.map(vv =>
        typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v
          ? { ...vv, height: vv.altitude }
          : vv,
      );
    }
    if (typeof v === "object" && v && "lat" in v && "lng" in v && "altitude" in v) {
      return {
        ...v,
        height: v.altitude,
      };
    }
    return v;
  });
}

function dataUrl(alias?: string): string {
  if (alias && window.REEARTH_CONFIG?.api) {
    return `${window.REEARTH_CONFIG.api}/published_data/${alias}`;
  }
  return "data.json";
}
