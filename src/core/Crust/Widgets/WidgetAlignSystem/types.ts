import { ComponentType } from "react";
import { Alignment } from "react-align";

import type { Widget as RawWidget, WidgetAlignment, WidgetLocation } from "../types";

export type { Alignment } from "react-align";

export type { Theme, Widget as RawWidget, WidgetAlignment, WidgetLocation } from "../types";

export type Widget = Omit<RawWidget, "layout" | "extended"> & { extended?: boolean };

export type Location = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetArea = {
  align: Alignment;
  widgets?: Widget[];
};

export type WidgetSection = {
  top?: WidgetArea;
  middle?: WidgetArea;
  bottom?: WidgetArea;
};

export type WidgetZone = {
  left?: WidgetSection;
  center?: WidgetSection;
  right?: WidgetSection;
};

export type WidgetAlignSystem = {
  outer?: WidgetZone;
  inner?: WidgetZone;
};

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type WidgetLayoutConstraint = {
  extendable?: {
    horizontally?: boolean;
    vertically?: boolean;
  };
};

export type WidgetProps = {
  widget: Widget;
  layout: WidgetLayout;
  extended: boolean;
  editing: boolean;
  onExtend: (id: string, extended: boolean | undefined) => void;
};

export type WidgetComponent = ComponentType<WidgetProps>;
