import React from "react";
import { useIntl } from "react-intl";
import NavigationItem from "@reearth/components/molecules/Settings/NavigationItem";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import Divider from "@reearth/components/atoms/Divider";
import Icon from "@reearth/components/atoms/Icon";

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
      <LogoWrapper>
        <Icon icon="logo" size="100px" />
      </LogoWrapper>
      <NavigationList>
        <NavigationItem
          to="/settings/account"
          name={intl.formatMessage({ defaultMessage: "My Account" })}
        />
        <Divider margin="0" />
        <NavigationItem
          to={`/settings/workspaces`}
          name={intl.formatMessage({ defaultMessage: "My Workspaces list" })}>
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
        <Divider margin="0" />
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

const LogoWrapper = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.main.text};
  margin-bottom: 32px;
`;

const NavigationList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: ${fonts.sizes.m}px;
`;

export default Navigation;
