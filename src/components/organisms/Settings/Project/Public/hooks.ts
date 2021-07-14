import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalState } from "@reearth/state";
import {
  useProjectQuery,
  useCheckProjectAliasLazyQuery,
  useUpdateProjectBasicAuthMutation,
  PublishmentStatus,
  usePublishProjectMutation,
} from "@reearth/gql";

import { Status } from "@reearth/components/atoms/PublicationStatus";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [updateProjectBasicAuthMutation] = useUpdateProjectBasicAuthMutation();
  const [publishProjectMutation, { loading: loading }] = usePublishProjectMutation();
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));
  const [validAlias, setValidAlias] = useState(false);
  const [projectAlias, setProjectAlias] = useState<string | undefined>();
  const teamId = currentTeam?.id;

  const { data } = useProjectQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });

  const rawProject = useMemo(
    () => data?.projects.nodes.find(p => p?.id === projectId),
    [data, projectId],
  );
  const project = useMemo(
    () =>
      rawProject?.id
        ? {
            id: rawProject.id,
            name: rawProject.name,
            description: rawProject.description,
            publicTitle: rawProject.publicTitle,
            publicDescription: rawProject.publicDescription,
            isArchived: rawProject.isArchived,
            isBasicAuthActive: rawProject.isBasicAuthActive,
            basicAuthUsername: rawProject.basicAuthUsername,
            basicAuthPassword: rawProject.basicAuthPassword,
            imageUrl: rawProject.imageUrl,
            alias: rawProject.alias,
            publishmentStatus: rawProject.publishmentStatus,
          }
        : undefined,
    [rawProject],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  const updateProjectBasicAuth = useCallback(
    (isBasicAuthActive?: boolean, basicAuthUsername?: string, basicAuthPassword?: string) => {
      projectId &&
        updateProjectBasicAuthMutation({
          variables: { projectId, isBasicAuthActive, basicAuthUsername, basicAuthPassword },
        });
    },
    [projectId, updateProjectBasicAuthMutation],
  );

  const [checkProjectAliasQuery, { loading: validatingAlias, data: checkProjectAliasData }] =
    useCheckProjectAliasLazyQuery();
  const checkProjectAlias = useCallback(
    (alias: string) => {
      if (project?.alias && project.alias === alias) {
        setValidAlias(true);
        return;
      }
      return checkProjectAliasQuery({ variables: { alias } });
    },
    [checkProjectAliasQuery, project],
  );

  useEffect(() => {
    if (!project) return;
    setProjectAlias(project?.alias);
  }, [project]);

  useEffect(() => {
    setValidAlias(
      !validatingAlias &&
        !!project &&
        !!checkProjectAliasData &&
        (project.alias === checkProjectAliasData.checkProjectAlias.alias ||
          checkProjectAliasData.checkProjectAlias.available),
    );
  }, [validatingAlias, checkProjectAliasData, project]);

  // Publication
  const publishProject = useCallback(
    async (alias: string | undefined, s: Status) => {
      if (!projectId) return;
      const gqlStatus =
        s === "limited"
          ? PublishmentStatus.Limited
          : s == "published"
          ? PublishmentStatus.Public
          : PublishmentStatus.Private;
      await publishProjectMutation({
        variables: { projectId, alias, status: gqlStatus },
      });
    },
    [projectId, publishProjectMutation],
  );

  return {
    currentTeam,
    currentProject,
    projectAlias,
    projectStatus: convertStatus(project?.publishmentStatus),
    project,
    updateProjectBasicAuth,
    publishProject,
    validAlias,
    checkProjectAlias,
    validatingAlias,
    loading,
  };
};

const convertStatus = (status?: PublishmentStatus): Status | undefined => {
  switch (status) {
    case "PUBLIC":
      return "published";
    case "LIMITED":
      return "limited";
    case "PRIVATE":
      return "unpublished";
  }
  return undefined;
};
