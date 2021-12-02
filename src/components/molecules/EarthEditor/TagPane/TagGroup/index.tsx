import React from "react";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Tag from "@reearth/components/atoms/Tag";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

export type Props = {
  className?: string;
  title?: string;
  icon?: "bin" | "cancel";
  onRemove?: () => void;
  onTagCreate?: (value: string) => void;
  onTagRemove?: (value: string) => void;
  onSelect?: (value: string) => void;
  allTags: string[];
  attachedTags: string[];
};

const TagGroup: React.FC<Props> = ({
  className,
  title,
  icon,
  onRemove,
  onTagCreate,
  onSelect,
  allTags,
  attachedTags,
}) => {
  const theme = useTheme();
  return (
    <Wrapper direction="column" align="center" justify="space-between" className={className}>
      <TitleWrapper justify="space-between">
        <Text size="s">{title}</Text>
        <IconWrapper align="center" onClick={onRemove} testId="atoms-tag-event-trigger">
          <Icon
            icon={icon}
            color={theme.text.default}
            data-testid="atoms-tag-icon"
            alt="tag-icon"
            size={12}
          />
        </IconWrapper>
      </TitleWrapper>
      <TagsWrapper wrap="wrap">
        {attachedTags.map(t => (
          <Tag icon="cancel" text={t} key={t} />
        ))}
      </TagsWrapper>
      <AutoComplete
        items={allTags.map(t => ({ value: t, label: t }))}
        onSelect={onSelect}
        creatable
        onCreate={onTagCreate}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  box-shadow: ${({ theme }) =>
    `0px 4px 4px${theme.descriptionBalloon.shadowColor}`}; //TODO: don't use balloon's color
  padding: ${({ theme }) => `${theme.metrics.s}px`};
  min-width: 60px;
  width: fit-content;
  background: ${({ theme }) => theme.properties.bg};
`;

const TitleWrapper = styled(Flex)`
  width: 100%;
`;

const IconWrapper = styled(Flex)`
  cursor: pointer;
`;

const TagsWrapper = styled(Flex)`
  margin: ${({ theme }) => `${theme.metrics.l}px 0px`};
`;

export default TagGroup;
