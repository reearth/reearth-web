import { useNavigate } from "@reach/router";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useIntl } from "react-intl";

import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
  Maybe,
} from "@reearth/gql";
import { useTeam, useProject, useNotification } from "@reearth/state";

type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export enum AssetSortType {
  Date = "DATE",
  Name = "NAME",
  Size = "SIZE",
}

export type Params = {
  teamId: string;
};

export default (params: Params) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const teamId = currentTeam?.id;
  const assetsPerPage = 20;

  const [sort, setSort] = useState<{ type?: Maybe<AssetSortType>; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  const pagination = useMemo(() => {
    if (!sort || (sort?.type === "DATE" && !sort?.reverse) || (sort?.type && sort?.reverse)) {
      return {
        last: assetsPerPage,
      };
    } else {
      return {
        first: assetsPerPage,
      };
    }
  }, [sort]);

  const { data, refetch, loading, fetchMore, networkStatus } = useAssetsQuery({
    variables: {
      teamId: teamId ?? "",
      pagination,
    },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });

  const hasMoreAssets = data?.assets.pageInfo.hasNextPage || data?.assets.pageInfo.hasPreviousPage;
  const isRefetching = networkStatus === 3;
  const assets = data?.assets.edges.map(e => e.node) as AssetNodes;

  const getMoreAssets = useCallback(() => {
    if (hasMoreAssets) {
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
  }, [data?.assets.pageInfo, fetchMore, hasMoreAssets]);

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

  const handleSortChange = useCallback(
    (type?: string, reverse?: boolean) => {
      if (!type && reverse === undefined) return;
      setSort({
        type: (type as AssetSortType) ?? sort?.type,
        reverse: reverse ?? (type === "DATE" || type !== sort?.type ? false : sort?.reverse),
      });
      refetch({
        sort: type as AssetSortType,
      });
      setSearchTerm(undefined);
    },
    [sort, refetch],
  );

  const handleSearchTerm = useCallback(
    (term?: string) => {
      setSearchTerm(term);
      refetch({
        keyword: term,
      });
    },
    [refetch],
  );

  return {
    currentProject,
    currentTeam,
    assetsData: {
      assets,
      isLoading: loading ?? isRefetching,
      getMoreAssets,
      createAssets,
      hasMoreAssets,
      removeAsset,
      sort,
      handleSortChange,
      searchTerm,
      handleSearchTerm,
    },
  };
};
