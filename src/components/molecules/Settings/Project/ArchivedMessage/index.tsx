import React from "react";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

const ArchivedMessage: React.FC = () => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Notice" })}>
        <Description>
          {intl.formatMessage({
            defaultMessage:
              "Most project settings are hidden for archived repositories. This project mus be unarchived to make changes to them.",
          })}
        </Description>
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.lighterBg};
`;

const Description = styled.p``;

export default ArchivedMessage;
