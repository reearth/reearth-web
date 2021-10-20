import React from "react";
import { useIntl } from "react-intl";

import Box from "@reearth/components/atoms/Box";
import ConfirmationModal from "@reearth/components/atoms/ConfirmationModal";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { useTheme } from "@reearth/theme";

export type Props = {
  onCancel: () => void;
  onProceed: () => void;
  onClose: () => void;
  isOpen: boolean;
};

const DeleteModal: React.FC<Props> = ({ onCancel, onProceed, onClose, isOpen }) => {
  const intl = useIntl();
  const theme = useTheme();
  return (
    <ConfirmationModal
      buttonAction={intl.formatMessage({ defaultMessage: "Uninstall" })}
      body={
        <>
          <Icon icon="alert" size={24} color={theme.main.danger} />
          <Box mt={"2xl"} mb={"m"}>
            <Text size="m">
              {intl.formatMessage({
                defaultMessage:
                  "You are uninstalling the selected plugin. The data used by this plugin may also be deleted.",
              })}
            </Text>
          </Box>
          <Text size="m">
            {intl.formatMessage({
              defaultMessage: "Please be sure before uninstalling.",
            })}
          </Text>
        </>
      }
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onCancel}
      onProceed={onProceed}
    />
  );
};

export default DeleteModal;
