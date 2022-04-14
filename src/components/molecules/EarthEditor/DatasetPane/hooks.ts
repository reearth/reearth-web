import { useState, useCallback } from "react";
import { useIntl } from "react-intl";

import { parseHost, DataSource as RawDataSource } from "@reearth/util/path";

export type DataSource = RawDataSource;

export type DatasetSchema = {
  id: string;
  name: string;
  source: DataSource;
  totalCount?: number;
};

export default (
  datasetSchemas?: DatasetSchema[],
  onDatasetImport?: (file: File, datasetSchemaId: string | null) => void | Promise<void>,
  onDatasetSync?: (url: string) => void | Promise<void>,
  onGoogleSheetDatasetImport?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    datasetSchemaId: string | null,
  ) => void | Promise<void>,
) => {
  const intl = useIntl();

  const [datasetSyncOpen, setDatasetSyncOpen] = useState(false);
  const [datasetSyncLoading, setDatasetSyncLoading] = useState(false);
  const openDatasetModal = useCallback(() => setDatasetSyncOpen(true), []);
  const closeDatasetModal = useCallback(() => setDatasetSyncOpen(false), []);

  const handleGoogleSheetDatasetAdd = useCallback(
    async (accessToken: string, fileId: string, sheetName: string, schemeId: string | null) => {
      setDatasetSyncLoading(true);
      try {
        await onGoogleSheetDatasetImport?.(accessToken, fileId, sheetName, schemeId);
      } finally {
        setDatasetSyncLoading(false);
      }
      setDatasetSyncOpen(false);
    },
    [onGoogleSheetDatasetImport, setDatasetSyncLoading, setDatasetSyncOpen],
  );

  const handleDatasetAdd = useCallback(
    async (data: string | File, schemeId: string | null) => {
      setDatasetSyncLoading(true);
      try {
        typeof data === "string"
          ? await onDatasetSync?.(data)
          : await onDatasetImport?.(data, schemeId);
      } finally {
        setDatasetSyncLoading(false);
      }
      setDatasetSyncOpen(false);
    },
    [onDatasetImport, onDatasetSync, setDatasetSyncLoading, setDatasetSyncOpen],
  );

  const byHost = (datasetSchemas || []).reduce((acc, ac) => {
    const host = parseHost(ac.source);
    const identifier = host || intl.formatMessage({ defaultMessage: "Other Source" });

    acc[identifier] = [...(acc[identifier] || []), ac];
    return acc;
  }, {} as { [host: string]: DatasetSchema[] });

  return {
    datasetSyncOpen,
    datasetSyncLoading,
    byHost,
    handleGoogleSheetDatasetAdd,
    handleDatasetAdd,
    openDatasetModal,
    closeDatasetModal,
  };
};
