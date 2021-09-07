import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "@reach/router";
import { useTeam, useProject, useNotification } from "@reearth/state";
import {
  useTeamsQuery,
  useSearchUserLazyQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberToTeamMutation,
  useUpdateMemberOfTeamMutation,
  Role,
  useRemoveMemberFromTeamMutation,
} from "@reearth/gql";
import { Role as RoleUnion } from "@reearth/components/molecules/Settings/Workspace/MemberListItem";
import { Team } from "@reearth/gql/graphql-client-api";

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const intl = useIntl();
  const [currentTeam, setTeam] = useTeam();
  const [currentProject] = useProject();
  const [, setNotification] = useNotification();

  const navigate = useNavigate();
  const [modalShown, setModalShown] = useState(false);
  const openModal = useCallback(() => setModalShown(true), []);

  const { data, loading, refetch } = useTeamsQuery();
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
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}`);
    }
  }, [params, currentTeam, navigate]);

  const teamId = currentTeam?.id;

  const [searchUserQuery, { data: searchUserData }] = useSearchUserLazyQuery();
  const searchedUser = searchUserData?.searchUser ?? undefined;

  const searchUser = useCallback(
    (nameOrEmail: string) => nameOrEmail && searchUserQuery({ variables: { nameOrEmail } }),
    [searchUserQuery],
  );

  const [createTeamMutation] = useCreateTeamMutation();
  const createTeam = useCallback(
    async (data: { name: string }) => {
      const results = await createTeamMutation({
        variables: { name: data.name },
        refetchQueries: ["teams"],
      });
      const team = results.data?.createTeam?.team;
      if (results.errors || !results.data?.createTeam) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to create workspace." }),
        });
      } else {
        setTeam(team);
        setNotification({
          type: "success",
          text: intl.formatMessage({ defaultMessage: "Sucessfully created a workspace!" }),
        });
      }
      setModalShown(false);
    },
    [createTeamMutation, setTeam, intl, setNotification],
  );

  const [updateTeamMutation] = useUpdateTeamMutation();

  const updateName = useCallback(
    async (name: string) => {
      if (!teamId) return;
      const teamName = await updateTeamMutation({ variables: { teamId, name } });
      if (teamName.errors || !teamName.data?.__typename) {
        setNotification({
          type: "error",
          text: intl.formatMessage({ defaultMessage: "Failed to update workspace name." }),
        });
      } else {
        setNotification({
          type: "info",
          text: intl.formatMessage({ defaultMessage: "You have changed the workspace's name." }),
        });
      }
    },
    [teamId, updateTeamMutation, intl, setNotification],
  );

  const [deleteTeamMutation] = useDeleteTeamMutation({
    refetchQueries: ["teams"],
  });
  const deleteTeam = useCallback(async () => {
    if (!teamId) return;
    const result = await deleteTeamMutation({ variables: { teamId } });
    if (result.errors || !result.data?.deleteTeam) {
      setNotification({
        type: "error",
        text: intl.formatMessage({ defaultMessage: "Failed to delete workspace." }),
      });
    } else {
      setNotification({
        type: "info",
        text: intl.formatMessage({ defaultMessage: "Workspace was successfully deleted." }),
      });
      setTeam(teams[0]);
    }
  }, [teamId, setTeam, teams, deleteTeamMutation, intl, setNotification]);

  const [addMemberToTeamMutation] = useAddMemberToTeamMutation();

  const addMembersToTeam = useCallback(
    async (userIds: string[]) => {
      const results = await Promise.all(
        userIds.map(async userId => {
          if (!teamId) return;
          const result = await addMemberToTeamMutation({
            variables: { userId, teamId, role: Role.Reader },
          });
          if (result.errors || !result.data?.addMemberToTeam) {
            setNotification({
              type: "error",
              text: intl.formatMessage({ defaultMessage: "Failed to add one or more members." }),
            });
          }
        }),
      );
      if (results) {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Successfully added member(s) to the workspace!",
          }),
        });
      }
    },
    [teamId, addMemberToTeamMutation, setNotification, intl],
  );

  const [updateMemberOfTeamMutation] = useUpdateMemberOfTeamMutation();

  const updateMemberOfTeam = useCallback(
    (userId: string, role: RoleUnion) => {
      if (teamId) {
        updateMemberOfTeamMutation({
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
      }
    },
    [teamId, updateMemberOfTeamMutation],
  );

  const [removeMemberFromTeamMutation] = useRemoveMemberFromTeamMutation();

  const removeMemberFromTeam = useCallback(
    async (userId: string) => {
      if (!teamId) return;
      const result = await removeMemberFromTeamMutation({ variables: { teamId, userId } });
      if (result.errors || !result.data?.removeMemberFromTeam) {
        setNotification({
          type: "error",
          text: intl.formatMessage({
            defaultMessage: "Failed to delete member from the workspace.",
          }),
        });
      } else {
        setNotification({
          type: "success",
          text: intl.formatMessage({
            defaultMessage: "Successfully removed member from the workspace.",
          }),
        });
      }
    },
    [teamId, removeMemberFromTeamMutation, intl, setNotification],
  );

  const selectWorkspace = useCallback(
    (team: Team) => {
      if (team.id) {
        setTeam(team);
        navigate(`/settings/workspace/${team.id}`);
      }
    },
    [navigate, setTeam],
  );

  return {
    me,
    teams,
    currentTeam,
    currentProject,
    searchedUser,
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
