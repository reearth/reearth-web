import { useGetAllDataSetsQuery, useGetDatasetsQuery } from "@reearth/gql";
import { useSceneId, useSelected } from "@reearth/state";
import { useMemo } from "react";

type DatasetSchemaFields = string[]

export default () => {
  const [selected, _] = useSelected();
  const [sceneId] = useSceneId();

  // const { data: datasetSchemas, loading: datasetSchemaLoading } = useGetAllDataSetsQuery({
  //   variables: { sceneId: sceneId || "" },
  //   skip: !sceneId,
  // });

  const {data:rawDatasets, loading: datasetsLoading} = useGetDatasetsQuery({
    variables: {datasetSchemaId: selected?.type === "dataset" ? selected.datasetSchemaId : "", first:100},
    skip: selected?.type !== "dataset"
  })
  const datasets = useMemo(
    () =>
    {
      return rawDatasets?.datasets.nodes
    },
    [rawDatasets?.datasets.nodes, selected],
  );

  // const datasetSchemaFields = datasetSchema?.fields.map(f => f.name)

  console.log(datasets);


  // console.log("raw------", datasetSchemas);

  return { datasetSchema: "hoge" , datasetSchemaFields: "hoge"};
};
