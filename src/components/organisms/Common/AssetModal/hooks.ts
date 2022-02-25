import { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import { AssetsQuery, useAssetsQuery, useCreateAssetMutation, Maybe } from "@reearth/gql";
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
  const [sortType, setSortType] = useState<Maybe<AssetSortType>>();
  const [searchTerm, setSearchTerm] = useState("");

  const assetsPerPage = 20;

  const { data, refetch, loading, fetchMore, networkStatus } = useAssetsQuery({
    variables: {
      teamId: teamId ?? "",
      sort: sortType,
      keyword: searchTerm,
      pagination: { first: assetsPerPage },
    },
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
    [createAssetMutation, setNotification, refetch, teamId, intl],
  );

  return {
    assetsData: {
      assets,
      isLoading: loading ?? isRefetching,
      getMoreAssets,
      createAssets,
      hasNextPage,
    },
    setSearchTerm,
    setSortType,
  };
};
