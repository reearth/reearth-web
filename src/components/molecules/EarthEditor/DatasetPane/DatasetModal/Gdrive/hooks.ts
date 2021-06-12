import { useCallback, useEffect, useState } from "react";

declare const gapi: any;
declare const google: any;

export type SheetParameter = {
  accessToken: string;
  fileId: string;
  sheetName: string;
};

export type GoolgeSheet = {
  properties: {
    gridProperties: { rowCount: number; columnCount: number };
    index: number;
    sheetId: string;
    sheetType: string;
    title: string;
  };
};

export type File = {
  id: string;
  name: string;
};

export default (onSheetSelect: (sheet: SheetParameter) => void) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pickerApiLoaded, setPickerApiLoaded] = useState<boolean>(false);
  const [pickedFile, setPickedFile] = useState<File>();
  const [pickedFileSheets, setPickedFileSheets] = useState<GoolgeSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<File>();
  const [accessToken, setAccessToken] = useState("");

  const pickerCallback = async (data: any) => {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      setPickedFile({ name: data.docs[0].name, id: data.docs[0].id });
      gapi.client.sheets.spreadsheets
        .get({
          spreadsheetId: data.docs[0].id,
        })
        .then(function (response: any) {
          setPickedFileSheets(response.result.sheets as GoolgeSheet[]);
        });
    }
  };

  useEffect(() => {
    const googleApiKey = window.REEARTH_CONFIG?.googleApiKey;
    if (pickerApiLoaded && accessToken) {
      setIsLoading(false);
      const picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.SPREADSHEETS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(googleApiKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    }
  }, [accessToken, pickerApiLoaded]);

  const handleClientLoad = async () => {
    setIsLoading(true);
    const googleClientId = window.REEARTH_CONFIG?.googleClientId;
    await gapi.load("client:auth2", () => {
      gapi.client
        .init({
          client_id: googleClientId,
          scope: "https://www.googleapis.com/auth/spreadsheets",
          immediate: false,
          discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        })
        .then(function () {
          setAccessToken(
            gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
          );
        });
    });
    gapi.load("picker", () => {
      setPickerApiLoaded(true);
    });
  };

  const handleSheetSelect = useCallback(
    (sheet: File) => {
      setSelectedSheet({ id: sheet.id, name: sheet.name });
      onSheetSelect({
        accessToken,
        fileId: pickedFile?.id as string,
        sheetName: sheet.name as string,
      });
    },
    [onSheetSelect, accessToken, pickedFile?.id],
  );

  useEffect(() => {
    const gDriveScript = document.createElement("script");
    gDriveScript.src = "https://apis.google.com/js/api.js";
    gDriveScript.async = true;
    gDriveScript.onload = () => {
      setIsLoading(false);
    };
    document.body.appendChild(gDriveScript);
    return () => {
      document.body.removeChild(gDriveScript);
    };
  }, []);

  return {
    isLoading,
    pickedFile,
    pickedFileSheets,
    selectedSheet,
    handleSheetSelect,
    handleClientLoad,
  };
};
