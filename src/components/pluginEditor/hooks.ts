import { useState } from "react";

import type {
  Widget,
  WidgetAlignSystem,
  WidgetZone,
  WidgetSection,
} from "@reearth/components/molecules/Visualizer";

export type Position = { section: string; area: string };

export default () => {
  const [sourceCode, setSourceCode] = useState<{ fileName?: string; body: string }>({
    fileName: "untitled",
    body: `
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
    `.trim(),
  });
  const [mode, setMode] = useState("widget");
  const [showInfobox, setShowInfobox] = useState(false);
  const [infoboxSize, setInfoboxSize] = useState<"small" | "medium" | "large">("small");
  const [showAlignSystem, setShowAlignSystem] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position>({
    section: "left",
    area: "top",
  });
  const [alignSystem, setAlignSystem] = useState<WidgetAlignSystem | undefined>();

  const positions: { [key: string]: Position }[] = [
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

  const handleAlignSystemUpdate = (widget: Widget, newLoc: Position) => {
    setAlignSystem(() => {
      const alignment =
        newLoc.section === "center" || newLoc.area === "middle" ? "centered" : "start";
      const newSection: WidgetSection = {
        top: {
          widgets: newLoc.area === "top" ? [widget] : undefined,
          align: alignment,
        },
        middle: {
          widgets: newLoc.area === "middle" ? [widget] : undefined,
          align: alignment,
        },
        bottom: {
          widgets: newLoc.area === "bottom" ? [widget] : undefined,
          align: alignment,
        },
      };

      const newZone: WidgetZone = {
        left: {
          ...(newLoc.section === "left" ? newSection : undefined),
        },
        center: {
          ...(newLoc.section === "center" ? newSection : undefined),
        },
        right: {
          ...(newLoc.section === "right" ? newSection : undefined),
        },
      };
      setCurrentPosition(newLoc);
      return { outer: newZone };
    });
  };

  return {
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
  };
};
