import { ReactNode } from "react";
import { GridSection } from "react-align";

import Area from "./Area";
import type { WidgetZone, WidgetLayoutConstraint, WidgetComponent } from "./types";

export type Props = {
  children?: ReactNode;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  widgetComponent?: WidgetComponent;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function Zone({
  zone,
  zoneName,
  layoutConstraint,
  children,
  widgetComponent,
}: Props) {
  return (
    <>
      {sections.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {areas.map(a =>
            s === "center" && children && a === "middle" ? (
              <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                {children}
              </div>
            ) : (
              <Area
                key={a}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone?.[s]?.[a]?.widgets}
                align={zone?.[s]?.[a]?.align ?? "start"}
                layoutConstraint={layoutConstraint}
                widgetComponent={widgetComponent}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}
