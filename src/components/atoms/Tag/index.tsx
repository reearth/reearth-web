import React, { useCallback } from "react";

import { styled, useTheme } from "@reearth/theme";

import Box from "../Box";
import Flex from "../Flex";
import Icon from "../Icon";
import Text from "../Text";

export type TagItem = {
  id: string;
  label: string;
};

export type Props = {
  tag: TagItem;
  className?: string;
  icon?: "bin" | "cancel";
  onRemove?: (id: string) => void;
};

const Tag: React.FC<Props> = ({ className, tag, icon, onRemove }) => {
  const theme = useTheme();
  const handleRemove = useCallback(() => {
    onRemove?.(tag.id);
  }, [onRemove, tag.id]);
  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <Text size="xs">{tag.label}</Text>
      <Box m="xs">
        <IconWrapper align="center" onClick={handleRemove} testId="atoms-tag-event-trigger">
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
  box-shadow: ${({ theme }) => `0px 4px 4px${theme.descriptionBalloon.shadowColor}`};
  padding: ${({ theme }) => `${theme.metrics.xs}px`};
  min-width: 60px;
  width: fit-content;
`;

const IconWrapper = styled(Flex)`
  cursor: pointer;
`;

export default Tag;
