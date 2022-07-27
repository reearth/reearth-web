import { useCallback } from "react";

// import { withTheme } from "styled-components";
import { styled } from "@reearth/theme";

import Plugin, { Widget as RawWidget, Props as PluginProps } from "../Plugin";

export type Widget = Omit<RawWidget, "layout" | "extended"> & { extended?: boolean };

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  //   widget: Widget;
  //   extended?: boolean;
  open?: boolean;
  sourceCode?: string;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  editing?: boolean;
  onExtend?: (id: string, extended: boolean | undefined) => void;
};

export type ComponentProps<PP = any, SP = any> = Omit<Props<PP, SP>, "widget"> & {
  widget: RawWidget;
};

export default function PluginModal<PP = any, SP = any>({
  //   widget,
  // sourceCode,
  open,
  pluginBaseUrl,
  onExtend,
  // editing,
  ...props
}: Props<PP, SP>) {
  const id = "modal";
  // const w = useMemo<RawWidget | undefined>(
  //   () => ({
  //     ...widget,
  //     extended: {
  //       horizontally: actualExtended && horizontal,
  //       vertically: actualExtended && vertical,
  //     },
  //     layout: align && location ? { align, location } : undefined,
  //   }),
  //   [widget, actualExtended, horizontal, vertical, align, location],
  // );

  const handleRender = useCallback<NonNullable<PluginProps["onRender"]>>(
    options => {
      onExtend?.(id, options?.extended);
    },
    [id, onExtend],
  );
  const handleResize = useCallback<NonNullable<PluginProps["onResize"]>>(
    (_width, _height, extended) => {
      onExtend?.(id, extended);
    },
    [id, onExtend],
  );

  const sC = `
  const html = \`
    <html>
      <style>
      html{
          margin: 0;
          width: 400px;
        }
        body{
          color: white;
          margin: 0;
          padding: 2px;
        }
        #main {
          border: 1px solid black;
          border-radius: 15px;
          background: green;
          // padding: 5px;
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          // width: 100%;
          // height: 100%;
          }
        #top {
          width: 100%;
          display: flex;
          justify-content: right;
          padding: 0;
        }
      </style>
      <body>
        <div id="main">
          <div id="top">
            <p style="margin: 0; padding: 3px 6px 0 0">x</p>
          </div>
          <h1>Hello, さよなら</h1>
          <h5>I am a plugin modal</h5>
          
        </div>
      </body>
    </html>
    \`
    console.log(reearth, "reearth")
    reearth.ui.show(html);
    `;

  return (
    <Wrapper open={open}>
      <Plugin
        autoResize={"both"} // MAYBE/PROBABLY REMOVE
        sourceCode={sC}
        // extensionType="widget" //Set to Modal??
        visible
        pluginBaseUrl={pluginBaseUrl}
        property={props.pluginProperty}
        iFrameProps={{ style: { pointerEvents: "auto" } }}
        onRender={handleRender}
        onResize={handleResize}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div<{ open?: boolean }>`
  position: absolute;
  top: 15%;
  z-index: ${({ theme }) => theme.zIndexes.fullScreenModal};
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  // background: red;

  display: ${({ open }) => (open ? "flex" : "none")};
  justify-content: center;
  pointer-events: none;
`;
