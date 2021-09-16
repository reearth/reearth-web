import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
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

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [disabled, setDisabled] = useState(true);

  const tooShortRegex = /^(?=.{1,7}$)/;
  const tooLongRegex = /^(?=.{25,}$)/;
  const whitespaceRegex = /(?=.*\s)/;
  const highSecurityRegex = /^(?=.*[a-z])(?=.*[A-Z])((?=(.*\d){2}))/;
  const medSecurityRegex = /^((?=.*[a-z])(?=.*[A-Z])|(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d))/;
  const lowSecurityRegex = /^((?=\d)|(?=[a-z])|(?=[A-Z]))/;

  const regexMessage = useMemo(() => {
    switch (true) {
      case whitespaceRegex.test(password):
        return intl.formatMessage({
          defaultMessage: "No whitespace is allowed.",
        });
      case tooShortRegex.test(password):
        return intl.formatMessage({
          defaultMessage: "Too short.",
        });
      case tooLongRegex.test(password):
        return intl.formatMessage({
          defaultMessage: "That is terribly long.",
        });
      case highSecurityRegex.test(password):
        return intl.formatMessage({ defaultMessage: "That password is great!" });
      case medSecurityRegex.test(password):
        return intl.formatMessage({ defaultMessage: "That password is better." });
      case lowSecurityRegex.test(password):
        return intl.formatMessage({ defaultMessage: "That password is okay." });
      default:
        return intl.formatMessage({
          defaultMessage: "That password confuses me, but might be okay.",
        });
    }
  }, [password, intl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const save = useCallback(() => {
    if (password === passwordConfirmation) {
      updatePassword?.(password, passwordConfirmation);
      handleClose();
    }
  }, [updatePassword, handleClose, password, passwordConfirmation]);

  useEffect(() => {
    if (password !== passwordConfirmation || password === "" || passwordConfirmation === "") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordConfirmation]);

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Change Password" })}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          large
          disabled={disabled}
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Change your password now" })}
          onClick={save}
        />
      }>
      {hasPassword ? (
        <div>
          <Text size="s" color={theme.main.text} otherProperties={{ margin: "22px auto" }}>
            <p>
              {intl.formatMessage({
                defaultMessage: `In order to protect your account, make sure your password:`,
              })}
            </p>
            <StyledList>
              <li>
                {intl.formatMessage({
                  defaultMessage: `Is between 8 and 25 characters in length`,
                })}
              </li>
              <li>
                {intl.formatMessage({
                  defaultMessage: `Has at least 2 different numbers`,
                })}
              </li>
              <li>
                {intl.formatMessage({
                  defaultMessage: `Uses lowercase and uppercase letters`,
                })}
              </li>
            </StyledList>
          </Text>
          <Label size="s">{intl.formatMessage({ defaultMessage: "New password" })}</Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={password}
            message={password ? regexMessage : undefined}
            onChange={setPassword}
            doesChangeEveryTime
            color={
              whitespaceRegex.test(password) || tooLongRegex.test(password) ? "red" : undefined
            }
          />
          <Label size="s">
            {intl.formatMessage({ defaultMessage: "New password (for confirmation)" })}
          </Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
            doesChangeEveryTime
          />
        </div>
      ) : (
        <div>
          <Label size="s">{intl.formatMessage({ defaultMessage: "New password" })}</Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <Button
            large
            disabled={disabled}
            buttonType="primary"
            text={intl.formatMessage({ defaultMessage: "Set your password now" })}
            onClick={save}
          />
        </div>
      )}
    </Modal>
  );
};

const StyledTextBox = styled(TextBox)`
  padding: 0;
  margin: 20px -5px 40px;
`;

const Label = styled(Text)`
  margin: 20px auto;
`;

const StyledList = styled.ul`
  margin: 20px auto;
`;

export default PasswordModal;
