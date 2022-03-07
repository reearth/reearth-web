import { Meta, Story } from "@storybook/react";
import React, { useMemo, useState } from "react";

import Component, { LayerStore, Props } from "@reearth/components/molecules/Visualizer";
import type { WidgetAlignSystem } from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";

import useHooks from "./hooks";

export default {
  title: "Plugin Editor",
  component: Component,
  argTypes: {
    onBlockChange: { action: "onBlockChange" },
    onBlockDelete: { action: "onBlockDelete" },
    onBlockMove: { action: "onBlockMove" },
    onBlockInsert: { action: "onBlockInsert" },
    onBlockSelect: { action: "onBlockSelect" },
  },
  parameters: { actions: { argTypesRegex: "^on.*" } },
} as Meta;

const Template: Story<Props> = args => <Component {...args} />;
const Default = Template.bind({});
Default.args = {
  engine: "cesium",
  rootLayerId: "root",
  //   widgets: { alignSystem: AlignSystem },
  sceneProperty: {
    tiles: [{ id: "default", tile_type: "default" }],
  },
  selectedLayerId: undefined,
  selectedBlockId: undefined,
  ready: true,
  isEditable: true,
  isBuilt: false,
  small: false,
};

export const Plugin: Story<Props> = args => {
  const {
    sourceCode,
    setSourceCode,
    mode,
    setMode,
    showAlignSystem,
    setShowAlignSystem,
    showInfobox,
    setShowInfobox,
  } = useHooks({});

  // const [alignSystem, setAlignSystem] = useState<WidgetAlignSystem | undefined>({
  const [alignSystem] = useState<WidgetAlignSystem | undefined>({
    inner: {
      left: {
        top: {
          align: "start",
          widgets: [],
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
      center: {
        top: {
          widgets: [],
          align: "start",
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
      right: {
        top: {
          widgets: [],
          align: "start",
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
    },
    outer: {
      left: {
        top: {
          widgets: [],
          align: "start",
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
      center: {
        top: {
          widgets: [],
          align: "start",
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
      right: {
        top: {
          widgets: [],
          align: "start",
        },
        middle: {
          widgets: [],
          align: "start",
        },
        bottom: {
          widgets: [],
          align: "start",
        },
      },
    },
  });

  const handleAlignSystemToggle = () => {
    setShowAlignSystem(!showAlignSystem);
  };

  const handleInfoboxToggle = () => {
    setShowInfobox(!showInfobox);
  };

  const openFile = async e => {
    e.preventDefault();
    const [file] = e.target.files;
    const reader = new FileReader();

    reader.onload = async e2 => {
      console.log(e2, "e");
      const text = e2?.target?.result;
      setSourceCode({ fileName: file.name, body: text as string });
    };
    reader.readAsText(e.target.files[0]);
  };

  const args2 = useMemo<Props>(() => {
    return {
      ...args,
      widgets: {
        ...(mode === "widget"
          ? {
              alignSystem: {
                ...alignSystem,
                outer: {
                  ...alignSystem?.outer,
                  left: {
                    top: {
                      align: "start",
                      widgets: [
                        {
                          id: "xxx",
                          // extended: true,
                          __REEARTH_SOURCECODE: sourceCode.body,
                        },
                      ],
                    },
                  },
                },
              },
            }
          : {}),
      },
      layers: new LayerStore({
        id: "",
        children: [
          {
            id: "pluginprimitive",
            pluginId: "reearth",
            extensionId: "marker",
            isVisible: true,
            property: {
              default: {
                location: { lat: 0, lng: 139 },
                height: 0,
              },
            },
            infobox: showInfobox
              ? {
                  blocks: [
                    ...(mode === "block"
                      ? [
                          {
                            id: "xxx",
                            __REEARTH_SOURCECODE: sourceCode.body,
                          } as any,
                        ]
                      : []),
                    {
                      id: "yyy",
                      pluginId: "plugins",
                      extensionId: "block",
                      property: {
                        location: { lat: 0, lng: 139 },
                      },
                    },
                  ],
                }
              : undefined,
          },
          ...(mode === "primitive"
            ? [
                {
                  id: "xxx",
                  __REEARTH_SOURCECODE: sourceCode.body,
                  isVisible: true,
                  property: {
                    location: { lat: 0, lng: 130 },
                  },
                } as any,
              ]
            : []),
        ],
      }),
    };
  }, [args, mode, alignSystem, sourceCode, showInfobox]);

  const textarea = document.querySelector("textarea");

  console.log(args2.widgets?.alignSystem, "args2");

  textarea?.addEventListener("keydown", e => {
    if (e.keyCode === 9) {
      e.preventDefault();
      textarea.setRangeText("  ", textarea.selectionStart, textarea.selectionStart, "end");
    }
  });

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "stretch" }}>
      <Component
        {...args2}
        widgetAlignEditorActivated={showAlignSystem}
        style={{ ...args2.style, flex: "1" }}
      />
      <div
        style={{
          flex: "1 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "#fff",
        }}>
        <div
          style={{
            background: "black",
            padding: "5px",
          }}>
          <p>Plugin editor navigation</p>
          <p>-------------------------------------</p>
          <p>Upload your plugin</p>
          <input type="file" onChange={openFile}></input>
          <div style={{ display: "flex", flexDirection: "column", margin: "4px 0" }}>
            <button
              style={{
                background: "lightgrey",
                borderRadius: "3px",
                margin: "2px 0",
                padding: "2px",
              }}
              onClick={handleAlignSystemToggle}>
              Toggle Widget Align System
            </button>
            <button
              style={{
                background: "lightgrey",
                borderRadius: "3px",
                margin: "2px 0",
                padding: "2px",
              }}
              onClick={handleInfoboxToggle}>
              Toggle Infobox
            </button>
            <div>
              <p>Change extension type</p>
              <select
                value={mode}
                onChange={e => setMode(e.currentTarget.value as "block" | "widget" | "primitive")}>
                <option value="block">Block</option>
                <option value="widget">Widget</option>
                {/* <option value="primitive">Primitive</option> */}
              </select>
            </div>
            <p>-------------------------------------</p>
            <a
              style={{
                background: "lightgrey",
                borderRadius: "3px",
                margin: "2px 0",
                padding: "2px",
                textDecoration: "none",
                color: "black",
                textAlign: "center",
              }}
              href={`data:application/javascript;charset=utf-8,${sourceCode.body}`}
              download={sourceCode.fileName}>
              Save {sourceCode.fileName}
            </a>
          </div>
        </div>
        <textarea
          id="pluginSourceCode"
          style={{ flex: "auto" }}
          value={sourceCode.body}
          onChange={e => setSourceCode(s => ({ ...s, body: e.currentTarget.value }))}
        />
      </div>
    </div>
  );
};

Plugin.args = {
  ...Default.args,
  selectedLayerId: "pluginprimitive",
  pluginBaseUrl: process.env.PUBLIC_URL,
};
