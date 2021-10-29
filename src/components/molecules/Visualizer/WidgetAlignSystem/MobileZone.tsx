import React, { PropsWithChildren, useState } from "react";
import { GridSection } from "react-align";

import Slide from "@reearth/components/atoms/Slide";
import { styled, css } from "@reearth/theme";

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
  const [pos, setPos] = useState(2);
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
      <Controls
        onClick={() => {
          setPos(pos < 3 ? pos + 1 : 1);
          console.log("je;p");
        }}>
        <Control />
        <Control page={1} current={pos === 1} />
        <Control page={2} current={pos === 2} />
        <Control page={3} current={pos === 3} />
        <Control />
      </Controls>
    </>
  );
}

const StyledSlide = styled(Slide)`
  height: calc(100% - 20px);
`;

const Controls = styled.div`
  position: absolute;
  bottom: 0;
  height: 20px;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`;

const Control = styled.div<{ page?: number; current?: boolean }>`
  ${({ page, theme }) =>
    page &&
    css`
      border: 1px solid ${theme.main.strongText};
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin: 0 6px;
    `}
  background: ${({ current, theme }) => current && theme.main.strongText};
  cursor: pointer;
  transition: all 0.2s ease-in-out 0.1s;
`;
