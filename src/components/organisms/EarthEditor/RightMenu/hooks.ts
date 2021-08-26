import { useCallback, useEffect, useState } from "react";
import { useSelected, useSelectedBlock, useIsCapturing } from "@reearth/state";

export type Tab = "layer" | "scene" | "widget" | "infobox" | "export";

export default () => {
  const [selected] = useSelected();
  const [selectedBlock, selectBlock] = useSelectedBlock();
  const [isCapturing] = useIsCapturing();

  const [selectedTab, setSelectedTab] = useState<Tab>();

  const reset = useCallback(
    (t: Tab) => {
      setSelectedTab(t);
      selectBlock(undefined);
    },
    [selectBlock],
  );

  useEffect(() => {
    setSelectedTab(selected?.type);
  }, [selected?.type, setSelectedTab]);

  useEffect(() => {
    if (!selectedBlock) return;
    setSelectedTab("infobox");
  }, [selectedBlock, setSelectedTab]);

  return {
    selectedTab,
    property: selected?.type,
    selectedLayerId: selected?.type === "layer" ? selected.layerId : undefined,
    isCapturing,
    selectedBlock,
    setSelectedTab,
    reset,
  };
};
