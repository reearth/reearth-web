import { useState } from "react";

import type {
  Widget,
  //   WidgetZone,
  //   WidgetSection,
  //   WidgetArea,
  //   Alignment,
} from "@reearth/components/molecules/Visualizer";

export type Props = {
  widgets?: Widget[];
};

export default ({ widgets }: Props) => {
  console.log(widgets, "widgets");
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
  const [showAlignSystem, setShowAlignSystem] = useState(false);
  const [showInfobox, setShowInfobox] = useState(false);
  const [infoboxSize, setInfoboxSize] = useState<"small" | "medium" | "large">("small");

  //   const buildAlignSystem = useMemo(() => {
  //   }, []);

  return {
    sourceCode,
    setSourceCode,
    mode,
    setMode,
    showAlignSystem,
    setShowAlignSystem,
    showInfobox,
    setShowInfobox,
    infoboxSize,
    setInfoboxSize,
  };
};
