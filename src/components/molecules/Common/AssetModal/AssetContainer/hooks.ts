import { useState, useCallback, useEffect } from "react";
import useFileInput from "use-file-input";

export type SortTypes = "DATE" | "SIZE" | "NAME";

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
  sortType,
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
  sortType?: string;
  searchTerm?: string;
  handleSearchTerm: (term?: string | undefined) => void;
  smallCardOnly?: boolean;
}) => {
  const [layoutType, setLayoutType] = useState<LayoutTypes>(smallCardOnly ? "small" : "medium");
  const [reverse, setReverse] = useState(false);
  const [searchResults, setSearchResults] = useState<Asset[]>();
  const [filteredAssets, setAssets] = useState(assets);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const iconChoice =
    sortType === "name"
      ? reverse
        ? "filterNameReverse"
        : "filterName"
      : sortType === "size"
      ? reverse
        ? "filterSizeReverse"
        : "filterSize"
      : reverse
      ? "filterTimeReverse"
      : "filterTime";

  useEffect(() => {
    if (!assets) return;
    setAssets(assets);
  }, [assets]);

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
    setReverse(!reverse);
    if (!filteredAssets) return;
    setAssets(filteredAssets.reverse());
  }, [filteredAssets, reverse]);

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
        if (!filteredAssets) return;
        setSearchResults(filteredAssets.filter(a => a.name.toLowerCase().includes(value)));
      }
    },
    [filteredAssets],
  );

  return {
    layoutType,
    setLayoutType,
    filteredAssets,
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
