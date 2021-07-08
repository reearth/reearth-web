import { useState, useMemo, useEffect } from "react";
import ReactGA from "react-ga";

import { Primitive, Widget, Block } from "@reearth/components/molecules/Visualizer";
import { PublishedData } from "./types";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!data?.property.googleAnalytics?.enableGA || !data?.property.googleAnalytics?.trackingId)
      return;
    ReactGA.initialize(data.property.googleAnalytics.trackingId);
    ReactGA.pageview(window.location.pathname);
  }, [data?.property.googleAnalytics?.enableGA, data?.property.googleAnalytics.trackingId]);

  const layers = useMemo<Primitive[] | undefined>(
    () =>
      data?.layers.map<Primitive>(l => ({
        id: l.id,
        title: l.name || "",
        plugin: `${l.pluginId}/${l.extensionId}`,
        isVisible: true,
        property: l.property,
        pluginProperty: data.plugins.find(p => p.id === l.pluginId)?.property,
        infobox: l.infobox
          ? {
              property: l.infobox.property,
              blocks: l.infobox.fields.map<Block>(f => ({
                id: f.id,
                pluginId: f.pluginId,
                extensionId: f.extensionId,
                property: f.property,
                pluginProperty: data.plugins.find(p => p.id === f.pluginId)?.property,
                // propertyId is not required
              })),
            }
          : undefined,
      })),
    [data],
  );

  const widgets = useMemo<Widget[] | undefined>(
    () =>
      data?.widgets.map<Widget>(w => ({
        id: `${data.id}/${w.pluginId}/${w.extensionId}`,
        pluginId: w.pluginId,
        extensionId: w.extensionId,
        property: w.property,
        enabled: true,
        pluginProperty: data.plugins.find(p => p.id === w.pluginId)?.property,
      })),
    [data],
  );

  useEffect(() => {
    const url = "data.json";
    (async () => {
      try {
        const d = (await fetch(url, {}).then(r => r.json())) as PublishedData | undefined;
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
  }, [alias]);

  return {
    sceneProperty: data?.property,
    layers,
    widgets,
    ready,
  };
};
