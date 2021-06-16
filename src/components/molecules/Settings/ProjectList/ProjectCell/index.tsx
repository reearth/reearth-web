import React, { useState } from "react";
import { useIntl } from "react-intl";
import defaultProjectImage from "./defaultProjectImage.jpg";

// Components
import PublicationStatus, {
  Status as StatusType,
} from "@reearth/components/atoms/PublicationStatus";

import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";

export type Status = StatusType;

export type Project = {
  id: string;
  name: string;
  imageUrl?: string;
  status: Status;
  isArchived?: boolean;
  description: string;
  sceneId?: string;
};

export type Props = {
  project: Project;
  onSelect?: (p: Project) => void;
};

const ProjectCell: React.FC<Props> = ({ project, onSelect }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [isHover, setHover] = useState(false);

  return (
    <StyledWrapper project={project}>
      <Wrapper
        project={project}
        onClick={() => onSelect?.(project)}
        isHover={isHover}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <Title size="l" color={theme.projectCell.title}>
          {project.name ? project.name : intl.formatMessage({ defaultMessage: "No Title Project" })}
        </Title>
        {isHover && (
          <DescriptionWrapper>
            <Desc size="s" color={theme.projectCell.description} isParagraph={true}>
              {project.description
                ? project.description
                : intl.formatMessage({ defaultMessage: "No Description..." })}
            </Desc>
          </DescriptionWrapper>
        )}
        <PublicationStatus status={project.status} color={theme.projectCell.description} />
      </Wrapper>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ project: Project }>`
  background: ${props =>
    props.project.imageUrl ? `url(${props.project.imageUrl})` : `url(${defaultProjectImage})`};
  background-size: cover;
  background-position: center;
  ${props => !props.project.imageUrl && "background-size: 400px 240px;"};
  box-shadow: 0 0 5px ${props => props.theme.projectCell.shadow};
  height: 240px;
`;

const Wrapper = styled.div<{ project: Project; isHover?: boolean }>`
  box-sizing: border-box;
  padding: 24px 16px;
  cursor: pointer;
  height: 100%;
  background-color: ${props => (props.isHover ? props.theme.main.lightTransparentBg : "")};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled(Text)`
  text-align: left;
  user-select: none;
`;

const DescriptionWrapper = styled.div`
  margin-top: 24px;
  flex: 1;
  width: 90%;
`;

const Desc = styled(Text)`
  text-align: left;
  user-select: none;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  display: -webkit-inline-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ProjectCell;
