import React from "react";
import { useIntl } from "react-intl";
import { styled, useTheme } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Loading from "@reearth/components/atoms/Loading";
import Divider from "@reearth/components/atoms/Divider";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";
import AssetCard from "@reearth/components/molecules/Common/AssetModal/AssetCard";
import AssetListItem from "@reearth/components/molecules/Common/AssetModal/AssetListItem";
import Button from "@reearth/components/atoms/Button";
import useHooks, { GoolgeSheet, SheetParameter } from "./hooks";

export type Props = {
  onReturn: () => void;
  onSheetSelect: (sheet: SheetParameter) => void;
  syncLoading: boolean;
};

const Gdrive: React.FC<Props> = ({ onReturn, syncLoading, onSheetSelect }) => {
  const intl = useIntl();
  const theme = useTheme();

  const {
    isLoading,
    pickedFile,
    pickedFileSheets,
    selectedSheet,
    handleSheetSelect,
    handleClientLoad,
  } = useHooks(onSheetSelect);

  return (
    <>
      <StyledIcon icon={"arrowLongLeft"} size={24} onClick={onReturn} />
      {syncLoading && <Loading />}
      {pickedFile?.id && (
        <>
          <Flex justify="center" align="center">
            <GdriveIcon size={32} icon="googleDrive" />
            <Text size="m" color={theme.main.strongText} weight="bold">
              {intl.formatMessage({ defaultMessage: "Connect with Google Drive" })}
            </Text>
          </Flex>
          <Divider margin="24px" />
          <Flex justify="center">
            <AssetCard
              isImage={false}
              name={pickedFile.name}
              cardSize="medium"
              icon="sheetFile"
              iconSize="50px"
              onCheck={() => handleClientLoad()}
            />
          </Flex>
          <Divider margin="24px" />
          <AssetWrapper direction="column" justify="space-between">
            <AssetList wrap="nowrap" justify="space-between">
              {pickedFileSheets?.map((sheetItem: GoolgeSheet) => (
                <AssetListItem
                  key={sheetItem.properties.sheetId}
                  asset={{ id: sheetItem.properties.sheetId, name: sheetItem.properties.title }}
                  isImage={false}
                  onCheck={() => {
                    handleSheetSelect({
                      id: sheetItem.properties.sheetId,
                      name: sheetItem.properties.title,
                    });
                  }}
                  selected={sheetItem.properties.sheetId === selectedSheet?.id}
                />
              ))}
            </AssetList>
          </AssetWrapper>
          <Divider margin="24px" />
        </>
      )}

      {!pickedFile?.id && (
        <>
          <Flex justify="center" align="center">
            <GdriveIcon size={32} icon="googleDrive" />
            <Text size="m" color={theme.main.strongText} weight="bold">
              {intl.formatMessage({ defaultMessage: "Connect with Google Drive" })}
            </Text>
          </Flex>
          <Divider margin="24px" />
          <Flex justify="center">
            <Text
              size="m"
              color={theme.colors.text.weak}
              otherProperties={{ marginBottom: metricsSizes["m"] + "px" }}>
              {intl.formatMessage({
                defaultMessage: "Re:earth supports Google Sheets, and CSV file to upload.",
              })}
            </Text>
          </Flex>
          <Flex justify="center">
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                large
                text="Connect your google account"
                buttonType="primary"
                onClick={() => handleClientLoad()}
              />
            )}
          </Flex>
        </>
      )}
    </>
  );
};

const GdriveIcon = styled(Icon)`
  margin-right: ${metricsSizes["m"]}px;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
`;

const AssetList = styled(Flex)`
  flex-direction: column;
  max-height: 458px;
  overflow-y: scroll;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  &::after {
    content: "";
    flex: "0 33%";
  }
`;

const AssetWrapper = styled(Flex)`
  height: 425px;
`;

export default Gdrive;
