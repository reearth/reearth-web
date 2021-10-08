import React, { useState, useRef } from "react";
import { useIntl } from "react-intl";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import HelpButton from "@reearth/components/atoms/HelpButton";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, metricsSizes } from "@reearth/theme";

import { Widget } from "../../OutlinePane/hooks";

export type Format = "kml" | "czml" | "geojson" | "shape" | "reearth";

export type Props = {
  selectedWidgetId?: string;
  widgets?: Widget[];
  onWidgetAdd?: (id: string) => void;
  onWidgetRemove?: (selectedWidgetId: string) => void;
};

const WidgetActions: React.FC<Props> = ({
  selectedWidgetId,
  widgets,
  onWidgetAdd,
  onWidgetRemove,
}) => {
  const intl = useIntl();
  const [visibleMenu, setVisibleMenu] = useState(false);
  const widgetId = selectedWidgetId?.split("/")[2];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement: "bottom",
    modifiers: [
      {
        name: "eventListeners",
        enabled: visibleMenu,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  useClickAway(wrapperRef, () => setVisibleMenu(false));

  return (
    <ActionWrapper
      ref={wrapperRef}
      onClick={e => {
        e.stopPropagation();
      }}>
      <Action
        disabled={!widgetId}
        onClick={() => {
          if (widgetId) {
            onWidgetRemove?.(widgetId);
          }
        }}>
        <HelpButton
          descriptionTitle={intl.formatMessage({ defaultMessage: "Delete selected widget." })}
          balloonDirection="top">
          <StyledIcon icon="bin" size={16} disabled={!widgetId} />
        </HelpButton>
      </Action>
      <Action ref={referenceElement} onClick={() => setVisibleMenu(!visibleMenu)}>
        <StyledIcon icon="plusSquare" size={16} />
      </Action>
      <MenuWrapper ref={popperElement} style={styles.popper} {...attributes.popper}>
        {visibleMenu && (
          <Menu>
            {widgets?.map(w => (
              <MenuItem
                key={`${w.pluginId}/${w.extensionId}`}
                onClick={() => onWidgetAdd?.(`${w.pluginId}/${w.extensionId}`)}>
                <WidgetIcon icon={w.icon} size={16} />
                <Text size="xs">{w.title}</Text>
              </MenuItem>
            ))}
          </Menu>
        )}
      </MenuWrapper>
    </ActionWrapper>
  );
};

const ActionWrapper = styled.div`
  flex: 1;
`;

const Action = styled.span<{ disabled?: boolean }>`
  float: right;
  margin-right: 10px;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ disabled?: boolean }>`
  padding: 3px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  color: ${({ disabled, theme }) => (disabled ? theme.main.weak : theme.main.text)};
  border-radius: 5px;
  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? null : theme.main.bg)};
  }
`;

const WidgetIcon = styled(Icon)`
  margin-right: ${metricsSizes.s}px;
`;

const MenuWrapper = styled.div`
  z-index: 1;
`;

const Menu = styled.div`
  background: ${({ theme }) => theme.selectList.option.bg};
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 5px;
`;

const MenuItem = styled(Flex)`
  padding: ${metricsSizes.xs}px ${metricsSizes.m}px;

  &:hover {
    background: ${({ theme }) => theme.selectList.option.hoverBg};
  }
`;

export default WidgetActions;
