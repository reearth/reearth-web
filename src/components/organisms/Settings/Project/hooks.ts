import { useCallback, useMemo, useState } from "react";

import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useArchiveProjectMutation,
  useDeleteProjectMutation,
} from "@reearth/gql";
import { useT } from "@reearth/i18n";
import { useTeam, useNotification } from "@reearth/state";

type Params = {
  projectId: string;
};

export default ({ projectId }: Params) => {
  const t = useT();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();

  const teamId = currentTeam?.id;

  const { data } = useGetProjectsQuery({
    variables: { teamId: teamId ?? "", first: 100 },
    skip: !teamId,
  });

  const rawProject = useMemo(
    () => data?.projects.edges.find(p => p.node?.id === projectId),
    [data, projectId],
  );

  const project = useMemo(
    () =>
      rawProject?.node?.id
        ? {
            id: rawProject?.node?.id,
            name: rawProject?.node?.name,
            description: rawProject?.node?.description,
            publicTitle: rawProject?.node?.publicTitle,
            publicDescription: rawProject?.node?.publicDescription,
            isArchived: rawProject?.node?.isArchived,
            isBasicAuthActive: rawProject?.node?.isBasicAuthActive,
            basicAuthUsername: rawProject?.node?.basicAuthUsername,
            basicAuthPassword: rawProject?.node?.basicAuthPassword,
            imageUrl: rawProject?.node?.imageUrl,
            alias: rawProject?.node?.alias,
            publishmentStatus: rawProject?.node?.publishmentStatus,
          }
        : undefined,
    [rawProject],
  );

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [archiveProjectMutation] = useArchiveProjectMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation({
    refetchQueries: ["GetProjects"],
  });

  const updateProjectName = useCallback(
    (name?: string) => {
      if (!projectId || !name) return;
      updateProjectMutation({ variables: { projectId, name } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectDescription = useCallback(
    (description?: string) => {
      if (!projectId || !description) return;
      updateProjectMutation({ variables: { projectId, description } });
    },
    [projectId, updateProjectMutation],
  );

  const updateProjectImageUrl = useCallback(
    (imageUrl?: string) => {
      if (!projectId) return;
      if (!imageUrl) {
        updateProjectMutation({ variables: { projectId, deleteImageUrl: true } });
      } else {
        updateProjectMutation({ variables: { projectId, imageUrl } });
      }
    },
    [projectId, updateProjectMutation],
  );

  const archiveProject = useCallback(
    async (archived: boolean) => {
      if (!projectId) return;
      const results = await archiveProjectMutation({ variables: { projectId, archived } });
      if (results.errors) {
        setNotification({
          type: "error",
          text: archived ? t("Failed to archive project.") : t("Failed to unarchive project."),
        });
      } else {
        setNotification({
          type: "info",
          text: archived
            ? t("Successfully archived the project.")
            : t("Successfully unarchived the project. You can now edit this project."),
        });
      }
    },
    [projectId, t, setNotification, archiveProjectMutation],
  );

  const deleteProject = useCallback(async () => {
    if (!projectId) return;
    const results = await deleteProjectMutation({ variables: { projectId } });
    if (results.errors) {
      setNotification({
        type: "error",
        text: t("Failed to delete project."),
      });
    } else {
      setNotification({
        type: "info",
        text: t("Project was successfully deleted."),
      });
    }
  }, [projectId, t, setNotification, deleteProjectMutation]);

  const [assetModalOpened, setOpenAssets] = useState(false);

  const toggleAssetModal = useCallback(
    (open?: boolean) => {
      if (!open) {
        setOpenAssets(!assetModalOpened);
      } else {
        setOpenAssets(open);
      }
    },
    [assetModalOpened, setOpenAssets],
  );

  return {
    project,
    projectId,
    currentTeam,
    updateProjectName,
    updateProjectDescription,
    updateProjectImageUrl,
    archiveProject,
    deleteProject,
    assetModalOpened,
    toggleAssetModal,
  };
};
