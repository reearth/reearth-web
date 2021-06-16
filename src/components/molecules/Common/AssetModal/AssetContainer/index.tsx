import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Divider from "@reearth/components/atoms/Divider";
import SearchBar from "@reearth/components/atoms/SearchBar";
import { metricsSizes } from "@reearth/theme/metrics";
import { styled } from "@reearth/theme";

import AssetCard from "../AssetCard";
import AssetListItem from "../AssetListItem";
import AssetSelect from "../AssetSelect";
import VirtualAssetCard from "../VirtualAssetCard";

import useHooks, { Asset as AssetType, LayoutTypes, FilterTypes } from "./hooks";
import { useCallback, useRef, useState, useEffect } from "react";

export type Asset = AssetType;

export type Props = {
  className?: string;
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (files: FileList) => void;
  onRemove?: (assets: AssetType[]) => void;
  initialAsset?: Asset;
  selectedAssets?: Asset[];
  selectAsset?: (assets: Asset[]) => void;
  fileType?: "image" | "video" | "file";
  isSettingPage?: boolean;
};

const AssetContainer: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  accept,
  onCreateAsset,
  onRemove,
  initialAsset,
  selectedAssets,
  selectAsset,
  fileType,
  isSettingPage,
}) => {
  const intl = useIntl();
  const {
    layoutType,
    setLayoutType,
    filteredAssets,
    handleFilterChange,
    filterSelected,
    currentSaved,
    searchResults,
    iconChoice,
    handleAssetsSelect,
    handleUploadToAsset,
    handleReverse,
    handleSearch,
  } = useHooks({
    assets,
    isMultipleSelectable,
    accept,
    onCreateAsset,
    initialAsset,
    selectAsset,
    selectedAssets,
  });

  const filterOptions: { key: FilterTypes; label: string }[] = [
    { key: "time", label: intl.formatMessage({ defaultMessage: "Time" }) },
    { key: "size", label: intl.formatMessage({ defaultMessage: "File size" }) },
    { key: "name", label: intl.formatMessage({ defaultMessage: "Alphabetical" }) },
  ];

  const handleRemove = useCallback(() => {
    if (selectedAssets?.length) {
      onRemove?.(selectedAssets);
    }
  }, [onRemove, selectedAssets]);

  const listRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (listRef.current?.offsetWidth) {
      setContainerWidth(listRef.current?.offsetWidth);
    }
  }, [containerWidth]);

  const handleResize = () => {
    if (listRef.current?.offsetWidth) {
      setContainerWidth(listRef.current?.offsetWidth);
    }
  };

  window.addEventListener("resize", handleResize);

  return (
    <Wrapper>
      <ButtonWrapper onRemove={onRemove}>
        <Button
          large
          text={
            fileType === "image"
              ? intl.formatMessage({ defaultMessage: "Upload image" })
              : intl.formatMessage({ defaultMessage: "Upload file" })
          }
          icon="upload"
          type="button"
          buttonType={onRemove ? "secondary" : "primary"}
          onClick={handleUploadToAsset}
        />
        {onRemove && (
          <Button
            large
            text={intl.formatMessage({ defaultMessage: "Delete" })}
            icon="bin"
            type="button"
            buttonType="secondary"
            onClick={handleRemove}
          />
        )}
      </ButtonWrapper>
      <Divider margin="0" />
      <NavBar align="center" justify="space-between">
        <SelectWrapper direction="row" justify="space-between" align="center">
          <AssetSelect<"time" | "size" | "name">
            value={filterSelected}
            items={filterOptions}
            onChange={handleFilterChange}
          />
          <StyledIcon icon={iconChoice} onClick={handleReverse} />
        </SelectWrapper>

        <LayoutButtons justify="left">
          <StyledIcon
            icon="assetList"
            onClick={() => setLayoutType("list")}
            selected={layoutType === "list"}
          />
          <StyledIcon
            icon="assetGridSmall"
            onClick={() => setLayoutType("small")}
            selected={layoutType === "small"}
          />
          <StyledIcon
            icon="assetGrid"
            onClick={() => setLayoutType("medium")}
            selected={layoutType === "medium"}
          />
        </LayoutButtons>
        <SearchBar onChange={handleSearch} />
      </NavBar>
      <AssetWrapper ref={listRef} isSettingPage={isSettingPage}>
        {!filteredAssets || filteredAssets.length < 1 ? (
          <Template align="center" justify="center">
            <TemplateText size="m">
              {fileType === "image"
                ? intl.formatMessage({
                    defaultMessage:
                      "You haven't uploaded any image assets yet. Click the upload button above and select an image from your computer.",
                  })
                : intl.formatMessage({
                    defaultMessage:
                      "You haven't uploaded any file assets yet. Click the upload button above and select a compatible file from your computer.",
                  })}
            </TemplateText>
          </Template>
        ) : (
          <AssetList
            wrap={layoutType === "list" ? "nowrap" : "wrap"}
            justify="space-between"
            layoutType={layoutType}>
            {layoutType === "list"
              ? (searchResults || filteredAssets)?.map(a => (
                  <AssetListItem
                    key={a.id}
                    asset={a}
                    onCheck={() => handleAssetsSelect(a)}
                    selected={selectedAssets?.includes(a)}
                    checked={currentSaved === a}
                  />
                ))
              : (searchResults || filteredAssets)?.map(a => (
                  <AssetCard
                    key={a.id}
                    name={a.name}
                    cardSize={layoutType}
                    url={a.url}
                    onCheck={() => handleAssetsSelect(a)}
                    selected={selectedAssets?.includes(a)}
                    checked={currentSaved === a}
                  />
                ))}
            <VirtualAssetCard
              containerWidth={containerWidth}
              cardSize={layoutType}
              assetsLength={assets?.length}
            />
          </AssetList>
        )}
        <Divider margin="0" />
      </AssetWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const AssetWrapper = styled.div<{ isSettingPage?: boolean }>`
  height: ${({ isSettingPage }) => (isSettingPage ? "" : "425px")};
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ButtonWrapper = styled.div<{ onRemove?: (assets: AssetType[]) => void }>`
  display: flex;
  justify-content: ${({ onRemove }) => (onRemove ? "flex-end" : "center")};
`;

const AssetList = styled(Flex)<{ layoutType?: LayoutTypes }>`
  ${({ layoutType }) => layoutType === "list" && "flex-direction: column;"};
  // max-height: 458px;

  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavBar = styled(Flex)`
  margin: ${metricsSizes["m"]}px;
  flex: 1;
`;

const SelectWrapper = styled(Flex)`
  flex: 2;
`;

const LayoutButtons = styled(Flex)`
  margin-left: ${metricsSizes["l"]}px;
  flex: 3;
`;

const StyledIcon = styled(Icon)<{ selected?: boolean }>`
  margin-left: ${metricsSizes["m"]}px;
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${({ theme }) => theme.colors.text.main};
  cursor: pointer;
  ${({ selected, theme }) => selected && `background: ${theme.colors.bg[5]};`}

  &:hover {
    background: ${({ theme }) => theme.colors.bg[5]};
    color: ${({ theme }) => theme.colors.text.strong};
  }
`;

const Template = styled(Flex)`
  height: 458px;
`;

const TemplateText = styled(Text)`
  width: 390px;
`;

export default AssetContainer;
