import React, { PropsWithChildren, useState } from "react";
import { GridSection } from "react-align";

import Slide from "@reearth/components/atoms/Slide";
import { styled } from "@reearth/theme";

import Area from "./Area";
import type { WidgetZone, WidgetLayoutConstraint } from "./hooks";

export type Props = {
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginProperty?: { [key: string]: any };
  pluginBaseUrl?: string;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function MobileZone({
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  children,
}: PropsWithChildren<Props>) {
  const [pos, setPos] = useState(1);
  return (
    <>
      <StyledSlide pos={pos}>
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
                  sceneProperty={sceneProperty}
                  pluginProperty={pluginProperty}
                  pluginBaseUrl={pluginBaseUrl}
                  isEditable={isEditable}
                  isBuilt={isBuilt}
                />
              ),
            )}
          </GridSection>
        ))}
      </StyledSlide>
      <div onClick={() => alert("hello")} style={{ background: "blue", height: "20px" }}>
        Hello
      </div>
      <Controls
        onClick={() => {
          setPos(pos <= 2 ? pos + 1 : 0);
          console.log("je;p");
        }}>
        <Control />
      </Controls>
    </>
  );
}

const StyledSlide = styled(Slide)`
  height: calc(100% - 20px);
`;

const Controls = styled.div`
  height: 40px;
  width: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: green;
  }
`;

const Control = styled.div`
  background: red;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
`;
