import React from "react";
import { styled, fonts } from "@reearth/theme";
import { Link } from "@reach/router";
import { colors } from "@reearth/theme";

export type Props = {
  name: string;
  to: string;
};

const NavigationItem: React.FC<Props> = ({ name, to, children }) => {
  return (
    <>
      <LinkItem
        to={to}
        getProps={({ isCurrent }) =>
          isCurrent && {
            style: { background: colors.functional.select, color: colors.text.strong },
          }
        }>
        {name}
      </LinkItem>
      {children && <NavigationList>{children}</NavigationList>}
    </>
  );
};

const LinkItem = styled(Link)`
  display: flex;
  padding: 16px 8px;
  color: ${colors.text.main};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const NavigationList = styled.ul`
  padding-left: 12px;
  font-size: ${fonts.sizes.m}px;
`;

export default NavigationItem;
