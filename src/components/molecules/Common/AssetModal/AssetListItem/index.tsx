import React from "react";
import { check } from "prettier";

import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";

import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Asset = {
  id: string;
  teamId?: string;
  name: string;
  size?: number;
  url?: string;
  contentType?: string;
};

export type Props = {
  asset: Asset;
  selected?: boolean;
  checked?: boolean;
  isImage?: boolean;
  onCheck?: (checked: boolean) => void;
};

const AssetListItem: React.FC<Props> = ({ asset, selected, checked, onCheck }) => {
  const theme = useTheme();
  return (
    <ListItem key={asset.id} align="center" selected={selected} onClick={() => onCheck?.(!check)}>
      <Icon
        icon={
          checked
            ? "checkCircle"
            : /\.(jpg|jpeg|png|gif|svg|webp|GIF|JPG|JPEG|PNG|SVG|WEBP)$/.test(asset.url)
            ? "image"
            : "file"
        }
        size={16}
        color={checked ? theme.assetCard.highlight : theme.assetCard.text}
      />
      <ListItemName size="m" customColor>
        {asset.name}
      </ListItemName>
      {asset.size && (
        <ListItemSize size="m" customColor>
          {parseFloat((asset.size / 1000).toFixed(2))} KB
        </ListItemSize>
      )}
    </ListItem>
  );
};

export default AssetListItem;

const ListItem = styled(Flex)<{ selected?: boolean }>`
  background: ${({ theme }) => theme.assetCard.bg};
  box-shadow: 0 6px 6px -8px ${props => props.theme.colors.other.black};
  border: 1px solid
    ${({ selected, theme }) => (selected ? `${theme.assetCard.highlight}` : "transparent")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["xl"]}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.main};
  height: 46px;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.assetCard.bgHover};
    color: ${({ theme }) => theme.colors.text.strong};
  }
`;

const ListItemName = styled(Text)`
  margin-left: ${metricsSizes["l"]}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
`;

const ListItemSize = styled(Text)`
  margin-left: auto;
`;
