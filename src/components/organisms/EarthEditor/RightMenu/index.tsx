import React from "react";
import { useIntl } from "react-intl";

import TabArea from "@reearth/components/atoms/TabArea";
import ExportPane from "@reearth/components/organisms/EarthEditor/ExportPane";
import PropertyPane from "../PropertyPane";
import useHooks from "./hooks";

const layerMode = ["property", "infobox", "export"];
const widgetMode = ["property"];
const sceneMode = ["property"];
export type LayerMode = typeof layerMode[number];
export type WidgetMode = typeof widgetMode[number];
export type SceneMode = typeof sceneMode[number];
export type Mode = LayerMode | WidgetMode | SceneMode;

// TODO: ErrorBoudaryでエラーハンドリング

const RightMenu: React.FC = () => {
  const { isCapturing, selectedLayerId, selectedBlock, selectedTab, property, reset } = useHooks();

  const intl = useIntl();
  const layerLabel = intl.formatMessage({ defaultMessage: "Layer" });
  const widgetLabel = intl.formatMessage({ defaultMessage: "Widget" });
  const sceneLabel = intl.formatMessage({ defaultMessage: "Scene" });
  const labels = {
    ...(property
      ? {
          [property]:
            property === "layer" ? layerLabel : property === "widget" ? widgetLabel : sceneLabel,
        }
      : {}),
    infobox: intl.formatMessage({ defaultMessage: "Infobox" }),
    export: intl.formatMessage({ defaultMessage: "Export" }),
  };

  return (
    <TabArea<"layer" | "widget" | "scene" | "infobox" | "export">
      menuAlignment="top"
      selected={
        selectedBlock || selectedTab === "infobox"
          ? "infobox"
          : selectedTab === "export"
          ? "export"
          : property
      }
      disabled={isCapturing}
      labels={labels}
      onlyIcon
      onChange={reset}
      scrollable>
      {{
        ...(property
          ? {
              [property]: (
                <>
                  {property === "layer" ? (
                    // レイヤー自体のProperty
                    <PropertyPane mode="layer" />
                  ) : property === "widget" ? (
                    <PropertyPane mode="widget" />
                  ) : (
                    // Scene全体のProperty
                    <PropertyPane mode="scene" />
                  )}
                </>
              ),
            }
          : {}),
        infobox: property === "layer" && selectedLayerId && (
          <>
            {/* Infoboxの選択中のフィールドのProperty */}
            <PropertyPane mode="block" />
            {/* Infobox自体のProperty */}
            <PropertyPane mode="infobox" />
          </>
        ),
        export: property === "layer" && selectedLayerId && (
          <>
            <ExportPane />
          </>
        ),
      }}
    </TabArea>
  );
};

export default RightMenu;
