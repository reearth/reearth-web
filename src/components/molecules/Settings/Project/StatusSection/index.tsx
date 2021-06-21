import React, { useMemo } from "react";
import PublicationStatus, { Status } from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Props = {
  projectStatus?: Status;
};

const StatusSection: React.FC<Props> = ({ projectStatus }) => {
  const intl = useIntl();
  const theme = useTheme();

  const Message = useMemo(() => {
    return projectStatus === "published"
      ? intl.formatMessage({
          defaultMessage: "This project is published with search engine indexing enabled.",
        })
      : projectStatus === "limited"
      ? intl.formatMessage({
          defaultMessage: "This project is published with search engine indexing disabled.",
        })
      : intl.formatMessage({ defaultMessage: "This project is not published." });
  }, [intl, projectStatus]);

  return (
    <Wrapper>
      <PublicationStatus status={projectStatus} size="lg" color={theme.main.strongText} />
      <PublicationMessage size="m">{Message}</PublicationMessage>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.main.lighterBg};
  margin-bottom: 64px;
  height: 90px;
  padding: 30px;
`;

const PublicationMessage = styled(Text)`
  margin-top: 30px; // This hardcode falls outside of the design's current metric system, so is permitted as an exception.
`;

export default StatusSection;
