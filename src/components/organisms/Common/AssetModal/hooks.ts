import { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
  Maybe,
} from "@reearth/gql";
import { useNotification } from "@reearth/state";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export enum AssetSortType {
  Date = "DATE",
  Name = "NAME",
  Size = "SIZE",
}

export default (teamId?: string) => {
  const intl = useIntl();
  const [, setNotification] = useNotification();
  const [sort, setSort] = useState<{ type?: Maybe<AssetSortType>; reverse?: boolean }>();
  const [searchTerm, setSearchTerm] = useState<string>();
  const assetsPerPage = 20;

  const pagination = useCallback(
    (endCursor?: string | null) => {
      const reverseOrder =
        (!sort?.type && !sort?.reverse) ||
        (sort?.type === "DATE" && !sort?.reverse) ||
        (sort?.type !== "DATE" && sort?.reverse);

      return {
        after: !reverseOrder ? endCursor : undefined,
        before: reverseOrder ? endCursor : undefined,
        first: !reverseOrder ? assetsPerPage : undefined,
        last: reverseOrder ? assetsPerPage : undefined,
      };
    },
    [sort],
  );

  const { data, refetch, loading, fetchMore, networkStatus } = useAssetsQuery({
    variables: {
      teamId: teamId ?? "",
      pagination: pagination(),
      sort: sort?.type,
    },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });

  const hasMoreAssets =
    data?.assets.pageInfo?.hasNextPage || data?.assets.pageInfo?.hasPreviousPage;
  const isRefetching = networkStatus === 3;
  const assets = data?.assets.edges?.map(e => e.node) as AssetNodes;

  const getMoreAssets = useCallback(() => {
    if (hasMoreAssets) {
      fetchMore({
        variables: {
          teamId: teamId ?? "",
          pagination: pagination(data?.assets.pageInfo.endCursor),
          delay: true,
          notifyOnNetworkStatusChange: true,
        },
      });
    }
  }, [data?.assets.pageInfo, teamId, pagination, fetchMore, hasMoreAssets]);

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
    [createAssetMutation, setNotification, refetch, teamId, intl],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();
  const removeAssets = useCallback(
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
        reverse: !!reverse,
      });
    },
    [sort],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (sort || searchTerm) {
      refetch({
        sort: sort?.type,
        keyword: searchTerm,
      });
    }
  }, [sort, searchTerm, refetch]);

  return {
    assets,
    isLoading: loading ?? isRefetching,
    hasMoreAssets,
    sort,
    searchTerm,
    getMoreAssets,
    createAssets,
    removeAssets,
    handleSortChange,
    handleSearchTerm,
  };
};
