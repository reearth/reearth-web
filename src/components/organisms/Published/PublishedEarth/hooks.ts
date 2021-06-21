import { useState, useMemo, useEffect, useCallback } from "react";
import ReactGA from "react-ga";

import { Primitive, Widget, Block } from "@reearth/components/molecules/Visualizer";
import { PublishedData } from "./types";

export default (alias?: string) => {
  const [data, setData] = useState<PublishedData>();
  const [ready, setReady] = useState(false);
  const [selectedLayerId, changeSelectedLayerId] = useState<string>();
  const [infoBoxVisible, setInfoBoxVisible] = useState(true);

  const selectLayer = useCallback((id?: string) => {
    changeSelectedLayerId(id);
  }, []);

  const googleAnalyticsData: { enableGA?: boolean; trackingId?: string } = useMemo(
    () => ({
      enableGA: data?.property.googleAnalytics?.enableGA,
      trackingId: data?.property.googleAnalytics?.trackingId,
    }),
    [data?.property.googleAnalytics?.enableGA, data?.property.googleAnalytics?.trackingId],
  );

  useEffect(() => {
    if (!googleAnalyticsData.enableGA || !googleAnalyticsData.trackingId) return;
    ReactGA.initialize(googleAnalyticsData.trackingId);
    ReactGA.pageview(window.location.pathname);
  }, [googleAnalyticsData]);

  const layers = useMemo<Primitive[] | undefined>(
    () =>
      data?.layers.map(l => ({
        id: l.id,
        title: l.name || "",
        plugin: `${l.pluginId}/${l.extensionId}`,
        isVisible: true,
        property: l.property,
        infobox: l.infobox
          ? {
              property: l.infobox.property,
              blocks: l.infobox.fields.map<Block>(f => ({
                id: f.id,
                plugin: `${f.pluginId}/${f.extensionId}`,
                property: f.property,
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
      })),
    [data],
  );

  const selectedLayer = useMemo(
    () => (selectedLayerId ? layers?.find(l => l.id === selectedLayerId) : undefined),
    [layers, selectedLayerId],
  );

  useEffect(() => {
    setInfoBoxVisible(!!selectedLayerId);
  }, [selectedLayerId]);

  useEffect(() => {
    const url = "/data.json";
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
    selectLayer,
    layers,
    widgets,
    selectedLayer,
    infoBoxVisible,
    ready,
  };
};
