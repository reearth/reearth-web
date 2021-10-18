import { Link } from "@reach/router";
import React from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

import AuthPage from "..";

export type Props = {
  login: () => void;
};

const Login: React.FC<Props> = ({ login }) => {
  const intl = useIntl();
  const theme = useTheme();

  return (
    <AuthPage login={login}>
      <Text className="form-item" size="l" customColor>
        {intl.formatMessage({ defaultMessage: "Welcome" })}
      </Text>
      <Text className="form-item" size="s" customColor>
        {intl.formatMessage({ defaultMessage: "Log in to Re:Earth to continue." })}
      </Text>
      <StyledInput className="form-item" placeholder="username or email" color={theme.main.weak} />
      <StyledInput
        className="form-item"
        placeholder="password"
        type="password"
        autoComplete="new-password"
        color={theme.main.weak}
      />
      <Text
        className="form-item"
        size="xs"
        color={theme.main.link}
        otherProperties={{ width: "100%", alignSelf: "left" }}>
        {intl.formatMessage({ defaultMessage: "Forgot password?" })}
      </Text>
      <StyledButton
        className="form-item"
        large
        onClick={login}
        text={intl.formatMessage({ defaultMessage: "Continue" })}
      />
      <Footer className="form-item">
        <Text size="xs" color={theme.main.weak}>
          {intl.formatMessage({ defaultMessage: "Don't have an account?" })}
        </Text>
        <StyledLink to={"/signup"}>
          <Text size="xs" color={theme.main.link} otherProperties={{ marginLeft: "6px" }}>
            {intl.formatMessage({ defaultMessage: "Sign up" })}
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

const StyledInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  background: inherit;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 3px;
  padding: 8px;
  outline: none;

  :focus {
    border: 2px solid ${({ theme }) => theme.main.brandBlue};
    margin: -1px -1px 23px -1px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Footer = styled(Flex)`
  width: 100%;
`;

export default Login;
