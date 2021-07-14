import { useCallback, useMemo } from "react";
import {
  useProjectQuery,
  useUpdateProjectNameMutation,
  useUpdateProjectDescriptionMutation,
  useUpdateProjectImageUrlMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
  useCreateAssetMutation,
  AssetsQuery,
  useAssetsQuery,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const [currentTeam] = useLocalState(s => s.currentTeam);

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

  // Project Updating
  const [updateProjectNameMutation] = useUpdateProjectNameMutation();
  const [updateProjectDescriptionMutation] = useUpdateProjectDescriptionMutation();
  const [updateProjectImageUrlMutation] = useUpdateProjectImageUrlMutation();
  const [archiveProjectMutation] = useArchiveProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["Me"],
  });

  const updateProjectName = useCallback(
    (name: string) => {
      projectId && updateProjectNameMutation({ variables: { projectId, name } });
    },
    [projectId, updateProjectNameMutation],
  );

  const deleteProject = useCallback(() => {
    projectId && deleteProjectMutation({ variables: { projectId } });
  }, [projectId, deleteProjectMutation]);

  const updateProjectDescription = useCallback(
    (description: string) => {
      projectId && updateProjectDescriptionMutation({ variables: { projectId, description } });
    },
    [projectId, updateProjectDescriptionMutation],
  );

  const updateProjectImageUrl = useCallback(
    (imageUrl: string | null) => {
      projectId && updateProjectImageUrlMutation({ variables: { projectId, imageUrl } });
    },
    [projectId, updateProjectImageUrlMutation],
  );

  const archiveProject = useCallback(
    (archived: boolean) => {
      projectId && archiveProjectMutation({ variables: { projectId, archived } });
    },
    [projectId, archiveProjectMutation],
  );

  const [createAssetMutation] = useCreateAssetMutation();
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

  const { data: assetsData } = useAssetsQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });
  const assets = assetsData?.assets.nodes.filter(Boolean) as AssetNodes;

  return {
    project,
    projectId,
    currentTeam,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    createAssets,
    assets,
  };
};
