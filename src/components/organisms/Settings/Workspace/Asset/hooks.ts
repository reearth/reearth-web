import { useCallback, useEffect } from "react";
import { useNavigate } from "@reach/router";
import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const [{ currentTeam, currentProject }] = useLocalState(s => ({
    currentTeam: s.currentTeam,
    currentProject: s.currentProject,
  }));
  const navigate = useNavigate();

  useEffect(() => {
    if (params.teamId && currentTeam?.id && params.teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [params, currentTeam, navigate]);

  const teamId = currentTeam?.id;

  const { data, refetch } = useAssetsQuery({ variables: { teamId: teamId ?? "" }, skip: !teamId });
  const assets = data?.assets.nodes.filter(Boolean) as AssetNodes;

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
    (assets: Asset[]) =>
      (async () => {
        if (teamId) {
          await Promise.all(
            assets.map(asset => {
              const assetId = asset.id;
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
