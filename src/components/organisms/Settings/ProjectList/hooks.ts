import { useNavigate } from "@reach/router";
import { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { Project } from "@reearth/components/molecules/Dashboard/types";
import {
  useGetMeQuery,
  PublishmentStatus,
  useCreateProjectMutation,
  useCreateSceneMutation,
  useGetTeamProjectsQuery,
  Visualizer,
  GetProjectsQuery,
} from "@reearth/gql";
import { useTeam, useProject, useNotification } from "@reearth/state";

const toPublishmentStatus = (s: PublishmentStatus) =>
  s === PublishmentStatus.Public
    ? "published"
    : s === PublishmentStatus.Limited
    ? "limited"
    : "unpublished";

export type ProjectNodes = NonNullable<GetProjectsQuery["projects"]["nodes"][number]>[];

const projectPerPage = 5;

export default (teamId: string) => {
  const [, setNotification] = useNotification();
  const [currentTeam, setTeam] = useTeam();
  const [, setProject] = useProject();
  const navigate = useNavigate();
  const intl = useIntl();

  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useGetMeQuery();
  const [createNewProject] = useCreateProjectMutation({
    refetchQueries: ["GetTeamProjects"],
  });
  const [createScene] = useCreateSceneMutation();

  if (currentTeam && currentTeam.id !== teamId) {
    teamId = currentTeam?.id;
  }
  const team = teamId ? data?.me?.teams.find(team => team.id === teamId) : data?.me?.myTeam;

  const {
    data: projectData,
    loading: queryProject,
    fetchMore,
    networkStatus,
  } = useGetTeamProjectsQuery({
    variables: { teamId: teamId ?? "", includeArchived: false, last: projectPerPage },
    skip: !teamId,
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: archProjectData,
    loading: archQueryProject,
    fetchMore: archFetchMore,
    networkStatus: archNetworkStatus,
  } = useGetTeamProjectsQuery({
    variables: {
      teamId: teamId ?? "",
      includeArchived: true,
      last: projectPerPage,
    },
    skip: !teamId,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (team?.id && !currentTeam?.id) {
      setTeam(team);
    }
  }, [currentTeam, team, setTeam]);

  const projectNodes = projectData?.projects.edges.map(e => e.node) as ProjectNodes;
  const archProjectNodes = archProjectData?.projects.edges.map(e => e.node) as ProjectNodes;

  const currentProjects = (projectNodes ?? [])
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
    .filter((project): project is Project => !!project);

  const archivedProjects = (archProjectNodes ?? [])
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

  const totalArchived = archivedProjects.length;
  const totalCurrent = currentProjects.length;

  const hasMoreProjects =
    projectData?.projects.pageInfo?.hasNextPage || projectData?.projects.pageInfo?.hasPreviousPage;

  const hasMoreArchProjects =
    archProjectData?.projects.pageInfo?.hasNextPage ||
    archProjectData?.projects.pageInfo?.hasPreviousPage;

  const isRefetchingProjects = networkStatus === 3;
  const isRefetchingArchProjects = archNetworkStatus === 3;

  const handleGetMoreProjects = useCallback(() => {
    if (hasMoreProjects) {
      fetchMore({
        variables: {
          before: projectData?.projects.pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [projectData?.projects.pageInfo, fetchMore, hasMoreProjects]);

  const handleGetMoreArchProjects = useCallback(() => {
    if (hasMoreArchProjects) {
      archFetchMore({
        variables: {
          before: archProjectData?.projects.pageInfo?.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
    }
  }, [archProjectData?.projects.pageInfo, archFetchMore, hasMoreArchProjects]);

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
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create project." }),
        });
        setModalShown(false);
        return;
      }
      const scene = await createScene({
        variables: { projectId: project.data.createProject.project.id },
      });
      if (scene.errors || !scene.data?.createScene) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create project." }),
        });
        setModalShown(false);
        return;
      }
      setNotification({
        type: "success",
        text: intl.formatMessage({ defaultMessage: "Successfully created project!" }),
      });
      setModalShown(false);
      refetch();
    },
    [createNewProject, createScene, intl, refetch, setNotification, teamId],
  );

  const selectProject = useCallback(
    (project: Project) => {
      if (project.id) {
        setProject(project);
        navigate(`/settings/project/${project.id}`);
      }
    },
    [navigate, setProject],
  );

  const [assetModalOpened, setOpenAssets] = useState(false);
  const [selectedAsset, selectAsset] = useState<string | undefined>(undefined);

  const toggleAssetModal = useCallback(
    () => setOpenAssets(!assetModalOpened),
    [assetModalOpened, setOpenAssets],
  );

  const onAssetSelect = useCallback((asset?: string) => {
    if (!asset) return;
    selectAsset(asset);
  }, []);

  return {
    currentProjects,
    archivedProjects,
    totalCurrent,
    totalArchived,
    loadingProjects: queryProject ?? isRefetchingProjects,
    loadingArchProjects: archQueryProject ?? isRefetchingArchProjects,
    hasMoreProjects,
    hasMoreArchProjects,
    teamId,
    loading,
    modalShown,
    openModal,
    handleModalClose,
    createProject,
    selectProject,
    selectedAsset,
    assetModalOpened,
    toggleAssetModal,
    onAssetSelect,
    handleGetMoreProjects,
    handleGetMoreArchProjects,
  };
};
