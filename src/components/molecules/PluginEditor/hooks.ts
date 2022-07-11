import fileDownload from "js-file-download";
import { useState, useMemo, useCallback } from "react";
import useFileInput from "use-file-input";

import type { WidgetZone, WidgetSection, Layer } from "@reearth/components/molecules/Visualizer";

export type Position = { section: string; area: string };

const originalSourceCode = `
reearth.ui.show(
  \`<style>
      body {
        margin: 0;
      }
      #wrapper {
        background: #232226;
        height: 100%;
        color: white;
        border: 3px dotted red;
        border-radius: 5px;
        padding: 20px 0;
      }
  </style>
  <div id="wrapper">
    <h2 style="text-align: center; margin: 0;">Hello2 World</h2>
  </div>
  \`
, { visible: true });
`.trim();

const defaultPosition = {
  section: "left",
  area: "top",
};

const originalFileName = "untitled.js";

export default () => {
  const [mode, setMode] = useState("widget");
  const [showInfobox, setShowInfobox] = useState(false);
  const [infoboxSize, setInfoboxSize] = useState<"small" | "medium" | "large">("small");
  const [showAlignSystem, setShowAlignSystem] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<Position>(defaultPosition);
  const [executableSourceCode, setExecutableSourceCode] = useState(originalSourceCode);
  const [fileName, setFileName] = useState(originalFileName);
  const [sourceCode, setSourceCode] = useState(originalSourceCode);

  const rootLayer: Layer<any, any> = useMemo(
    () => ({
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
                    title: "Cool info",
                    bgcolor: "#56051fff",
                    size: infoboxSize,
                  },
                },
                blocks: [
                  ...(mode === "block"
                    ? [
                        {
                          id: "xxx",
                          __REEARTH_SOURCECODE: executableSourceCode,
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
      ],
    }),
    [infoboxSize, mode, showInfobox, executableSourceCode],
  );

  const widgets = useMemo(() => {
    if (!showAlignSystem) return {};

    const widget =
      mode === "widget"
        ? [
            {
              id: "xxx",
              // extended: true,
              __REEARTH_SOURCECODE: executableSourceCode,
            },
          ]
        : [];
    const alignment =
      currentPosition.section === "center" || currentPosition.area === "middle"
        ? "centered"
        : "start";
    const newSection: WidgetSection = {
      top: {
        widgets: currentPosition.area === "top" ? widget : undefined,
        align: alignment,
      },
      middle: {
        widgets: currentPosition.area === "middle" ? widget : undefined,
        align: alignment,
      },
      bottom: {
        widgets: currentPosition.area === "bottom" ? widget : undefined,
        align: alignment,
      },
    };

    const newZone: WidgetZone = {
      left: {
        ...(currentPosition.section === "left" ? newSection : undefined),
      },
      center: {
        ...(currentPosition.section === "center" ? newSection : undefined),
      },
      right: {
        ...(currentPosition.section === "right" ? newSection : undefined),
      },
    };
    return { alignSystem: { outer: newZone } };
  }, [currentPosition.area, currentPosition.section, executableSourceCode, mode, showAlignSystem]);

  const handleRun = useCallback(() => {
    setExecutableSourceCode(sourceCode);
  }, [setExecutableSourceCode, sourceCode]);

  const handleDownload = (body?: string, filename?: string) => {
    if (!body) return;
    fileDownload(body, filename ?? "untitled.js");
  };

  const handleAlignSystemToggle = useCallback(() => {
    setShowAlignSystem(s => !s);
  }, []);

  const handleInfoboxToggle = () => {
    setShowInfobox(!showInfobox);
  };

  const handleOpen = useFileInput(files => {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async e2 => {
      const body = e2?.target?.result;
      if (typeof body != "string") return;
      setFileName(file.name);
      setSourceCode(body);
    };
    reader.readAsText(file);
  });

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset?")) {
      setSourceCode(originalSourceCode);
      setFileName(originalFileName);
      setCurrentPosition(defaultPosition);
      handleRun();
    }
  }, [setCurrentPosition, handleRun]);

  return {
    sourceCode: executableSourceCode,
    fileName,
    rootLayer,
    currentPosition,
    mode,
    widgets,
    infoboxSize,
    showAlignSystem,
    showInfobox,
    setSourceCode,
    setMode,
    setInfoboxSize,
    handleOpen,
    handleDownload,
    handleReset,
    handleAlignSystemToggle,
    setCurrentPosition,
    handleInfoboxToggle,
    handleRun,
  };
};

export const positions: { [key: string]: Position }[] = [
  {
    LeftTop: { section: "left", area: "top" },
    LeftMiddle: { section: "left", area: "middle" },
    LeftBottom: { section: "left", area: "bottom" },
  },
  {
    CenterTop: { section: "center", area: "top" },
    CenterBottom: { section: "center", area: "bottom" },
  },
  {
    RightTop: { section: "right", area: "top" },
    RightMiddle: { section: "right", area: "middle" },
    RightBottom: { section: "right", area: "bottom" },
  },
];
