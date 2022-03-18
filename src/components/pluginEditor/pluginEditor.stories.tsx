import { Meta, Story } from "@storybook/react";
import React from "react";
import MonacoEditor from "react-monaco-editor";

import Component, { Props } from "@reearth/components/molecules/Visualizer";
import { styled } from "@reearth/theme";

import Icon from "../atoms/Icon";

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

export const Simple: Story<Props> = args => {
  const {
    sourceCode,
    widget,
    currentPosition,
    positions,
    mode,
    args2,
    infoboxSize,
    showAlignSystem,
    showInfobox,
    handleAlignSystemToggle,
    handleInfoboxToggle,
    openFile,
    handleAlignSystemUpdate,
    setSourceCode,
    setMode,
    setInfoboxSize,
  } = useHooks(args);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "stretch" }}>
      <Component {...args2} style={{ ...args2.style, width: "100%" }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          width: "55%",
        }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#171618",
            padding: "5px 15px",
          }}>
          <div id="title" style={{ flex: 1 }}>
            <h3>Plugin editor navigation</h3>
            <p>Upload your plugin</p>
            <input type="file" onChange={openFile}></input>
            <div
              id="save"
              style={{
                display: "flex",
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
          <div
            id="options"
            style={{ display: "flex", flexDirection: "column", flex: 1, margin: "4px 0" }}>
            <p>Options</p>
            <Button selected={showAlignSystem} onClick={handleAlignSystemToggle}>
              Widget Align System Positions
            </Button>
            <div
              style={{
                display: "flex",
                maxHeight: `${showAlignSystem ? "100px" : "0"}`,
                paddingBottom: `${showAlignSystem ? "2px" : "0"}`,
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
                  paddingBottom: `${showAlignSystem ? "2px" : "0"}`,
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
          <div
            style={{
              flex: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Icon icon="logo" />
          </div>
        </div>
        <MonacoEditor
          height="100%"
          language="typescript"
          value={sourceCode.body}
          onChange={value => {
            setSourceCode(sc => ({ ...sc, body: value }));
          }}
          theme={"vs-dark"}
          options={{
            bracketPairColorization: {
              enabled: true,
            },
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

Simple.args = {
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
  padding: 4px 6px;
  text-decoration: none;
  color: black;
  text-align: center;

  :hover {
    background: lightgrey;
  }
`;
