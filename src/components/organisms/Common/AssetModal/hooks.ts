import { useCallback } from "react";

import { AssetsQuery, useAssetsQuery, useCreateAssetMutation } from "@reearth/gql";

export type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

export default (teamId?: string) => {
  const [createAssetMutation] = useCreateAssetMutation();
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

  const assetsPerPage = 20;

  const {
    data,
    // refetch,
    // loading,
    fetchMore,
    // networkStatus,
  } = useAssetsQuery({
    variables: { teamId: teamId ?? "", first: assetsPerPage },
    notifyOnNetworkStatusChange: true,
    skip: !teamId,
  });
  const hasNextPage = data?.assets.pageInfo.hasNextPage;
  const assets = data?.assets.edges.map(e => e.node) as AssetNodes;

  const getMoreAssets = useCallback(() => {
    if (hasNextPage) {
      fetchMore({
        variables: {
          first: assetsPerPage,
          after: data?.assets.pageInfo.endCursor,
          delay: true,
        },
      });
    }
  }, [data?.assets.pageInfo, fetchMore, hasNextPage]);

  return {
    assetsData: {
      assets,
      //   refetch,
      //   loading,
      getMoreAssets,
      createAssets,
      hasNextPage,
    },
  };
};
