import { Link } from "@reach/router";
import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";

export type Props = {
  resetPassword?: () => void;
};

const ResetPassword: React.FC<Props> = () => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <AuthPage>
      <Icon className="form-item" icon="logoColorful" size={60} />
      <Text className="form-item" size="l" customColor>
        {intl.formatMessage({ defaultMessage: "Forgot your password?" })}
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
      />
      <StyledButton
        className="form-item"
        large
        onClick={() => alert("Tried to sign up")}
        text={intl.formatMessage({ defaultMessage: "Send" })}
      />
      <Footer className="form-item" justify="center">
        <StyledLink to={"/"}>
          <StyledIcon icon="arrowLongLeft" size={16} />
          <Text size="xs" customColor weight="bold">
            {intl.formatMessage({ defaultMessage: "Back to Log in." })}
          </Text>
        </StyledLink>
      </Footer>
    </AuthPage>
  );
};

const StyledButton = styled(Button)`
  width: 100%;
  background: ${({ theme }) => theme.main.link};
  border: none;
  border-radius: 2px;
  color: ${({ theme }) => theme.other.white};
`;

const StyledIcon = styled(Icon)`
  margin-right: 5px;
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
    border: 2px solid ${({ theme }) => theme.main.brandBlue};
    margin: -1px -1px 23px -1px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.main.link};
`;

const Footer = styled(Flex)`
  width: 100%;
`;

export default ResetPassword;
