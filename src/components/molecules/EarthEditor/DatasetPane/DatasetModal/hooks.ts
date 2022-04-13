import { useCallback, useState, useEffect, useMemo } from "react";
import useFileInput from "use-file-input";

import { SheetParameter } from "./Gdrive";

export default (
  extensionTypes?: string[],
  handleDatasetAdd?: (url: string | File, schemeId: string | null) => Promise<void>,
  handleGoogleSheetDatasetAdd?: (
    accessToken: string,
    fileId: string,
    sheetName: string,
    schemeId: string | null,
  ) => Promise<void>,
  onClose?: () => void,
) => {
  const [url, onUrlChange] = useState<string>();
  const [csv, changeCsv] = useState<File>();
  const [sheet, changeSheet] = useState<SheetParameter>();
  const [disabled, setDisabled] = useState(true);
  const [dataType, setDataType] = useState<string>();

  const AllDatasetTypes = useMemo(() => {
    const ReEarthDatasetTypes = ["csv", "gcms", "box", "drop", "gdrive"];
    return extensionTypes ? [...extensionTypes, ...ReEarthDatasetTypes] : ReEarthDatasetTypes;
  }, [extensionTypes]);

  const handleSetDataType = useCallback(
    (type?: string) => {
      if (type && AllDatasetTypes.includes(type)) {
        setDataType(type);
      } else {
        setDataType(undefined);
      }
    },
    [AllDatasetTypes],
  );

  const handleImport = useCallback(async () => {
    if (dataType === "gdrive") {
      if (!sheet || !handleGoogleSheetDatasetAdd) return;
      await handleGoogleSheetDatasetAdd(sheet.accessToken, sheet.fileId, sheet.sheetName, null);
    }
    const data = dataType === "csv" ? csv : url;
    if (!data || !handleDatasetAdd) return;
    await handleDatasetAdd(data, null);
  }, [dataType, url, csv, sheet, handleDatasetAdd, handleGoogleSheetDatasetAdd]);

  const onSelectCsvFile = useFileInput(
    (files: FileList) => {
      const file = files[0];
      if (!file) return;
      changeCsv(file);
      handleSetDataType("csv");
    },
    { accept: ".csv,text/csv", multiple: false },
  );

  const handleClose = useCallback(() => {
    changeCsv(undefined);
    changeSheet(undefined);
    onUrlChange(undefined);
    handleSetDataType(undefined);
    onClose?.();
  }, [onClose, handleSetDataType]);

  const onSheetSelect = useCallback(sheet => {
    changeSheet(sheet);
  }, []);

  const onReturn = useCallback(() => {
    onUrlChange(undefined);
    changeCsv(undefined);
    handleSetDataType(undefined);
    changeSheet(undefined);
  }, [handleSetDataType]);

  useEffect(() => {
    setDisabled(!(csv || url || sheet));
  }, [csv, url, sheet]);

  return {
    url,
    onUrlChange,
    csv,
    dataType,
    disabled,
    onSelectCsvFile,
    handleSetDataType,
    onReturn,
    onSheetSelect,
    handleImport,
    handleClose,
  };
};
