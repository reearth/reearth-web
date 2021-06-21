import React from "react";
import { styled, fonts, useTheme } from "@reearth/theme";
import { Link } from "@reach/router";

export type Props = {
  name: string;
  to: string;
};

const NavigationItem: React.FC<Props> = ({ name, to, children }) => {
  const theme = useTheme();
  return (
    <>
      <LinkItem
        to={to}
        getProps={({ isCurrent }) => isCurrent && { style: { background: theme.main.select } }}>
        {name}
      </LinkItem>
      {children && <NavigationList>{children}</NavigationList>}
    </>
  );
};

const LinkItem = styled(Link)`
  display: flex;
  padding: 16px;
  color: #ffffff;
  text-decoration: none;
  border-radius: 20px;

  &:hover {
    text-decoration: none;
  }
`;

const NavigationList = styled.ul`
  width: 100%;
  margin-left: 30px;
  padding: 0;
  font-size: ${fonts.sizes.m}px;
  font-weight: bold;
`;

export default NavigationItem;
