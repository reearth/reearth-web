import React from "react";

import { styled, useTheme } from "@reearth/theme";

import Box from "../Box";
import Flex from "../Flex";
import Icon from "../Icon";
import Text from "../Text";

export type Props = {
  className?: string;
  text?: string;
  icon?: "bin" | "cancel";
  onRemove?: () => void;
};

const Tag: React.FC<Props> = ({ className, text, icon, onRemove }) => {
  const theme = useTheme();
  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <Text size="xs">{text}</Text>
      <Box m="xs">
        <IconWrapper align="center" onClick={onRemove} testId="atoms-tag-event-trigger">
          <Icon
            icon={icon}
            color={theme.text.default}
            data-testid="atoms-tag-icon"
            alt="tag-icon"
            size={12}
          />
        </IconWrapper>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  box-shadow: ${({ theme }) =>
    `0px 4px 4px${theme.descriptionBalloon.shadowColor}`}; //TODO: don't use balloon's color
  padding: ${({ theme }) => `${theme.metrics.xs}px`};
  min-width: 60px;
  width: fit-content;
`;

const IconWrapper = styled(Flex)`
  cursor: pointer;
`;

export default Tag;
