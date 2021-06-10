import React from "react";
import { useIntl } from "react-intl";
import { styled, useTheme } from "@reearth/theme";

import Icon from "@reearth/components/atoms/Icon";
import Flex from "@reearth/components/atoms/Flex";
import Loading from "@reearth/components/atoms/Loading";
import Divider from "@reearth/components/atoms/Divider";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes } from "@reearth/theme/metrics";
import Button from "@reearth/components/atoms/Button";

export type Props = {
  onReturn: () => void;
  syncLoading: boolean;
};

const Gdrive: React.FC<Props> = ({ onReturn, syncLoading }) => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <>
      <StyledIcon icon={"arrowLongLeft"} size={24} onClick={onReturn} />
      {syncLoading ? (
        <Loading />
      ) : (
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
            <Button
              large
              text="Connect your google account"
              buttonType="primary"
              onClick={() => null}
            />
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

export default Gdrive;
