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
  assets,
  isMultipleSelectable,
  accept,
  onCreateAsset,
  selectAsset,
  selectedAssets,
  onRemove,
  sort,
  handleSortChange,
  // searchTerm,
  // handleSearchTerm,
  smallCardOnly,
}: {
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (files: FileList) => void;
  selectAsset?: (assets: Asset[]) => void;
  selectedAssets?: Asset[];
  onRemove?: (assetIds: string[]) => void;
  sort?: { type?: SortType | null; reverse?: boolean };
  handleSortChange: (type?: string, reverse?: boolean) => void;
  searchTerm?: string;
  handleSearchTerm: (term?: string | undefined) => void;
  smallCardOnly?: boolean;
}) => {
  const [layoutType, setLayoutType] = useState<LayoutTypes>(smallCardOnly ? "small" : "medium");
  const [searchResults, setSearchResults] = useState<Asset[]>();
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
    (value: string) => {
      if (!value) {
        setSearchResults(undefined);
      } else {
        if (!assets) return;
        setSearchResults(assets.filter(a => a.name.toLowerCase().includes(value)));
      }
    },
    [assets],
  );

  return {
    layoutType,
    setLayoutType,
    searchResults,
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
