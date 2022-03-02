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
  onCreateAsset,
  selectAsset,
  selectedAssets,
  onRemove,
  sort,
  handleSortChange,
  handleSearchTerm,
  smallCardOnly,
}: {
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (files: FileList) => void;
  selectAsset?: (assets: Asset[]) => void;
  selectedAssets?: Asset[];
  onRemove?: (assetIds: string[]) => void;
  sort?: { type?: SortType | null; reverse?: boolean };
  handleSortChange: (type?: string, reverse?: boolean) => void;
  handleSearchTerm: (term?: string | undefined) => void;
  smallCardOnly?: boolean;
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
    handleSortChange?.(undefined, !sort?.reverse);
  }, [handleSortChange, sort?.reverse]);

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
        handleSearchTerm(undefined);
      } else {
        handleSearchTerm(term);
      }
    },
    [handleSearchTerm],
  );

  return {
    layoutType,
    setLayoutType,
    iconChoice,
    handleAssetsSelect,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    deleteModalVisible,
    setDeleteModalVisible,
    handleRemove,
  };
};
