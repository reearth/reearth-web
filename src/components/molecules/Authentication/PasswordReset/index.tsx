import { Link } from "@reach/router";
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
  onPasswordResetRequest: (email: string) => void;
};

const PasswordReset: React.FC<Props> = ({ onPasswordResetRequest }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(email.length < 1);
    console.log(email);
    console.log(email.length > 0);
  }, [email]);

  const handleUsernameInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setEmail(newValue);
    },
    [],
  );

  const handlePasswordResetRequest = useCallback(() => {
    onPasswordResetRequest(email);
    setSent(true);
  }, [email, onPasswordResetRequest]);

  return (
    <AuthPage>
      {sent ? (
        <SentFormWrapper direction="column" align="center" justify="center">
          <SentForm direction="column" align="center" justify="space-between">
            <Icon icon="mailCircle" color={theme.colors.brand.blue.strongest} />
            <Text size="l" customColor>
              {intl.formatMessage({ defaultMessage: "Check Your Email" })}
            </Text>
            <Text size="m" customColor>
              {intl.formatMessage({
                defaultMessage:
                  "Please check your inbox for instructions on how to verify your account.",
              })}
            </Text>
            <StyledButton
              className="form-item"
              large
              onClick={handlePasswordResetRequest}
              border
              color={theme.main.weak}
              background={theme.other.white}
              text={intl.formatMessage({ defaultMessage: "Resend email" })}
            />
          </SentForm>
          <StyledLink to={"/login"}>
            <Text
              size="xs"
              color={theme.main.link}
              weight="bold"
              otherProperties={{ marginLeft: "6px" }}>
              {intl.formatMessage({ defaultMessage: "Go to log in page." })}
            </Text>
          </StyledLink>
        </SentFormWrapper>
      ) : (
        <>
          <Icon className="form-item" icon="logoColorful" size={60} />
          <Text className="form-item" size="l" customColor>
            {intl.formatMessage({ defaultMessage: "Forgot Your Password?" })}
          </Text>
          <Text className="form-item" size="s" customColor>
            {intl.formatMessage({
              defaultMessage:
                "Enter your email address and we will send you instructions to reset your password.",
            })}
          </Text>
          <StyledInput
            className="form-item"
            placeholder={intl.formatMessage({ defaultMessage: "Email address" })}
            color={theme.main.weak}
            value={email}
            autoFocus
            onChange={handleUsernameInput}
          />
          <StyledButton
            className="form-item"
            large
            onClick={handlePasswordResetRequest}
            disabled={disabled}
            color={disabled ? theme.main.text : theme.other.white}
            background={disabled ? theme.main.weak : theme.main.link}
            text={intl.formatMessage({ defaultMessage: "Continue" })}
          />
          <StyledLink to={"/login"}>
            <Text size="xs" color={theme.main.link} weight="bold">
              {intl.formatMessage({ defaultMessage: "Go back to log in page" })}
            </Text>
          </StyledLink>
        </>
      )}
    </AuthPage>
  );
};

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

const StyledInput = styled.input<{ color?: string }>`
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  background: inherit;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 3px;
  padding: ${metricsSizes.s}px;
  outline: none;
  ${({ color }) => color && `color: ${color};`}

  :focus {
    border: 1px solid ${({ theme }) => theme.main.link};
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const SentFormWrapper = styled(Flex)`
  width: 100%;
  height: 400px;
`;

const SentForm = styled(Flex)`
  height: 250px;
`;

export default PasswordReset;
