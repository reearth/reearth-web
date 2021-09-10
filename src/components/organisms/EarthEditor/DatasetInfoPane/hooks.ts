import { useGetAllDataSetsQuery } from "@reearth/gql";
import { useSceneId, useSelected } from "@reearth/state";
import { useMemo } from "react";

export default () => {
  const [selected, _] = useSelected();
  const [sceneId] = useSceneId();

  const { data, loading: _loading } = useGetAllDataSetsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !sceneId,
  });

  console.log(data);
  const datasetSchema = useMemo(
    () =>
      selected?.type === "dataset"
        ? data?.datasetSchemas.nodes.filter(d => d?.id === selected.datasetSchemaId)
        : undefined,
    [data?.datasetSchemas.nodes, selected],
  );

  console.log("ds-------", datasetSchema);

  return { hoge: "hoge" };
};
