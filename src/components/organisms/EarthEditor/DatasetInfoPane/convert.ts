import { Maybe } from "graphql/jsutils/Maybe";

type DatasetFields = string[]

type Dataset = {[k in DatasetFields[number]]: any};

const processDataset = (rawDatasets: any) => {
  console.log();
}