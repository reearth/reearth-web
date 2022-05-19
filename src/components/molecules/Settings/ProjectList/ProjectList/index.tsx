import React, { useEffect, useState } from "react";

import Loading from "@reearth/components/atoms/Loading";
import ProjectCell, {
  Project as ProjectType,
} from "@reearth/components/molecules/Settings/ProjectList/ProjectCell";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Project = ProjectType;

export type Props = {
  title?: string;
  archived?: boolean;
  projects?: Project[];
  loading?: boolean;
  onProjectSelect?: (project: Project) => void;
};

const ProjectList: React.FC<Props> = ({ loading, projects, archived, onProjectSelect }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    archived && setOpen(false);
  }, [archived]);

  return (
    <>
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

const ProjectListContainner = styled.div`
  > * {
    margin-top: ${metricsSizes["4xl"]}px;
  }
  > * {
    margin-bottom: ${metricsSizes["4xl"]}px;
  }
`;

export default ProjectList;
