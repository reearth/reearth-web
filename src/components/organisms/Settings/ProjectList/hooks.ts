import { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "@reach/router";

import {
  useMeQuery,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  Visualizer,
  useAssetsQuery,
  useCreateAssetMutation,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";
import { Project } from "@reearth/components/molecules/Dashboard/types";
import { AssetNodes } from "@reearth/components/organisms/EarthEditor/PropertyPane/hooks-queries";
import { Type as NotificationType } from "@reearth/components/atoms/NotificationBar";

const toPublishmentStatus = (s: PublishmentStatus) =>
  s === PublishmentStatus.Public
    ? "published"
    : s === PublishmentStatus.Limited
    ? "limited"
    : "unpublished";

export default () => {
  const [{ currentTeam, notification }, setLocalState] = useLocalState(s => ({
    error: s.error,
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
    notification: s.notification,
  }));
  const navigate = useNavigate();
  const intl = useIntl();

  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useMeQuery();
  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["Project"],
  });
  const [createScene] = useCreateSceneMutation();
  const [createAssetMutation] = useCreateAssetMutation();

  const teamId = currentTeam?.id;
  const team = teamId ? data?.me?.teams.find(team => team.id === teamId) : data?.me?.myTeam;

  useEffect(() => {
    if (team?.id && !currentTeam?.id) {
      setLocalState({ currentTeam: team });
    }
  }, [currentTeam, team, setLocalState]);

  const notificationTimeout = 3000;

  // useEffect(() => {
  //   if (!error) return;
  //   setLocalState({
  //     notification: {
  //       type: "error",
  //       text: error,
  //     },
  //   });
  //   const timerID = setTimeout(() => {
  //     setLocalState({ error: undefined });
  //   }, notificationTimeout);
  //   return () => clearTimeout(timerID);
  // }, [error, setLocalState]);

  useEffect(() => {
    if (!notification?.text) return;
    const timerID = setTimeout(
      () =>
        setLocalState({
          notification: undefined,
        }),
      notificationTimeout,
    );
    return () => clearTimeout(timerID);
  }, [notification, setLocalState]);

  // const onNotificationClose = useCallback(() => {
  //   if (error) {
  //     setLocalState({ error: undefined });
  //   }
  // }, [error, setLocalState]);

  const onNotify = useCallback(
    (type?: NotificationType, text?: string) => {
      if (!type || !text) return;
      setLocalState({
        notification: {
          type: type,
          text: text,
        },
      });
    },
    [setLocalState],
  );

  const currentProjects = (team?.projects.nodes ?? [])
    .map<Project | undefined>(project =>
      project
        ? {
            id: project.id,
            description: project.description,
            name: project.name,
            imageUrl: project.imageUrl,
            isArchived: project.isArchived,
            status: toPublishmentStatus(project.publishmentStatus),
            sceneId: project.scene?.id,
          }
        : undefined,
    )
    .filter((project): project is Project => !!project && project?.isArchived === false);

  const archivedProjects = (team?.projects.nodes ?? [])
    .map<Project | undefined>(project =>
      project
        ? {
            id: project.id,
            description: project.description,
            name: project.name,
            imageUrl: project.imageUrl,
            isArchived: project.isArchived,
            status: toPublishmentStatus(project.publishmentStatus),
            sceneId: project.scene?.id,
          }
        : undefined,
    )
    .filter((project): project is Project => !!project && project?.isArchived === true);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  // Submit Form
  const createProject = useCallback(
    async (data: { name: string; description: string; imageUrl: string | null }) => {
      if (!teamId) return;
      const project = await createNewProject({
        variables: {
          teamId,
          visualizer: Visualizer.Cesium,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
        },
      });
      if (project.errors || !project.data?.createProject) {
        throw new Error(intl.formatMessage({ defaultMessage: "Failed to create project." }));
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors || !scene.data?.createScene) {
        throw new Error(intl.formatMessage({ defaultMessage: "Failed to create project." }));
      }
      setModalShown(false);
      onNotify(
        "info",
        intl.formatMessage({ defaultMessage: "You have created a new project! 🎉" }),
      );
      refetch();
    },
    [createNewProject, createScene, intl, onNotify, refetch, teamId],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id) {
        setLocalState({ currentProject: project });
        navigate(`/settings/project/${project.id}`);
      }
    },
    [navigate, setLocalState],
  );

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

  return {
    currentProjects,
    archivedProjects,
    teamId,
    loading,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    assets,
    createAssets,
  };
};
