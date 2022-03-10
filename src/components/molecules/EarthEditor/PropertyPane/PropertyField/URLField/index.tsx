import { useApolloClient } from "@apollo/client";
import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import AssetModal, {
  Asset as AssetType,
  AssetSortType as SortType,
} from "@reearth/components/molecules/Common/AssetModal";
import { styled } from "@reearth/theme";

import TextField from "../TextField";
import { FieldProps } from "../types";

export type Asset = AssetType;

export type AssetSortType = SortType;

export type Props = FieldProps<string> & {
  fileType?: "image" | "video";
  assets?: AssetType[];
  isAssetsLoading?: boolean;
  hasMoreAssets?: boolean;
  assetSort?: { type?: AssetSortType | null; reverse?: boolean };
  assetSearchTerm?: string;
  onGetMoreAssets?: () => void;
  onCreateAssets?: (files: FileList) => Promise<void>;
  onAssetSort?: (type?: string, reverse?: boolean) => void;
  onAssetSearch?: (term?: string) => void;
  onRemoveFile?: () => void;
};

const URLField: React.FC<Props> = ({
  name,
  value,
  linked,
  overridden,
  fileType,
  assets,
  isAssetsLoading,
  hasMoreAssets,
  assetSort,
  assetSearchTerm,
  onGetMoreAssets,
  onCreateAssets,
  onAssetSort,
  onAssetSearch,
  onChange,
}) => {
  const intl = useIntl();
  const gqlCache = useApolloClient().cache;
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const openAssetModal = useCallback(() => setAssetModalOpen(true), []);
  const closeAssetModal = useCallback(() => {
    setAssetModalOpen(false);
    setTimeout(() => {
      onAssetSort?.(undefined);
      onAssetSearch?.(undefined);
      gqlCache.evict({ fieldName: "assets" });
    }, 200);
  }, [gqlCache, onAssetSearch, onAssetSort]);
  const deleteValue = useCallback(() => onChange?.(null), [onChange]);

  return (
    <Wrapper>
      <InputWrapper>
        <StyledTextField
          name={name}
          value={value}
          onChange={onChange}
          placeholder={intl.formatMessage({ defaultMessage: "Not set" })}
          linked={linked}
          overridden={overridden}
          disabled
          onClick={openAssetModal}
        />
        {value ? (
          <AssetButton icon="bin" size={18} onClick={deleteValue} />
        ) : fileType === "image" ? (
          <AssetButton icon="image" size={18} active={!linked} onClick={openAssetModal} />
        ) : fileType === "video" ? (
          <AssetButton icon="video" size={18} active={!linked} onClick={openAssetModal} />
        ) : (
          <AssetButton icon="resource" size={18} active={!linked} onClick={openAssetModal} />
        )}
      </InputWrapper>
      <AssetModal
        assets={assets}
        isOpen={isAssetModalOpen}
        fileType={fileType}
        smallCardOnly
        value={value}
        isLoading={isAssetsLoading}
        hasMoreAssets={hasMoreAssets}
        sort={assetSort}
        searchTerm={assetSearchTerm}
        onSelect={onChange}
        onClose={closeAssetModal}
        onGetMoreAssets={onGetMoreAssets}
        onCreateAssets={onCreateAssets}
        onSortChange={onAssetSort}
        onSearch={onAssetSearch}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AssetButton = styled(Icon)<{ active?: boolean }>`
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  border-radius: 6px;
  color: ${props => props.theme.main.text};

  &:hover {
    background: ${props => props.theme.main.bg};
  }
`;

const StyledTextField = styled(TextField)<{ canUpload?: boolean }>``;

export default URLField;
