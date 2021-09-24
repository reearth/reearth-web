import type { SceneProperty } from "@reearth/components/molecules/Visualizer";
import { WidgetAlignSystem } from "@reearth/gql";

export type PublishedData = {
  schemaVersion: number;
  id: string;
  publishedAt: string;
  property?: SceneProperty;
  plugins?: Record<string, Plugin>;
  layers?: Layer[];
  widgets?: Widget[];
  widgetAlignSystem?: WidgetAlignSystem;
};

export type Plugin = {
  id: string;
  property: any;
};

export type Layer = {
  id: string;
  name?: string;
  pluginId: string;
  extensionId: string;
  property: any;
  infobox?: {
    fields: Block[];
    property: any;
  } | null;
};

export type Block = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: any;
};

export type Widget = {
  id: string;
  pluginId: string;
  extensionId: string;
  property: any;
  extended?: boolean;
  extendable?:
    | {
        vertically?: boolean | undefined;
        horizontally?: boolean | undefined;
      }
    | undefined;
  floating?: boolean;
};
