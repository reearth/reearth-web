import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Role as RoleUnion } from "@reearth/components/molecules/Settings/Workspace/MemberListItem";
import {
  useGetTeamsQuery,
  useGetUserBySearchLazyQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useUpdateMemberOfTeamMutation,
  Role,
  useRemoveMemberFromTeamMutation,
} from "@reearth/gql";
import { Team } from "@reearth/gql/graphql-client-api";
import { useT } from "@reearth/i18n";
import { useWorkspace, useProject, useNotification } from "@reearth/state";

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const t = useT();
  const [currentWorkspace, setWorkspace] = useWorkspace();

  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const navigate = useNavigate();
  const [searchedUser, changeSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
  }>();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useGetTeamsQuery();
  const me = { id: data?.me?.id, myTeam: data?.me?.myTeam.id };
  const teams = data?.me?.teams as Team[];

  const handleModalClose = useCallback(
    (r?: boolean) => {
      setModalShown(false);
      if (r) {
        refetch();
      }
    },
    [refetch],
  );

  useEffect(() => {
    if (params.teamId && currentWorkspace?.id && params.teamId !== currentWorkspace.id) {
      navigate(`/settings/workspaces/${currentWorkspace?.id}`);
    }
  }, [params, currentWorkspace, navigate]);

  const teamId = currentWorkspace?.id;

  const [useGetUserBySearchQuery, { data: searchUserData }] = useGetUserBySearchLazyQuery();

  useEffect(() => {
    changeSearchedUser(searchUserData?.searchUser ?? undefined);
  }, [searchUserData?.searchUser]);

  const searchUser = useCallback(
    (nameOrEmail: string) => nameOrEmail && useGetUserBySearchQuery({ variables: { nameOrEmail } }),
    [useGetUserBySearchQuery],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["GetTeams"],
      });
      const team = results.data?.createTeam?.team;
      if (results.errors || !results.data?.createTeam) {
        setNotification({
          type: "error",
          text: t("Failed to create workspace."),
        });
      } else {
        setWorkspace(team);
        setNotification({
          type: "success",
          text: t("Sucessfully created a workspace!"),
        });
      }
      setModalShown(false);
    },
    [createTeamMutation, setNotification, t, setWorkspace],
  );

  const [updateTeamMutation] = useUpdateTeamMutation();

  const updateName = useCallback(
    async (name?: string) => {
      if (!teamId || !name) return;
      const results = await updateTeamMutation({ variables: { teamId, name } });
      if (results.errors) {
        setNotification({
          type: "error",
          text: t("Failed to update workspace name."),
        });
      } else {
        setWorkspace(results.data?.updateTeam?.team);
        setNotification({
          type: "info",
          text: t("You have changed the workspace's name."),
        });
      }
    },
    [teamId, updateTeamMutation, t, setNotification, setWorkspace],
  );

  const [deleteTeamMutation] = useDeleteTeamMutation({
    refetchQueries: ["GetTeams"],
  });
  const deleteTeam = useCallback(async () => {
    if (!teamId) return;
    const result = await deleteTeamMutation({ variables: { teamId } });
    if (result.errors || !result.data?.deleteTeam) {
      setNotification({
        type: "error",
        text: t("Failed to delete workspace."),
      });
    } else {
      setNotification({
        type: "info",
        text: t("Workspace was successfully deleted."),
      });
      setWorkspace(teams[0]);
    }
  }, [teamId, deleteTeamMutation, setNotification, t, setWorkspace, teams]);

  const [addMemberToTeamMutation] = useAddMemberToTeamMutation();

  const addMembersToTeam = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async userId => {
          if (!teamId) return;
          const result = await addMemberToTeamMutation({
            variables: { userId, teamId, role: Role.Reader },
            refetchQueries: ["GetTeams"],
          });
          const team = result.data?.addMemberToTeam?.team;
          if (result.errors || !team) {
            setNotification({
              type: "error",
              text: t("Failed to add one or more members."),
            });
            return;
          }
          setWorkspace(team);
        }),
      );
      if (results) {
        setNotification({
          type: "success",
          text: t("Successfully added member(s) to the workspace!"),
        });
      }
    },
    [teamId, addMemberToTeamMutation, setWorkspace, setNotification, t],
  );

  const [updateMemberOfTeamMutation] = useUpdateMemberOfTeamMutation();

  const updateMemberOfTeam = useCallback(
    async (userId: string, role: RoleUnion) => {
      if (teamId) {
        const results = await updateMemberOfTeamMutation({
          variables: {
            teamId,
            userId,
            role: {
              READER: Role.Reader,
              WRITER: Role.Writer,
              OWNER: Role.Owner,
            }[role],
          },
        });
        const team = results.data?.updateMemberOfTeam?.team;
        if (team) {
          setWorkspace(team);
        }
      }
    },
    [teamId, setWorkspace, updateMemberOfTeamMutation],
  );

  const [removeMemberFromTeamMutation] = useRemoveMemberFromTeamMutation();

  const removeMemberFromTeam = useCallback(
    async (userId: string) => {
      if (!teamId) return;
      const result = await removeMemberFromTeamMutation({
        variables: { teamId, userId },
        refetchQueries: ["GetTeams"],
      });
      const team = result.data?.removeMemberFromTeam?.team;
      if (result.errors || !team) {
        setNotification({
          type: "error",
          text: t("Failed to delete member from the workspace."),
        });
        return;
      }
      setWorkspace(team);
      setNotification({
        type: "success",
        text: t("Successfully removed member from the workspace."),
      });
    },
    [teamId, removeMemberFromTeamMutation, setWorkspace, t, setNotification],
  );

  const selectWorkspace = useCallback(
    (team: Team) => {
      if (team.id) {
        setWorkspace(team);
        navigate(`/settings/workspaces/${team.id}`);
      }
    },
    [navigate, setWorkspace],
  );

  return {
    me,
    teams,
    currentWorkspace,
    currentProject,
    searchedUser,
    changeSearchedUser,
    createTeam,
    updateName,
    deleteTeam,
    searchUser,
    addMembersToTeam,
    updateMemberOfTeam,
    removeMemberFromTeam,
    selectWorkspace,
    openModal,
    modalShown,
    handleModalClose,
    loading,
  };
};
