import React from "react";
import { check } from "prettier";
import Icon from "../Icon";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

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
  const theme = useTheme();
  return (
    <Wrapper
      className={className}
      checked={checked}
      cardSize={cardSize}
      onClick={() => onCheck?.(!check)}>
      {checked && <StyledIcon icon="checkCircle" alt="checked" size={20} />}
      <ImgWrapper cardSize={cardSize} url={url}>
        {!isImage && <Icon icon="file" />}
      </ImgWrapper>
      <FileName
        size={cardSize === "large" ? "m" : "xs"}
        cardSize={cardSize}
        color={theme.main.text}>
        {name}
      </FileName>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ checked?: boolean; cardSize?: CardSize }>`
  background: ${props => props.theme.imageCard.bg};
  border: 1px solid
    ${props => (props.checked ? `${props.theme.imageCard.highlight}` : "transparent")};
  padding: ${({ cardSize }) =>
    cardSize === "small" ? "8px" : cardSize === "medium" ? "12px" : "20px"};
  width: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "163px" : "218px"};
  height: ${({ cardSize }) =>
    cardSize === "small" ? "104px" : cardSize === "medium" ? "168px" : "234px"};
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  position: relative;
  margin: ${({ cardSize }) => (cardSize === "small" ? "5px" : "10px")};
  cursor: pointer;
  box-shadow: 0 6px 6px -6px ${props => props.theme.colors.other.black};

  &:hover {
    border: ${props => `solid 1px ${props.theme.imageCard.highlight}`};
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
  margin-top: ${({ cardSize }) => (cardSize === "large" ? "16px" : "12px")};
`;

const StyledIcon = styled(Icon)`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${props => props.theme.imageCard.highlight};
`;

export default AssetCard;
