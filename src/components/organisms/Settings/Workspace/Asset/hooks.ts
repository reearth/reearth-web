import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";

import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
} from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";

type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  const teamId = currentTeam?.id;

  const { data, refetch } = useAssetsQuery({ variables: { teamId: teamId ?? "" }, skip: !teamId });
  const assets = data?.assets.nodes.filter(Boolean).reverse() as AssetNodes;

  const [createAssetMutation] = useCreateAssetMutation();

  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            Array.from(files).map(file => createAssetMutation({ variables: { teamId, file } })),
          );

          await refetch();
        }
      })(),
    [createAssetMutation, refetch, teamId],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();

  const removeAsset = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            assetIds.map(assetId => {
              removeAssetMutation({ variables: { assetId }, refetchQueries: ["Assets"] });
            }),
          );
        }
      })(),
    [removeAssetMutation, teamId],
  );

  return {
    currentProject,
    currentTeam,
    assets,
    createAssets,
    removeAsset,
  };
};
