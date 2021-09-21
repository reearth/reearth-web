import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  className?: string;
  project?: {
    id: string;
    name: string;
    isArchived: boolean;
  };
  team?: {
    id: string;
    name: string;
  };
  isVisible: boolean;
  archiveProject?: (archived: boolean) => void;
  onClose?: () => void;
  hasPassword: boolean;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
};

const PasswordModal: React.FC<Props> = ({ isVisible, onClose, hasPassword, updatePassword }) => {
  const intl = useIntl();
  const theme = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [regexMessage, setRegexMessage] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [disabled, setDisabled] = useState(true);

  const tooShortRegex = /^(?=.{1,7}$)/;
  const tooLongRegex = /^(?=.{25,}$)/;
  const whitespaceRegex = /(?=.*\s)/;
  const highSecurityRegex = /^(?=.*[a-z])(?=.*[A-Z])((?=(.*\d){2}))/;
  const medSecurityRegex = /^((?=.*[a-z])(?=.*[A-Z])|(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d))/;
  const lowSecurityRegex = /^((?=\d)|(?=[a-z])|(?=[A-Z]))/;

  const handlePasswordChange = useCallback(
    (password: string) => {
      switch (true) {
        case whitespaceRegex.test(password):
          setPassword(password);
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "No whitespace is allowed.",
            }),
          );
          break;
        case tooShortRegex.test(password):
          setPassword(password);
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "Too short.",
            }),
          );
          break;
        case tooLongRegex.test(password):
          setPassword(password);
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That is terribly long.",
            }),
          );
          break;
        case highSecurityRegex.test(password):
          setPassword(password);
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is great!" }));
          break;
        case medSecurityRegex.test(password):
          setPassword(password);
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is better." }));
          break;
        case lowSecurityRegex.test(password):
          setPassword(password);
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is okay." }));
          break;
        default:
          setPassword(password);
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That password confuses me, but might be okay.",
            }),
          );
          break;
      }
    },
    [intl, password], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClose = useCallback(() => {
    setOldPassword("");
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (password === passwordConfirmation) {
      updatePassword?.(password, passwordConfirmation);
      handleClose();
    }
  }, [updatePassword, handleClose, password, passwordConfirmation]);

  useEffect(() => {
    if (
      password !== passwordConfirmation ||
      tooShortRegex.test(password) ||
      tooLongRegex.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordConfirmation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      size="sm"
      title={intl.formatMessage({ defaultMessage: "Change Password" })}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          large
          disabled={disabled}
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Change password" })}
          onClick={handleSave}
        />
      }>
      {hasPassword ? (
        <div>
          <Text size="m">
            {intl.formatMessage({
              defaultMessage: `In order to protect your account, make sure your password:`,
            })}
          </Text>
          <SubText>
            <Text size="m">
              {intl.formatMessage({
                defaultMessage: `* Is between 8 and 25 characters in length`,
              })}
            </Text>

            <Text size="m">
              {intl.formatMessage({
                defaultMessage: `* Has at least 2 different numbers`,
              })}
            </Text>

            <Text size="m">
              {intl.formatMessage({
                defaultMessage: `* Uses lowercase and uppercase letters`,
              })}
            </Text>
          </SubText>
          <PasswordField direction="column">
            <Text size="m">{intl.formatMessage({ defaultMessage: "Old password" })}</Text>
            <TextBox
              type="password"
              borderColor={theme.main.border}
              value={oldPassword}
              onChange={setOldPassword}
              doesChangeEveryTime
            />
          </PasswordField>
          <PasswordField direction="column">
            <Text size="m">{intl.formatMessage({ defaultMessage: "New password" })}</Text>
            <TextBox
              type="password"
              borderColor={theme.main.border}
              value={password}
              message={password ? regexMessage : undefined}
              onChange={handlePasswordChange}
              doesChangeEveryTime
              color={
                whitespaceRegex.test(password) || tooLongRegex.test(password)
                  ? theme.main.danger
                  : undefined
              }
            />
          </PasswordField>
          <PasswordField direction="column">
            <Text size="m">
              {intl.formatMessage({ defaultMessage: "New password (for confirmation)" })}
            </Text>
            <TextBox
              type="password"
              borderColor={theme.main.border}
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              doesChangeEveryTime
            />
          </PasswordField>
        </div>
      ) : (
        <div>
          <Text size="s">{intl.formatMessage({ defaultMessage: "New password" })}</Text>
          <TextBox
            type="password"
            borderColor={theme.main.border}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <Button
            large
            disabled={disabled}
            buttonType="primary"
            text={intl.formatMessage({ defaultMessage: "Set your password now" })}
            onClick={handleSave}
          />
        </div>
      )}
    </Modal>
  );
};

const SubText = styled.div`
  margin: ${({ theme }) =>
    `${theme.metrics["xl"]}px auto ${theme.metrics["xl"]}px ${theme.metrics.l}px`};
`;

const PasswordField = styled(Flex)`
  // background: red;
  height: 75px;
`;

export default PasswordModal;
