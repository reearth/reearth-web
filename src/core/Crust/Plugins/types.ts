import { PropsWithChildren, RefObject } from "react";

import { Tag } from "@reearth/core/mantle/compat/types";
import { ComputedLayer } from "@reearth/core/Map";
import { LayerSelectionReason } from "@reearth/core/Map/Layers";
import { Viewport } from "@reearth/core/Visualizer/useViewport";

import { MapRef } from "../types";
import { Widget, WidgetAlignSystem } from "../Widgets";

import { CommonReearth } from "./api";
import { ClientStorage } from "./useClientStorage";
import { PluginInstances } from "./usePluginInstances";

export type Props = PropsWithChildren<{
  engineName?: string;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: any;
  inEditor?: boolean;
  tags?: Tag[];
  selectedLayer?: ComputedLayer;
  layerSelectionReason?: LayerSelectionReason;
  viewport?: Viewport;
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: Widget[];
  overrideSceneProperty: (id: string, property: any) => void;
}>;

export type Context = {
  reearth: CommonReearth;
  pluginInstances: PluginInstances;
  clientStorage: ClientStorage;
  overrideSceneProperty: (id: string, property: any) => void;
};
