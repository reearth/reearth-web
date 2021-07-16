import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocalState } from "@reearth/state";
import {
  useProjectQuery,
  useAssetsQuery,
  useCheckProjectAliasLazyQuery,
  useUpdateProjectBasicAuthMutation,
  PublishmentStatus,
  usePublishProjectMutation,
  useUpdateProjectPublicTitleMutation,
  useUpdateProjectPublicDescriptionMutation,
  useUpdateProjectPublicImageMutation,
  useCreateAssetMutation,
} from "@reearth/gql";

import { Status } from "@reearth/components/atoms/PublicationStatus";
import { AssetNodes } from "../hooks";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [updateProjectBasicAuthMutation] = useUpdateProjectBasicAuthMutation();
  const [updateProjectPublicTitle] = useUpdateProjectPublicTitleMutation();
  const [updateProjectPublicDescription] = useUpdateProjectPublicDescriptionMutation();
  const [updateProjectPublicImage] = useUpdateProjectPublicImageMutation();
  const [createAssetMutation] = useCreateAssetMutation();
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
            imageUrl: rawProject.imageUrl,
            publicTitle: rawProject.publicTitle ?? undefined,
            publicDescription: rawProject.publicDescription ?? undefined,
            publicImage: rawProject.publicImage ?? undefined,
            isArchived: rawProject.isArchived,
            isBasicAuthActive: rawProject.isBasicAuthActive,
            basicAuthUsername: rawProject.basicAuthUsername,
            basicAuthPassword: rawProject.basicAuthPassword,
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

  // Basic auth
  const updateProjectBasicAuth = useCallback(
    (isBasicAuthActive?: boolean, basicAuthUsername?: string, basicAuthPassword?: string) => {
      projectId &&
        updateProjectBasicAuthMutation({
          variables: { projectId, isBasicAuthActive, basicAuthUsername, basicAuthPassword },
        });
    },
    [projectId, updateProjectBasicAuthMutation],
  );

  // Alias
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

  // Public
  const updatePublicTitle = useCallback(
    (publicTitle: string) => {
      projectId && updateProjectPublicTitle({ variables: { projectId, publicTitle } });
    },
    [projectId, updateProjectPublicTitle],
  );
  const updatePublicDescription = useCallback(
    (publicDescription: string) => {
      projectId && updateProjectPublicDescription({ variables: { projectId, publicDescription } });
    },
    [projectId, updateProjectPublicDescription],
  );
  const updatePublicImage = useCallback(
    (publicImage: string | null) => {
      projectId && updateProjectPublicImage({ variables: { projectId, publicImage } });
    },
    [projectId, updateProjectPublicImage],
  );

  // Assets
  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            Array.from(files).map(file =>
              createAssetMutation({ variables: { teamId, file }, refetchQueries: ["Assets"] }),
            ),
          );
        }
      })(),
    [createAssetMutation, teamId],
  );

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
    updatePublicTitle,
    updatePublicDescription,
    updatePublicImage,
    assets,
    createAssets,
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
