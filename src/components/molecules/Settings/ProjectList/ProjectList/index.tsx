import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import ProjectCell, {
  Project as ProjectType,
} from "@reearth/components/molecules/Settings/ProjectList/ProjectCell";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Project = ProjectType;

export type Props = {
  title?: string;
  archived?: boolean;
  projects?: Project[];
  loading?: boolean;
  withToggle?: boolean;
  onProjectSelect?: (project: Project) => void;
};

const ProjectList: React.FC<Props> = ({
  loading,
  projects,
  title,
  archived,
  withToggle = true,

  onProjectSelect,
}) => {
  const intl = useIntl();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    archived && withToggle && setOpen(false);
    !withToggle && setOpen(true);
  }, [archived, withToggle]);
  const theme = useTheme();

  return (
    <>
      {withToggle && archived && (
        <StyledFlex align="center" onClick={() => setOpen(!open)}>
          <StyledIcon icon="arrowToggle" size={15} color={theme.main.text} />
          <Text
            size="m"
            weight="normal"
            color={theme.main.text}
            otherProperties={{ margin: "12px 0" }}>
            {`${intl.formatMessage({ defaultMessage: "Archived Projects" })} (${
              projects?.length || 0
            })`}
          </Text>
        </StyledFlex>
      )}
      {withToggle && !archived && (
        <StyledFlex justify="space-between" align="center">
          <Text size="m" weight="normal" color={theme.main.text}>
            {title ||
              `${intl.formatMessage({ defaultMessage: "Current Projects" })} (${
                projects?.length || 0
              })`}
          </Text>
        </StyledFlex>
      )}
      {loading ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
          {open && (
            <ProjectListContainner>
              {projects?.map(project => (
                <ProjectCell project={project} key={project.id} onSelect={onProjectSelect} />
              ))}
            </ProjectListContainner>
          )}
        </>
      )}
    </>
  );
};

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`;

const ProjectListContainner = styled.div`
  > * {
    margin-top: ${metricsSizes["4xl"]}px;
  }
  > * {
    margin-bottom: ${metricsSizes["4xl"]}px;
  }
`;

const StyledFlex = styled(Flex)`
  border-bottom: solid 1px ${({ theme }) => theme.projectCell.divider};
  cursor: pointer;
`;

export default ProjectList;
