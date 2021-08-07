import { useCallback, useState } from "react";
import { Widget as WidgetType } from "../Widget";
// Move types
export type Location = {
  zone?: string;
  section?: string;
  area?: string;
};

export type Alignment = "start" | "centered" | "end";

export type WidgetArea = {
  position: "top" | "middle" | "bottom";
  align?: Alignment;
  widgets?: (Widget | undefined)[];
};

export type WidgetSection = WidgetArea[] | [];

export type WidgetZone = {
  left: WidgetSection;
  center: WidgetSection;
  right: WidgetSection;
};

export type WidgetAlignSystem = {
  outer: WidgetZone;
  inner: WidgetZone;
};

export type Widget = WidgetType & {
  pluginProperty?: any;
};

export default function ({ alignSystem }: { alignSystem: WidgetAlignSystem }) {
  const [alignState, setAlignState] = useState(alignSystem);
  // Reorder
  const onReorder = useCallback(() => {
    console.log("reorder");
    // Below is to avoid warning on git commit only
    setAlignState(alignSystem);
  }, []);
  // Move
  const onMove = useCallback(
    (
      currentItem?: string,
      dropLocation?: { zone?: string; section?: string; area?: string },
      originalLocation?: { zone?: string; section?: string; area?: string },
    ) => {
      console.log(currentItem);
      console.log(dropLocation);
      console.log(originalLocation);
    },
    [],
  );

  return {
    alignState,
    onReorder,
    onMove,
  };
}
