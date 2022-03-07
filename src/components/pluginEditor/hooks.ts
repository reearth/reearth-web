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
    console.log("hello", reearth.block);
    reearth.ui.show("<style>body { margin: 0; background: #fff; }</style><h1>Hello2 World</h1>", { visible: true });
    `.trim(),
  });
  const [mode, setMode] = useState("widget");
  const [showAlignSystem, setShowAlignSystem] = useState(false);
  const [showInfobox, setShowInfobox] = useState(false);

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
  };
};
