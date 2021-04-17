import React, { useCallback, useState } from "react";
import { styled } from "@reearth/theme";

import AssetCard from "@reearth/components/atoms/AssetCard";
import AssetListItem from "@reearth/components/atoms/AssetListItem";
import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Divider from "@reearth/components/atoms/Divider";
import useFileInput from "use-file-input";
import { useIntl } from "react-intl";
import { metricsSizes } from "@reearth/theme/metrics";

import SelectField from "@reearth/components/molecules/Settings/SelectField";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export type Props = {
  className?: string;
  assets?: Asset[];
  isMultipleSelectable?: boolean;
  accept?: string;
  onCreateAsset?: (file: File) => void;
  selectedAssets?: Asset[];
  selectAsset?: (assets: Asset[]) => void;
  fileType?: "image" | "video" | "file";
};

export type LayoutTypes = "grid" | "grid-small" | "list";

export type FilterTypes = "time" | "size" | "name";

const AssetContainer: React.FC<Props> = ({
  assets,
  isMultipleSelectable = false,
  onCreateAsset,
  accept,
  selectedAssets,
  selectAsset,
  fileType,
}) => {
  const intl = useIntl();
  const [layoutType, setLayoutType] = useState<LayoutTypes>("grid");
  const [reverse, setReverse] = useState(false);

  const [filterSelected, selectFilter] = useState<FilterTypes>("time");
  const [filteredAssets, setAssets] = useState(assets);
  const filterOptions = [
    { key: "time", label: "Date added" },
    { key: "size", label: "File size" },
    { key: "name", label: "Alphabetical" },
  ];

  const filterFunction = useCallback((f: string) => {
    return (a: Asset, a2: Asset) => {
      const type = f as keyof typeof a;
      return a[type] < a2[type] ? -1 : a.size > a2.size ? 1 : 0;
    };
  }, []);

  const iconChoice =
    filterSelected === "name"
      ? reverse
        ? "filterNameReverse"
        : "filterName"
      : filterSelected === "size"
      ? reverse
        ? "filterSizeReverse"
        : "filterSize"
      : reverse
      ? "filterTimeReverse"
      : "filterTime";

  const handleFilterChange = useCallback(
    (f: string) => {
      selectFilter(f as FilterTypes);
      if (!assets) return;
      const newArray = [...assets].sort(filterFunction(f));
      setAssets(f !== "time" ? [...newArray] : [...assets]);
    },
    [assets, filterFunction],
  );

  const handleAssetsSelect = (asset: Asset) => {
    selectedAssets?.includes(asset)
      ? selectAsset?.(selectedAssets?.filter(a => a !== asset))
      : selectAsset?.(
          isMultipleSelectable && selectedAssets ? [...selectedAssets, asset] : [asset],
        );
  };

  const handleFileSelect = useFileInput(files => onCreateAsset?.(files[0]), {
    accept,
    multiple: isMultipleSelectable,
  });

  const handleUploadToAsset = useCallback(() => {
    handleFileSelect();
  }, [handleFileSelect]);

  const handleReverse = useCallback(() => {
    setReverse(!reverse);
    if (!filteredAssets) return;
    filteredAssets.reverse();
  }, [filteredAssets, reverse]);

  return (
    <Wrapper>
      <StyledUploadButton
        large
        text={
          fileType === "image"
            ? intl.formatMessage({ defaultMessage: "Upload image" })
            : intl.formatMessage({ defaultMessage: "Upload file" })
        }
        icon="upload"
        type="button"
        buttonType="primary"
        onClick={handleUploadToAsset}
      />
      <Divider margin="0" />
      <NavBar align="center" justify="space-between">
        <SelectWrapper direction="row" justify="space-between" align="center">
          <SelectField value={filterSelected} items={filterOptions} onChange={handleFilterChange} />
          <StyledIcon icon={iconChoice} onClick={handleReverse} />
        </SelectWrapper>

        <LayoutButtons justify="center">
          <StyledIcon icon="assetList" onClick={() => setLayoutType("list")} />
          <StyledIcon icon="assetGridSmall" onClick={() => setLayoutType("grid-small")} />
          <StyledIcon icon="assetGrid" onClick={() => setLayoutType("grid")} />
        </LayoutButtons>
        <SearchBar />
      </NavBar>
      <AssetWrapper direction="column" justify="space-between">
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
            justify="flex-start"
            layoutType={layoutType}>
            {layoutType === "list"
              ? filteredAssets?.map(a => (
                  <AssetListItem
                    key={a.id}
                    asset={a}
                    isImage={fileType === "image"}
                    onCheck={() => handleAssetsSelect(a)}
                    checked={selectedAssets?.includes(a)}
                  />
                ))
              : layoutType === "grid-small"
              ? filteredAssets?.map(a => (
                  <AssetCard
                    key={a.id}
                    name={a.name}
                    cardSize={"small"}
                    url={a.url}
                    isImage={fileType === "image"}
                    onCheck={() => handleAssetsSelect(a)}
                    checked={selectedAssets?.includes(a)}
                  />
                ))
              : filteredAssets?.map(a => (
                  <AssetCard
                    key={a.id}
                    name={a.name}
                    cardSize={"medium"}
                    url={a.url}
                    isImage={fileType === "image"}
                    onCheck={() => handleAssetsSelect(a)}
                    checked={selectedAssets?.includes(a)}
                  />
                ))}
          </AssetList>
        )}
        <Divider margin="0" />
      </AssetWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 558px;
  width: 100%;
`;

const AssetWrapper = styled(Flex)`
  height: 458px;
`;

const AssetList = styled(Flex)<{ layoutType?: LayoutTypes }>`
  ${({ layoutType }) => layoutType === "list" && "flex-direction: column;"}
  max-height: 458px;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &::after {
    content: "";
    flex: ${({ layoutType }) => (layoutType === "grid" ? "0 33%" : "auto")};
  }
`;

const StyledUploadButton = styled(Button)`
  margin: 0 auto ${metricsSizes["m"]}px auto;
`;

const NavBar = styled(Flex)`
  margin: ${metricsSizes["s"]}px;
  flex: 1;
  // width: 100%;
`;

const SelectWrapper = styled(Flex)`
  flex: 2;
`;

const LayoutButtons = styled(Flex)`
  flex: 3;
`;

const SearchBar = styled.div`
  flex: 5;
  // background: red;
  height: 20px;
`;

const StyledIcon = styled(Icon)`
  margin-left: ${metricsSizes["s"]}px;
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${props => props.theme.colors.text.main};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.bg[5]};
  }
`;

const Template = styled(Flex)`
  height: 458px;
`;

const TemplateText = styled(Text)`
  width: 390px;
`;

export default AssetContainer;
