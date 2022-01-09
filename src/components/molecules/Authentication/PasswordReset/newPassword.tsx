import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";
import { PasswordPolicy as PasswordPolicyType } from "../common";

export type PasswordPolicy = PasswordPolicyType;

export type Props = {
  onNewPasswordSubmit: (password: string) => void;
  passwordPolicy?: PasswordPolicy;
};

const NewPassword: React.FC<Props> = ({ onNewPasswordSubmit, passwordPolicy }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [password, setPassword] = useState<string>("");
  const [disabled, setDisabled] = useState(true);
  const [regexMessage, setRegexMessage] = useState("");

  const handlePasswordInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const password = e.currentTarget.value;
      setPassword(password);
      switch (true) {
        case passwordPolicy?.whitespace?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "No whitespace is allowed.",
            }),
          );
          break;
        case passwordPolicy?.tooShort?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "Too short.",
            }),
          );
          break;
        case passwordPolicy?.tooLong?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That is terribly long.",
            }),
          );
          break;
        case passwordPolicy?.highSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is great!" }));
          break;
        case passwordPolicy?.medSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is better." }));
          break;
        case passwordPolicy?.lowSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is okay." }));
          break;
        default:
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That password confuses me, but might be okay.",
            }),
          );
          break;
      }
    },
    [password], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePasswordSubmit = useCallback(() => {
    onNewPasswordSubmit(password);
  }, [password, onNewPasswordSubmit]);

  useEffect(() => {
    if (
      (passwordPolicy?.highSecurity && !passwordPolicy.highSecurity.test(password)) ||
      passwordPolicy?.tooShort?.test(password) ||
      passwordPolicy?.tooLong?.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordPolicy]);

  return (
    <AuthPage>
      <Icon className="form-item" icon="logoColorful" size={60} />
      <Text className="form-item" size="l" customColor>
        {intl.formatMessage({ defaultMessage: "Change Your Password" })}
      </Text>
      <Text className="form-item" size="s" customColor>
        {intl.formatMessage({
          defaultMessage: "Enter a new password below to change your password.",
        })}
      </Text>
      <StyledForm
        id="login-form"
        action={`${window.REEARTH_CONFIG?.api || "/api"}/login`}
        method="post"
        onSubmit={() => {
          console.log(password, "pw");
        }}>
        <input
          type="hidden"
          name="id"
          value={new URLSearchParams(window.location.search).get("id") ?? undefined}
        />
        <StyledInput
          className="form-item"
          name="password"
          placeholder={intl.formatMessage({ defaultMessage: "New password" })}
          type="password"
          autoComplete="new-password"
          color={theme.main.weak}
          value={password}
          onChange={handlePasswordInput}
        />
        <PasswordWrapper direction="column">
          <StyledInput
            className="form-item"
            placeholder={intl.formatMessage({ defaultMessage: "Password" })}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordInput}
            color={
              passwordPolicy?.tooLong?.test(password)
                ? theme.main.danger
                : passwordPolicy?.highSecurity?.test(password)
                ? theme.main.accent
                : theme.main.weak
            }
          />
          <PasswordMessage size="xs" customColor>
            {password ? regexMessage : undefined}
          </PasswordMessage>
        </PasswordWrapper>
        <StyledInput
          className="form-item"
          name="password"
          placeholder={intl.formatMessage({ defaultMessage: "Re-enter new password" })}
          type="password"
          autoComplete="new-password"
          color={theme.main.weak}
          value={password}
          onChange={handlePasswordInput}
        />
        <StyledButton
          className="form-item"
          large
          type="submit"
          disabled={disabled}
          onClick={handlePasswordSubmit}
          color={disabled ? theme.main.text : theme.other.white}
          background={disabled ? theme.main.weak : theme.main.link}
          text={intl.formatMessage({ defaultMessage: "Reset password" })}
        />
      </StyledForm>
    </AuthPage>
  );
};

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  > .form-item {
    margin-bottom: 24px;
  }
`;

const StyledButton = styled(Button)<{ color?: string; background?: string; border?: boolean }>`
  width: 100%;
  background: ${({ background }) => background};
  border: ${({ border, theme }) => (border ? `1px solid ${theme.main.borderStrong}` : "none")};
  border-radius: 2px;
  color: ${({ color }) => color};

  :hover {
    color: ${({ color }) => color};
    background: ${({ background }) => background};
  }
`;

const StyledInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  background: inherit;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 3px;
  padding: ${metricsSizes.s}px;
  outline: none;

  :focus {
    border: 2px solid ${({ theme }) => theme.main.link};
    margin: -1px -1px 23px -1px;
  }
`;

const PasswordWrapper = styled(Flex)`
  width: 100%;
  color: ${({ theme }) => theme.text.pale};
`;

const PasswordMessage = styled(Text)`
  margin-left: ${metricsSizes.m}px;
  margin-top: ${metricsSizes["2xs"]}px;
  font-style: italic;
`;

export default NewPassword;
