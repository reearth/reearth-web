import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import SearchBar from "@reearth/components/atoms/SearchBar";
import Text from "@reearth/components/atoms/Text";
import AssetDeleteModal from "@reearth/components/molecules/Common/AssetModal/AssetDeleteModal";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import AssetCard from "../AssetCard";
import AssetListItem from "../AssetListItem";
import AssetSelect from "../AssetSelect";

import useHooks, { Asset as AssetType, LayoutTypes, FilterTypes } from "./hooks";

export type Asset = AssetType;

export type Props = {
  className?: string;
  assets?: Asset[];
  initialAsset?: Asset;
  selectedAssets?: Asset[];
  accept?: "file" | "image" | "video";
  isMultipleSelectable?: boolean;
  height?: number;
  onCreateAsset?: (files: FileList) => void;
  onRemove?: (assetIds: string[]) => void;
  selectAsset: (asset?: Asset | undefined) => void;
};

const AssetsContainer: React.FC<Props> = ({
  assets,
  initialAsset,
  selectedAssets,
  accept,
  isMultipleSelectable = false,
  height,
  onCreateAsset,
  onRemove,
  selectAsset,
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
    handleUploadToAsset,
    handleReverse,
    handleSearch,
    deleteModalVisible,
    setDeleteModalVisible,
    handleRemove,
  } = useHooks({
    assets,
    isMultipleSelectable,
    accept,
    onCreateAsset,
    initialAsset,
    selectAsset,
    selectedAssets,
    onRemove,
  });

  const imagesOnly = accept === "image";

  const filterOptions: { key: FilterTypes; label: string }[] = [
    { key: "time", label: intl.formatMessage({ defaultMessage: "Time" }) },
    { key: "size", label: intl.formatMessage({ defaultMessage: "File size" }) },
    { key: "name", label: intl.formatMessage({ defaultMessage: "Alphabetical" }) },
  ];

  return (
    <Wrapper>
      <Flex justify={onRemove ? "flex-end" : "center"}>
        <Button
          large
          text={
            imagesOnly
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
            disabled={selectedAssets?.length ? false : true}
            onClick={() => setDeleteModalVisible(true)}
          />
        )}
      </Flex>
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
      <AssetWrapper height={height}>
        {!filteredAssets || filteredAssets.length < 1 ? (
          <Template align="center" justify="center">
            <TemplateText size="m">
              {imagesOnly
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
          <AssetList layoutType={layoutType}>
            {layoutType === "list"
              ? (searchResults || filteredAssets)?.map(a => (
                  <AssetListItem
                    key={a.id}
                    asset={a}
                    onCheck={() => selectAsset(a)}
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
                    onCheck={() => selectAsset(a)}
                    selected={selectedAssets?.includes(a)}
                    checked={currentSaved === a}
                  />
                ))}
          </AssetList>
        )}
        <Divider margin="0" />
      </AssetWrapper>
      <AssetDeleteModal
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        handleRemove={handleRemove}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
`;

const AssetWrapper = styled.div<{ height?: number }>`
  height: ${({ height }) => (height ? height + "px" : "auto")};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const AssetList = styled.div<{ layoutType?: LayoutTypes }>`
  padding: ${metricsSizes["l"]}px ${metricsSizes["m"]}px;
  overflow-y: scroll;
  scrollbar-width: none;
  display: grid;
  grid-template-columns: ${({ layoutType }) =>
    (layoutType === "list" && "100%") ||
    (layoutType === "medium" && "repeat(auto-fill, 192px)") ||
    (layoutType === "small" && "repeat(auto-fill, 104px)")};
  grid-template-rows: ${({ layoutType }) =>
    (layoutType === "list" && "46px") ||
    (layoutType === "medium" && "repeat(auto-fill, 186px)") ||
    (layoutType === "small" && "repeat(auto-fill, 120px)")};
  gap: ${({ layoutType }) =>
    (layoutType === "list" && "12px") ||
    (layoutType === "medium" && "24px") ||
    (layoutType === "small" && "16px")};
  justify-content: space-between;
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
  color: ${({ selected, theme }) => (selected ? theme.main.text : theme.main.weak)};
  cursor: pointer;
  ${({ selected, theme }) => selected && `background: ${theme.main.paleBg};`}

  &:hover {
    background: ${({ theme }) => theme.main.paleBg};
    color: ${({ theme }) => theme.main.text};
  }
`;

const Template = styled(Flex)`
  height: 458px;
`;

const TemplateText = styled(Text)`
  width: 390px;
`;

export default AssetsContainer;
