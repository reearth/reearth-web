import React from "react";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  title?: string;
  actions?: React.ReactNode;
};

const Section: React.FC<Props> = ({ title, actions, children }) => {
  const theme = useTheme();
  return (
    <Wrapper>
      {title && (
        <>
          <SectionHeader>
            <Text size="l" weight="normal" color={theme.main.strongText}>
              {title}
            </Text>
            {actions}
          </SectionHeader>
          <Divider />
        </>
      )}
      <SectionItem>{children}</SectionItem>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

const SectionHeader = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
`;

const SectionItem = styled.div`
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  border-bottom: ${props => `solid 1px ${props.theme.colors.outline.weak}`};
`;

export default Section;
