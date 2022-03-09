import { useState, useCallback } from "react";
import useFileInput from "use-file-input";

export type SortType = "DATE" | "NAME" | "SIZE";

export type LayoutTypes = "medium" | "small" | "list";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export default ({
  isMultipleSelectable,
  accept,
  selectedAssets,
  sort,
  smallCardOnly,
  onCreateAsset,
  selectAsset,
  onRemove,
  onSortChange,
  onSearch,
}: {
  isMultipleSelectable?: boolean;
  accept?: string;
  selectedAssets?: Asset[];
  sort?: { type?: SortType | null; reverse?: boolean };
  smallCardOnly?: boolean;
  onCreateAsset?: (files: FileList) => void;
  selectAsset?: (assets: Asset[]) => void;
  onRemove?: (assetIds: string[]) => void;
  onSortChange?: (type?: string, reverse?: boolean) => void;
  onSearch?: (term?: string | undefined) => void;
}) => {
  const [layoutType, setLayoutType] = useState<LayoutTypes>(smallCardOnly ? "small" : "medium");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const iconChoice =
    sort?.type === "NAME"
      ? sort?.reverse
        ? "filterNameReverse"
        : "filterName"
      : sort?.type === "SIZE"
      ? sort?.reverse
        ? "filterSizeReverse"
        : "filterSize"
      : sort?.reverse
      ? "filterTimeReverse"
      : "filterTime";

  const handleAssetsSelect = (asset: Asset) => {
    selectedAssets?.includes(asset)
      ? selectAsset?.(selectedAssets?.filter(a => a !== asset))
      : selectAsset?.(
          isMultipleSelectable && selectedAssets ? [...selectedAssets, asset] : [asset],
        );
  };

  const handleFileSelect = useFileInput(files => onCreateAsset?.(files), {
    accept,
    multiple: isMultipleSelectable,
  });

  const handleUploadToAsset = useCallback(() => {
    handleFileSelect();
  }, [handleFileSelect]);

  const handleReverse = useCallback(() => {
    onSortChange?.(undefined, !sort?.reverse);
  }, [onSortChange, sort?.reverse]);

  const handleRemove = useCallback(() => {
    if (selectedAssets?.length) {
      onRemove?.(selectedAssets.map(a => a.id));
      selectAsset?.([]);
      setDeleteModalVisible(false);
    }
  }, [onRemove, selectAsset, selectedAssets]);

  const handleSearch = useCallback(
    (term?: string) => {
      if (!term || term.length < 1) {
        onSearch?.(undefined);
      } else {
        onSearch?.(term);
      }
    },
    [onSearch],
  );

  return {
    layoutType,
    iconChoice,
    deleteModalVisible,
    setLayoutType,
    handleAssetsSelect,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    setDeleteModalVisible,
    handleRemove,
  };
};
