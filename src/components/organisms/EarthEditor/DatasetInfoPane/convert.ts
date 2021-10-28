import { Maybe } from "graphql/jsutils/Maybe";

import { Dataset as RawDataset, DatasetField } from "@reearth/gql";

// type Dataset = {[k in DatasetFields[number]]: any};

export const processDataset = (rawDatasets: Maybe<RawDataset[]>): {}[] => {
  return rawDatasets
    ? rawDatasets.map(r => {
        return extractValueFromDatasetFields(r.fields);
      })
    : [];
};

// TODO: add type here
const extractValueFromDatasetFields = (fields: DatasetField[]): {} => {
  const datasetFields = fields.map((f): string[][] => {
    if (!f || !f.field) return [];
    return [f.field.name, f.value];
  });
  return Object.fromEntries(datasetFields);
};

export const processDatasetNames = (rawDataset: Maybe<RawDataset>): string[] => {
  return rawDataset?.fields ? rawDataset.fields.map(f => f.field?.name as string) : [];
};
