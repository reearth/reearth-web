import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
} from "@reearth/gql";
import { useTeam, useProject, useNotification } from "@reearth/state";

type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  const teamId = currentTeam?.id;

  const assetsPerPage = 20;

  const { data, refetch, loading, fetchMore, networkStatus } = useAssetsQuery({
    variables: { teamId: teamId ?? "", pagination: { first: assetsPerPage } },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });

  const hasNextPage = data?.assets.pageInfo.hasNextPage;
  const isRefetching = networkStatus === 3;
  const assets = data?.assets.edges.map(e => e.node) as AssetNodes;

  const getMoreAssets = useCallback(() => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          pagination: {
            first: assetsPerPage,
            after: data?.assets.pageInfo.endCursor,
          },
          delay: true,
        },
      });
    }
  }, [data?.assets.pageInfo, fetchMore, hasNextPage]);

  const [createAssetMutation] = useCreateAssetMutation();

  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (!teamId) return;

        const results = await Promise.all(
          Array.from(files).map(async file => {
            const result = await createAssetMutation({ variables: { teamId, file } });
            if (result.errors || !result.data?.createAsset) {
              setNotification({
                type: "error",
                text: intl.formatMessage({ defaultMessage: "Failed to add one or more assets." }),
              });
            }
          }),
        );
        if (results) {
          setNotification({
            type: "success",
            text: intl.formatMessage({ defaultMessage: "Successfully added one or more assets." }),
          });
          await refetch();
        }
      })(),
    [createAssetMutation, refetch, teamId, setNotification, intl],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();

  const removeAsset = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!teamId) return;
        const results = await Promise.all(
          assetIds.map(async assetId => {
            const result = await removeAssetMutation({
              variables: { assetId },
              refetchQueries: ["Assets"],
            });
            if (result.errors || result.data?.removeAsset) {
              setNotification({
                type: "error",
                text: intl.formatMessage({
                  defaultMessage: "Failed to delete one or more assets.",
                }),
              });
            }
          }),
        );
        if (results) {
          setNotification({
            type: "info",
            text: intl.formatMessage({
              defaultMessage: "One or more assets were successfully deleted.",
            }),
          });
        }
      })(),
    [removeAssetMutation, teamId, setNotification, intl],
  );

  return {
    currentProject,
    currentTeam,
    assetsData: {
      assets,
      isLoading: loading ?? isRefetching,
      getMoreAssets,
      createAssets,
      hasNextPage,
      removeAsset,
    },
  };
};
