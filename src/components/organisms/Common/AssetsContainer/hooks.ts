import { useNavigate } from "@reach/router";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { useAssetsQuery, useCreateAssetMutation, useRemoveAssetMutation } from "@reearth/gql";
import { useTeam, useProject, useNotification, useSelectedAssets } from "@reearth/state";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type Params = {
  teamId: string;
  allowedAssetType?: "image" | "video" | "file";
  initialAsset?: { id?: string; url: string };
  isMultipleSelectable?: boolean;
  creationEnabled?: boolean;
  deletionEnabled?: boolean;
};

export default ({
  teamId,
  allowedAssetType,
  initialAsset,
  isMultipleSelectable,
  creationEnabled,
  deletionEnabled,
}: Params) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [, setNotification] = useNotification();
  const [currentTeam] = useTeam();
  const [currentProject] = useProject();
  const [selectedAssets, select] = useSelectedAssets();

  const selectAsset = useCallback(
    (asset?: { id?: string; url: string }) => {
      if (!asset) return;
      select(assets =>
        assets && isMultipleSelectable
          ? assets.find(a => a.id === asset.id)
            ? assets.filter(asset2 => asset2.id !== asset.id)
            : [asset, ...assets]
          : [asset],
      );
    },
    [select, isMultipleSelectable],
  );

  useEffect(() => {
    if (teamId && currentTeam?.id && teamId !== currentTeam.id) {
      navigate(`/settings/workspace/${currentTeam?.id}/asset`);
    }
  }, [teamId, currentTeam, navigate]);

  const currentTeamId = currentTeam?.id;

  const { data, refetch } = useAssetsQuery({
    variables: { teamId: currentTeamId ?? "" },
    skip: !currentTeamId,
  });
  const assets = data?.assets.nodes
    .filter(
      a =>
        !allowedAssetType ||
        (a
          ? a.url.match(
              allowedAssetType === "image"
                ? /\.(jpg|jpeg|png|gif|webp)$/
                : allowedAssetType === "video"
                ? /\.(mp4|webm)$/
                : /\.*$/,
            )
          : Boolean),
    )
    .reverse() as Asset[];

  const initialAsset2 = initialAsset?.id
    ? assets?.find(a => a.id === initialAsset?.id)
    : initialAsset;

  const [createAssetMutation] = useCreateAssetMutation();
  const createAssets = useCallback(
    (files: FileList) =>
      (async () => {
        if (!currentTeamId) return;

        const results = await Promise.all(
          Array.from(files).map(async file => {
            const result = await createAssetMutation({
              variables: { teamId: currentTeamId, file },
            });
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
    [createAssetMutation, refetch, currentTeamId, setNotification, intl],
  );

  const [removeAssetMutation] = useRemoveAssetMutation();
  const removeAsset = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!currentTeamId) return;
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
        select();
      })(),
    [removeAssetMutation, currentTeamId, setNotification, select, intl],
  );

  useEffect(() => {
    if (initialAsset2) {
      select([initialAsset2]);
    }
    return () => {
      select(undefined);
    };
  }, [initialAsset2, select]);

  return {
    currentProject,
    currentTeam,
    assets,
    selectedAssets,
    selectAsset,
    createAssets: creationEnabled ? createAssets : undefined,
    removeAsset: deletionEnabled ? removeAsset : undefined,
  };
};
