import React from "react";
import { check } from "prettier";
import Icon from "../Icon";
import { styled } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";

type CardSize = "small" | "medium" | "large";

export type Props = {
  className?: string;
  name: string;
  url: string;
  isImage?: boolean;
  cardSize?: CardSize;
  checked?: boolean;
  onCheck?: (checked: boolean) => void;
};

const AssetCard: React.FC<Props> = ({
  className,
  cardSize,
  checked,
  onCheck,
  url,
  isImage,
  name,
}) => {
  return (
    <Wrapper
      className={className}
      direction="column"
      checked={checked}
      cardSize={cardSize}
      onClick={() => onCheck?.(!check)}>
      {checked && <StyledIcon icon="checkCircle" alt="checked" size={20} />}
      <ImgWrapper cardSize={cardSize} url={url}>
        {!isImage && <Icon icon="file" />}
      </ImgWrapper>
      <FileName size={cardSize === "large" ? "m" : "xs"} cardSize={cardSize} customColor>
        {name}
      </FileName>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)<{ checked?: boolean; cardSize?: CardSize }>`
  background: ${props => props.theme.assetCard.bg};
  box-shadow: 0 6px 6px -6px ${props => props.theme.colors.other.black};
  border: 1px solid
    ${props => (props.checked ? `${props.theme.assetCard.highlight}` : "transparent")};
  margin: ${({ cardSize }) => (cardSize === "small" ? "5px" : "10px")};
  padding: ${({ cardSize }) =>
    cardSize === "small" ? "8px" : cardSize === "medium" ? "12px" : "20px"};
  width: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "163px" : "218px"};
  height: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "168px" : "234px"};
  position: relative;
  cursor: pointer;
  color: ${({ theme }) => theme.assetCard.text};

  &:hover {
    background: ${({ theme }) => theme.assetCard.bgHover};
    color: ${({ theme }) => theme.assetCard.textHover};
    box-shadow: 0 8px 7px -6px ${props => props.theme.colors.other.black};
  }
`;

const ImgWrapper = styled.div<{ cardSize?: CardSize; url?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ cardSize }) =>
    cardSize === "small" ? "77px" : cardSize === "medium" ? "126px" : "175px"};
  background-image: ${props => `url(${props.url})`};
  background-size: cover;
  background-position: center;
`;

const FileName = styled(Text)<{ cardSize?: CardSize }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: ${({ cardSize }) => (cardSize === "large" ? "16px" : "12px")};
  color: inherit;
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${({ theme }) => theme.assetCard.highlight};
`;

export default AssetCard;
