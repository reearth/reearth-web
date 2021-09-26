import type { SceneProperty } from "@reearth/components/molecules/Visualizer";

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

export type WidgetAlignSystem = {
  inner: WidgetZone;
  outer: WidgetZone;
};

export type WidgetZone = {
  left: WidgetSection;
  center: WidgetSection;
  right: WidgetSection;
};

export type WidgetSection = {
  top: WidgetArea;
  middle: WidgetArea;
  bottom: WidgetArea;
};

export type WidgetArea = {
  widgetIds: string[];
  align: WidgetAlignment;
};

export type WidgetAlignment = "start" | "centered" | "end";
