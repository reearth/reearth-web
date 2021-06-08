import React from "react";
import { useIntl } from "react-intl";
import NavigationItem from "@reearth/components/molecules/Settings/NavigationItem";
import Logo from "@reearth/components/molecules/Settings/Logo";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

type Team = {
  id?: string;
  name?: string;
};

type Project = {
  id?: string;
  name?: string;
};

type Props = {
  team?: Team;
  project?: Project;
};

const Navigation: React.FC<Props> = ({ team, project }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Logo />
      <NavigationList>
        <NavigationItem
          to="/settings/account"
          name={intl.formatMessage({ defaultMessage: "My Account" })}
        />
        <Line />
        <NavigationItem
          to={`/settings/workspaces`}
          name={intl.formatMessage({ defaultMessage: "My Workspaces" })}>
          {team && (
            <NavigationItem
              to={`/settings/workspace/${team.id}`}
              key={team.id}
              name={team.name as string}>
              <NavigationItem
                to={`/settings/workspace/${team.id}/asset`}
                name={intl.formatMessage({ defaultMessage: "Assets" })}
              />
            </NavigationItem>
          )}
        </NavigationItem>
        <Line />
        <NavigationItem
          to={`/settings/workspace/${team?.id}/projects`}
          name={intl.formatMessage({ defaultMessage: "Projects list" })}>
          {project && (
            <NavigationItem to={`/settings/project/${project.id}`} name={project.name as string}>
              <NavigationItem
                to={`/settings/project/${project.id}/dataset`}
                name={intl.formatMessage({ defaultMessage: "Dataset" })}
              />
              <NavigationItem
                to={`/settings/project/${project.id}/plugins`}
                name={intl.formatMessage({ defaultMessage: "Plugins" })}
              />
            </NavigationItem>
          )}
        </NavigationItem>
      </NavigationList>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  box-sizing: border-box;
`;

const NavigationList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: ${fonts.sizes.m}px;
`;

const Line = styled.hr`
  border: 1px solid ${({ theme }) => theme.colors.outline.weakest};
  margin: 0;
`;

export default Navigation;
