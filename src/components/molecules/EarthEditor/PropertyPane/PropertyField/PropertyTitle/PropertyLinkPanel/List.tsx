import React from "react";
import { useIntl } from "react-intl";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Divider from "@reearth/components/atoms/Divider";

import { styled, css } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import { metricsSizes } from "@reearth/theme/metrics";

export interface Props {
  className?: string;
  items?: { id: string; name?: string; type?: string }[];
  selectableType?: string;
  selectedItem?: string;
  showArrows?: boolean;
  onSelect?: (id: string) => void;
}

const List: React.FC<Props> = ({
  className,
  items,
  showArrows,
  selectableType,
  onSelect,
  selectedItem,
}) => {
  const intl = useIntl();
  const visibleItems =
    items?.filter(item => !selectableType || ("type" in item && item.type === selectableType)) ??
    [];
  return (
    <Wrapper className={className}>
      {visibleItems.map(item => (
        <>
          <StyledText
            size="xs"
            customColor
            key={item.id}
            onClick={() => onSelect?.(item.id)}
            selected={item.id === selectedItem}>
            {item.name || item.id}
            <Arrow visible={showArrows}>
              <StyledIcon icon="arrowLeft" size={16} />
            </Arrow>
          </StyledText>
          <Divider margin="0" />
        </>
      ))}
      {visibleItems.length === 0 && (
        <NoContent>{intl.formatMessage({ defaultMessage: "No selectable items" })}</NoContent>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  flex: auto;
  overflow: auto;
`;

const StyledText = styled(Text)<{ disabled?: boolean; selected?: boolean }>`
  padding: ${metricsSizes["s"]}px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  user-select: none;
  transition: background-color 0.1s ease;
  color: ${({ disabled, theme }) => (disabled ? theme.text.pale : theme.text.default)};
  background-color: ${({ selected }) => (selected ? colors.primary.main : null)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  ${({ disabled, selected }) =>
    disabled || selected
      ? null
      : css`
          &:hover {
            background-color: #ffffff10;
          }
        `};
`;

const Arrow = styled.div<{ visible?: boolean }>`
  display: ${({ visible }) => (visible ? "inline-block" : "none")};
  position: absolute;
  right: 0.5em;
  top: 50%;
  transform: translateY(-30%);
  font-size: 14px;
  vertical-align: middle;
`;

const NoContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  user-select: none;
  margin-left: 5px;
`;

export default List;
