import { useNavigate } from "@reach/router";
import { useEffect, useCallback, useMemo, useState } from "react";

import { User } from "@reearth/components/molecules/Common/Header";
import {
  useMeQuery,
  useSceneQuery,
  useTeamsQuery,
  useProjectQuery,
  useCreateTeamMutation,
} from "@reearth/gql";
import { useError, useTeam, useProject } from "@reearth/state";

type Params = {
  teamId?: string;
  projectId?: string;
};

export default (params: Params) => {
  const projectId = params.projectId;

  const [error, setError] = useError();
  const [currentTeam, setTeam] = useTeam();
  const [currentProject, setProject] = useProject();

  const { refetch } = useMeQuery();

  const navigate = useNavigate();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
      navigate(`/settings/workspace/${currentTeam?.id}`);
    },
    [navigate, refetch, currentTeam?.id],
  );

  const { data: sceneData } = useSceneQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });
  const sceneId = sceneData?.scene?.id;
  const teamId = params.teamId ?? sceneData?.scene?.teamId;

  const { data: teamsData } = useTeamsQuery();
  const user: User = {
    name: teamsData?.me?.name ?? "",
  };
  const teams = teamsData?.me?.teams;
  const team = teams?.find(team => team.id === teamId);

  useEffect(() => {
    if (!currentTeam && teamsData?.me) {
      const { id, name = "" } = teamId
        ? teams?.find(t => t.id === teamId) ?? {}
        : teamsData.me.myTeam;
      if (id) {
        setTeam({ id, name });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam, team, setTeam, teams, teamsData?.me]);

  // update team name
  useEffect(() => {
    if (currentTeam?.id && teams) {
      const { name = "" } = teams?.find(t => t.id === currentTeam.id) ?? {};
      if (currentTeam.name != name) {
        setTeam({ id: currentTeam.id, name });
      }
    }
  }, [currentTeam, setTeam, teams]);

  useEffect(() => {
    if (team?.id && !currentTeam?.id) {
      setTeam(team);
    }
  }, [currentTeam, team, setTeam]);

  const { data } = useProjectQuery({
    variables: { teamId: teamId ?? "" },
    skip: !teamId,
  });

  useEffect(() => {
    if (!data) return;
    const project = data?.projects.nodes.find(node => node?.id === params.projectId) ?? undefined;

    if (project?.id !== currentProject?.id) {
      setProject(project);
    }
  }, [data, params, currentProject, setProject]);

  const changeTeam = useCallback(
    (teamId: string) => {
      const team = teams?.find(team => team.id === teamId);

      if (team) {
        setTeam(team);

        if (params.projectId) {
          navigate("/settings/account");
        }
      }
    },
    [teams, setTeam, params.projectId, navigate],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      const team = results.data?.createTeam?.team;
      if (results) {
        setTeam(team);
      }
    },
    [createTeamMutation, setTeam],
  );

  const notificationTimeout = 5000;

  const notification = useMemo<{ type: "error"; text: string } | undefined>(() => {
    return error ? { type: "error", text: error } : undefined;
  }, [error]);

  useEffect(() => {
    if (!error) return;
    const timerID = setTimeout(() => {
      setError(undefined);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [error, setError]);

  const onNotificationClose = useCallback(() => {
    if (error) {
      setError(undefined);
    }
  }, [error, setError]);

  const back = useCallback(() => navigate(-1), [navigate]);

  return {
    user,
    teams,
    currentTeam,
    currentProject,
    sceneId,
    createTeam,
    changeTeam,
    modalShown,
    openModal,
    handleModalClose,
    back,
    notification,
    onNotificationClose,
  };
};
