import React from "react";
import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";

import { styled } from "@reearth/theme";
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
  asset: Asset;
  checked?: boolean;
  fileType?: "image" | "video" | "file";
};

const AssetListItem: React.FC<Props> = ({ asset, checked, fileType }) => {
  return (
    <ListItem key={asset.id} align="center" checked={checked}>
      <Icon icon={fileType === "file" ? "file" : "image"} size={16} />
      <ListItemName size="m" customColor>
        {asset.name}
      </ListItemName>
      <ListItemSize size="m" customColor>
        {parseFloat((asset.size / 1000).toFixed(2))} KB
      </ListItemSize>
    </ListItem>
  );
};

export default AssetListItem;

const ListItem = styled(Flex)<{ checked?: boolean }>`
  background: ${({ theme }) => theme.assetCard.bg};
  border: 1px solid
    ${props => (props.checked ? `${props.theme.assetCard.highlight}` : "transparent")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["xl"]}px;
  margin-bottom: ${metricsSizes["l"]}px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.main};

  &:hover {
    background: ${({ theme }) => theme.assetCard.bgHover};
    color: ${props => props.theme.colors.text.strong};
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
