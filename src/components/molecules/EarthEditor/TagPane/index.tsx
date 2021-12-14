import React from "react";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { styled } from "@reearth/theme";

import TagGroup, { Tag as TagType } from "./TagGroup";

export type Tag = TagType;

export type Props = {
  className?: string;
  tagGroups?: TagGroup[];
  allTagGroups?: TagGroup[];
  onTagGroupAdd?: (value: string) => void;
  onTagAdd?: (tg: string, tag: string) => void;
};

export type TagGroup = {
  id: string;
  label: string;
  tags: Tag[];
};

const TagPane: React.FC<Props> = ({
  className,
  tagGroups,
  onTagGroupAdd,
  onTagAdd,
  allTagGroups,
}) => {
  return (
    <Wrapper className={className} direction="column">
      {tagGroups?.map(tg => (
        <Box key={tg.id} mb="l">
          <TagGroup
            title={tg.label}
            icon="cancel"
            allTags={allTagGroups?.find(atg => atg.label === tg.label)?.tags}
            attachedTags={tg.tags}
            onTagAdd={(t: string) => onTagAdd?.(tg.label, t)}
            onSelect={(t: string) => onTagAdd?.(tg.label, t)}
          />
        </Box>
      ))}
      <AutoComplete onCreate={onTagGroupAdd} creatable />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: ${({ theme }) => `${theme.metrics.l}px`};
`;

export default TagPane;
