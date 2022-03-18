import { Meta, Story } from "@storybook/react";
import React, { useMemo, ChangeEvent, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";

import Component, { LayerStore, Props } from "@reearth/components/molecules/Visualizer";
// import type { WidgetAlignSystem } from "@reearth/components/molecules/Visualizer/WidgetAlignSystem/hooks";
import { styled } from "@reearth/theme";

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
    mode,
    showAlignSystem,
    showInfobox,
    infoboxSize,
    alignSystem,
    positions,
    currentPosition,
    handleAlignSystemUpdate,
    setSourceCode,
    setMode,
    setShowAlignSystem,
    setShowInfobox,
    setInfoboxSize,
  } = useHooks();

  const handleAlignSystemToggle = () => {
    setShowAlignSystem(!showAlignSystem);
  };

  const handleInfoboxToggle = () => {
    setShowInfobox(!showInfobox);
  };

  const openFile = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async e2 => {
      const text = e2?.target?.result;
      setSourceCode({ fileName: file.name, body: text as string });
    };
    reader.readAsText(file);
  };

  const widget = useMemo(() => {
    return {
      id: "xxx",
      // extended: true,
      __REEARTH_SOURCECODE: sourceCode.body,
    };
  }, [sourceCode.body]);

  const args2 = useMemo<Props>(() => {
    return {
      ...args,
      widgets: {
        ...(mode === "widget"
          ? {
              alignSystem: alignSystem,
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
                  property: {
                    default: {
                      title: "alskdfjlsadf",
                      bgcolor: "#56051fff",
                      size: infoboxSize,
                    },
                  },
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
  }, [args, mode, alignSystem, sourceCode, showInfobox, infoboxSize]);

  useEffect(() => {
    handleAlignSystemUpdate(widget, currentPosition);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "stretch" }}>
      <Component {...args2} style={{ ...args2.style, width: "100%" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "75%",
        }}>
        <div
          style={{
            display: "flex",
            background: "#171618",
            padding: "5px 15px",
          }}>
          <div id="title">
            <h3>Plugin editor navigation</h3>
            <p>Upload your plugin</p>
            <input type="file" onChange={openFile}></input>
            <div
              id="save"
              style={{
                display: "flex",
                // justifyContent: "center",
                width: "100%",
                margin: "20px 0",
              }}>
              <SaveButton
                href={`data:application/javascript;charset=utf-8,${sourceCode.body}`}
                download={sourceCode.fileName}>
                Save {sourceCode.fileName}
              </SaveButton>
            </div>
          </div>
          <div id="options" style={{ display: "flex", flexDirection: "column", margin: "4px 0" }}>
            <p>Options</p>
            <Button selected={showAlignSystem} onClick={handleAlignSystemToggle}>
              Widget Align System Positions
            </Button>
            <div
              style={{
                display: "flex",
                maxHeight: `${showAlignSystem ? "100px" : "0"}`,
                marginBottom: `${showAlignSystem ? "2px" : "0"}`,
                overflow: "hidden",
                transition: "all 1s",
                borderBottom: `${showAlignSystem ? "1px solid white" : "none"}`,
              }}>
              {positions.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}>
                  {Object.keys(p).map(k => (
                    <Button
                      key={k}
                      selected={
                        currentPosition.section === p[k].section &&
                        currentPosition.area === p[k].area
                      }
                      onClick={() =>
                        handleAlignSystemUpdate(widget, {
                          section: p[k].section,
                          area: p[k].area,
                        })
                      }>
                      {k}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: "4px 0" }}>
              <Button selected={showInfobox} onClick={handleInfoboxToggle}>
                Toggle Infobox
              </Button>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: `${showInfobox ? "100px" : "0"}`,
                  marginBottom: `${showInfobox ? "2px" : "0"}`,
                  overflow: "hidden",
                  transition: "all 1s",
                  borderBottom: `${showInfobox ? "1px solid white" : "none"}`,
                }}>
                <Button selected={infoboxSize === "small"} onClick={() => setInfoboxSize("small")}>
                  Small
                </Button>
                <Button
                  selected={infoboxSize === "medium"}
                  onClick={() => setInfoboxSize("medium")}>
                  Medium
                </Button>
                <Button selected={infoboxSize === "large"} onClick={() => setInfoboxSize("large")}>
                  Large
                </Button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}>
              <p>Extension type</p>
              <select
                value={mode}
                onChange={e => setMode(e.currentTarget.value as "block" | "widget" | "primitive")}>
                <option value="block">Block</option>
                <option value="widget">Widget</option>
                {/* <option value="primitive">Primitive</option> */}
              </select>
            </div>
          </div>
        </div>
        <MonacoEditor
          width="100%"
          height="100%"
          language="typescript"
          value={sourceCode.body}
          onChange={value => setSourceCode(sc => ({ ...sc, body: value }))}
          theme={"vs-dark"}
          options={{
            automaticLayout: true,
            minimap: {
              enabled: false,
            },
          }}
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

const Button = styled.button<{ selected?: boolean }>`
  background: ${({ selected }) => (selected ? "#3B3CD0" : "white")};
  color: ${({ selected }) => (selected ? "white" : "black")};
  border-radius: 3px;
  margin: 2px;
  padding: 2px;

  :hover {
    background: lightgrey;
  }
`;

const SaveButton = styled.a`
  background: white;
  border-radius: 3px;
  // margin: 2px auto;
  padding: 4px 6px;
  text-decoration: none;
  color: black;
  text-align: center;

  :hover {
    background: lightgrey;
  }
`;
