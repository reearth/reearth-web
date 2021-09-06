import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "@reach/router";
import {
  AssetsQuery,
  useAssetsQuery,
  useCreateAssetMutation,
  useRemoveAssetMutation,
} from "@reearth/gql";
import { useTeam, useProject } from "@reearth/state";
import useNotification from "@reearth/notifications/hooks";

type AssetNodes = NonNullable<AssetsQuery["assets"]["nodes"][number]>[];

type Params = {
  teamId: string;
};

export default (params: Params) => {
  const intl = useIntl();
  const { notify } = useNotification();
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
        if (!teamId) return;

        const results = await Promise.all(
          Array.from(files).map(async file => {
            const result = await createAssetMutation({ variables: { teamId, file } });
            if (result.errors || !result.data?.createAsset) {
              notify(
                "error",
                intl.formatMessage({ defaultMessage: "Failed to add one or more assets." }),
              );
            }
          }),
        );
        if (results) {
          notify(
            "success",
            intl.formatMessage({ defaultMessage: "Successfully added one or more assets." }),
          );
          await refetch();
        }
      })(),
    [createAssetMutation, refetch, teamId, notify, intl],
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
              notify(
                "error",
                intl.formatMessage({ defaultMessage: "Failed to delete one or more assets." }),
              );
            }
          }),
        );
        if (results) {
          notify(
            "info",
            intl.formatMessage({ defaultMessage: "One or more assets were successfully deleted." }),
          );
        }
      })(),
    [removeAssetMutation, teamId, notify, intl],
  );

  return {
    currentProject,
    currentTeam,
    assets,
    createAssets,
    removeAsset,
  };
};
