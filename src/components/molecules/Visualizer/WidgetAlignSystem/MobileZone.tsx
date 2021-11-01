import React, { PropsWithChildren, useState, useMemo } from "react";
import { GridSection } from "react-align";
import tinycolor from "tinycolor2";

import Slide from "@reearth/components/atoms/Slide";
import { styled, usePublishTheme, PublishTheme } from "@reearth/theme";

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
  const filteredSections = useMemo(() => {
    return sections.filter(s => !!zone?.[s]);
  }, [zone]);

  const [pos, setPos] = useState(filteredSections.indexOf("center"));
  const publishedTheme = usePublishTheme(sceneProperty.theme);

  return (
    <>
      <StyledSlide pos={pos} filteredSections={filteredSections.length > 1}>
        {filteredSections.map(s => (
          <GridSection key={s} stretch>
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
                  wrapContent
                />
              ),
            )}
          </GridSection>
        ))}
      </StyledSlide>
      {filteredSections.length > 1 ? (
        <Controls publishedTheme={publishedTheme}>
          <Control onClick={() => setPos(pos > 0 ? pos - 1 : 2)} />
          {filteredSections.map((_, i) => (
            <Control key={i} onClick={() => setPos(i)}>
              <PageIcon current={pos === i} publishedTheme={publishedTheme} />
            </Control>
          ))}
          <Control onClick={() => setPos(pos < filteredSections.length - 1 ? pos + 1 : 0)} />
        </Controls>
      ) : null}
    </>
  );
}

const StyledSlide = styled(Slide)<{ filteredSections?: boolean }>`
  height: calc(100% ${({ filteredSections }) => filteredSections && "- 32px"});
`;

const Controls = styled.div<{ publishedTheme: PublishTheme }>`
  position: absolute;
  bottom: 0;
  height: 32px;
  width: 100%;
  background: ${({ publishedTheme }) => publishedTheme.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Control = styled.div<{ children?: React.ReactNode }>`
  height: 100%;
  ${({ children }) => !children && "flex: 1;"}
  display: flex;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  padding: 0 8px;
  transition: all 0.2s ease-in-out 0.1s;
`;

const PageIcon = styled.div<{ current?: boolean; publishedTheme?: PublishTheme }>`
  border: 1px solid
    ${({ theme, publishedTheme }) =>
      tinycolor(publishedTheme?.background).isDark() ? theme.other.white : theme.other.black};
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ current, theme, publishedTheme }) =>
    current
      ? tinycolor(publishedTheme?.background).isDark()
        ? theme.other.white
        : theme.other.black
      : null};
`;
