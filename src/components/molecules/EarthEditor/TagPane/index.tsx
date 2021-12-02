import React from "react";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { styled } from "@reearth/theme";

import TagGroup from "./TagGroup";

export type Props = {
  className?: string;
  tagGroups?: TagGroup[];
  allTags?: string[];
  onTagGroupAdd?: (value: string) => void;
};

export type TagGroup = {
  name: string;
  tags: string[];
};

const TagPane: React.FC<Props> = ({ className, tagGroups, allTags, onTagGroupAdd }) => {
  return (
    <Wrapper className={className} direction="column">
      {tagGroups?.map(tg => (
        <Box key={tg.name} mb="l">
          <TagGroup allTags={allTags} attachedTags={tg.tags} />
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
