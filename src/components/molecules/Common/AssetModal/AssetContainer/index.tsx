import React, { useCallback, useState } from "react";
import { styled } from "@reearth/theme";

import AssetCard from "@reearth/components/atoms/AssetCard";
import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Divider from "@reearth/components/atoms/Divider";
import useFileInput from "use-file-input";
import { useIntl } from "react-intl";
import { metricsSizes } from "@reearth/theme/metrics";

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

export type layoutTypes = "grid" | "grid-small" | "list";

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
  const [layoutType, setLayoutType] = useState<layoutTypes>("grid");

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
      <NavBar align="center" justify="center">
        <StyledIcon icon="assetList" onClick={() => setLayoutType("list")} />
        <StyledIcon icon="assetGridSmall" onClick={() => setLayoutType("grid-small")} />
        <StyledIcon icon="assetGrid" onClick={() => setLayoutType("grid")} />
      </NavBar>
      <AssetWrapper>
        {layoutType === "list" ? (
          <h1>list</h1>
        ) : layoutType === "grid-small" ? (
          assets?.map(a => (
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
        ) : (
          assets?.map(a => (
            <AssetCard
              key={a.id}
              name={a.name}
              cardSize={"medium"}
              url={a.url}
              isImage={fileType === "image"}
              onCheck={() => handleAssetsSelect(a)}
              checked={selectedAssets?.includes(a)}
            />
          ))
        )}
      </AssetWrapper>
      <Divider margin="0" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 558px;
  width: 100%;
`;

const AssetWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 458px;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &::after {
    content: "";
    flex: auto;
  }
`;

const StyledUploadButton = styled(Button)`
  margin: 0 auto 15px auto;
`;

const NavBar = styled(Flex)`
  margin: ${metricsSizes["s"]}px;
  // background: lightblue;
`;

const StyledIcon = styled(Icon)`
  margin-right: 8px;
  border-radius: 5px;
  padding: ${metricsSizes["2xs"]}px;
  color: ${props => props.theme.colors.text.main};

  &:hover {
    background: ${props => props.theme.colors.bg[5]};
  }
`;

export default AssetContainer;
