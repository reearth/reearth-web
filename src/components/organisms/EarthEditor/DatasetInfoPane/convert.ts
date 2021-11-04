import { DatasetFragmentFragment, Maybe, Plugin, PluginExtensionType } from "@reearth/gql";

export const processDatasets = (
  rawDatasets: Maybe<DatasetFragmentFragment | undefined>[] | undefined,
): { [key: string]: string }[] => {
  return rawDatasets
    ? rawDatasets
        .filter((r): r is DatasetFragmentFragment => !!r)
        .map(r => processDataset(r.fields))
    : [];
};

const processDataset = (fields: DatasetFragmentFragment["fields"]): { [key: string]: string } => {
  const datasetFields = fields
    .map((f): [string, string] | undefined => {
      if (!f || !f.field) return undefined;
      return [f.field.name, String(f.value)];
    })
    .filter((f): f is [string, string] => !!f);
  return Object.fromEntries(datasetFields);
};

export const processDatasetHeaders = (
  rawDatasets: Maybe<DatasetFragmentFragment | undefined>[] | undefined,
): string[] => {
  const headers =
    rawDatasets?.flatMap(
      d => d?.fields.map(f => f.field?.name).filter((f): f is string => !!f) || [],
    ) || [];
  return Array.from(new Set(headers));
};

export const processPrimitives = (
  rawPlugins: Maybe<Pick<Plugin, "name" | "extensions"> | undefined>[],
): string[] => {
  const extensions =
    rawPlugins?.flatMap(p => p?.extensions.filter(e => e.type === PluginExtensionType.Primitive)) ||
    [];
  console.log(extensions);
  return [];
};
