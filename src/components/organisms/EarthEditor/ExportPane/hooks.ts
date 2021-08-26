import { useCallback } from "react";

import { useSelected } from "@reearth/state";
import { useAuth } from "@reearth/auth";
import { Format } from "@reearth/components/molecules/EarthEditor/ExportPane";

const ext: { [key in Format]: string } = {
  kml: "kml",
  geojson: "geojson",
  czml: "czml",
  shape: "shp",
};

export default () => {
  const { getAccessToken } = useAuth();
  const [selected] = useSelected();

  const onExport = useCallback(
    async (format: Format) => {
      if (selected?.type !== "layer" || !window.REEARTH_CONFIG?.api) return;

      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const filename = `${selected.layerId}.${ext[format]}`;
      const type =
        format === "kml"
          ? "application/xml"
          : ["geojson", "czml"].includes(format)
          ? "application/json"
          : "application/octet-stream";

      const res = await fetch(`${window.REEARTH_CONFIG.api}/layers/${filename}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const download = document.createElement("a");
      download.download = filename;
      download.href = URL.createObjectURL(await res.blob());
      download.dataset.downloadurl = [type, download.download, download.href].join(":");
      download.click();
    },
    [getAccessToken, selected],
  );

  return { selectedLayer: selected?.type === "layer" ? selected.layerId : undefined, onExport };
};
