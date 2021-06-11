import { useCallback, useEffect } from "react";
import { useNavigate } from "@reach/router";
import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
} from "@reearth/gql";
import { useLocalState } from "@reearth/state";

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
    (file: File) =>
      (async () => {
        if (teamId) {
          await createAssetMutation({
            variables: { teamId, file },
            refetchQueries: ["Assets"],
          });
        }
      })(),
    [createAssetMutation, teamId],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();

  const removeAsset = useCallback(
    (assetId: string) =>
      (async () => {
        await removeAssetMutation({ variables: { assetId } });

        await refetch();
      })(),
    [removeAssetMutation, refetch],
  );

  return {
    currentProject,
    currentTeam,
    assets,
    createAssets,
    removeAsset,
  };
};
