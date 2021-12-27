import React from "react";
import { useIntl } from "react-intl";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme } from "@reearth/theme";

import { default as TagItemComponent } from "../TagItem";

import useHooks, { TagItem as TagItemType, TagGroup as TagGroupType } from "./hook";

export type TagItem = TagItemType;
export type TagGroup = TagGroupType;

export type Props = {
  className?: string;
  tagGroup: TagGroup;
  icon?: "bin" | "cancel";
  removable?: boolean;
  tagDeletable?: boolean;
  onLabelEdit?: (tagGroupId: string, label: string) => void;
  onRemove?: (tagGroupId: string) => void;
  onTagItemAdd?: (tagGroupId: string, tagItemLabel: string) => void;
  onTagItemRemove?: (tagGroupId: string, tagItemId: string) => void;
  onTagItemSelect?: (tagGroupId: string, tagItemId: string) => void;
  attachableTags?: TagItem[];
};

const TagGroup: React.FC<Props> = ({
  className,
  tagGroup,
  icon,
  removable = true,
  tagDeletable = false,
  onRemove,
  onTagItemAdd,
  onTagItemRemove,
  onLabelEdit,
  onTagItemSelect,
  attachableTags,
}) => {
  const theme = useTheme();
  const intl = useIntl();

  const {
    labelRef,
    isLabelEditing,
    handleStartEditing,
    handleLabelEdit,
    handleRemove,
    handleTagItemAdd,
    handleTagItemRemove,
    handleTagItemSelect,
    isGroupRemovable,
    autoCompleteItems,
  } = useHooks({
    tagGroup,
    onLabelEdit,
    onRemove,
    onTagItemAdd,
    onTagItemRemove,
    onTagItemSelect,
    attachableTags,
  });
  return (
    <Wrapper direction="column" align="center" justify="space-between" className={className}>
      <TitleWrapper ref={labelRef}>
        {isLabelEditing ? (
          <TextBox value={tagGroup.label} onChange={handleLabelEdit} />
        ) : (
          <Text size="s">{tagGroup.label}</Text>
        )}
        <Flex>
          {!!onLabelEdit && (
            <IconWrapper align="center" onClick={handleStartEditing}>
              <Icon
                icon="edit"
                size={12}
                alt="tag-remove-icon"
                color={isGroupRemovable ? theme.text.default : theme.text.pale}
              />
            </IconWrapper>
          )}
          {removable && (
            <IconWrapper align="center" onClick={handleRemove} testId="atoms-tag-event-trigger">
              <Icon
                icon={icon}
                color={
                  icon === "bin" && !tagGroup.tagItems.length ? theme.text.pale : theme.text.default
                }
                data-testid="atoms-tag-icon"
                alt="tag-icon"
                size={12}
              />
            </IconWrapper>
          )}
        </Flex>
      </TitleWrapper>
      <TagsWrapper wrap="wrap">
        {tagGroup.tagItems?.map(t => (
          <TagItemComponent
            tagItem={t}
            icon={tagDeletable ? "bin" : "cancel"}
            key={t.id}
            onRemove={handleTagItemRemove.bind(undefined, t.id)}
          />
        ))}
      </TagsWrapper>
      <AutoComplete
        items={autoCompleteItems}
        onSelect={handleTagItemSelect}
        creatable
        onCreate={handleTagItemAdd}
        placeholder={intl.formatMessage({ defaultMessage: "Add a tag" })}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  box-shadow: ${({ theme }) => `0px 4px 4px${theme.descriptionBalloon.shadowColor}`};
  padding: ${({ theme }) => `${theme.metrics.s}px`};
  min-width: 60px;
  width: auto;
  background: ${({ theme }) => theme.properties.bg};
`;

const TitleWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;
const IconWrapper = styled(Flex)`
  cursor: pointer;
  margin-right: ${({ theme }) => theme.metrics.s}px;
  margin-right: ${({ theme }) => theme.metrics.s}px;
`;

const TagsWrapper = styled(Flex)`
  margin: ${({ theme }) => `${theme.metrics.l}px 0px`};
  width: 100%;
`;

export default TagGroup;
