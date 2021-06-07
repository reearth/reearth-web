import React, { useState } from "react";
import { Link } from "@reach/router";
import { styled } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import Navigation from "@reearth/components/molecules/Settings/Navigation";
import Header, { Props as HeaderProps } from "@reearth/components/molecules/Common/Header";
import ProjectMenu from "@reearth/components/molecules/Common/ProjectMenu";
import Icon from "@reearth/components/atoms/Icon";

type Props = {} & HeaderProps;

const SettingPage: React.FC<Props> = ({
  children,
  currentTeam,
  currentProject,
  sceneId,
  ...props
}) => {
  const center = currentProject && (
    <ProjectMenu currentProject={currentProject} teamId={currentTeam?.id} />
  );

  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Wrapper>
      <Header
        {...props}
        currentTeam={currentTeam}
        icon={
          currentProject && (
            <StyledLink to={`/edit/${sceneId}`}>
              <StyledIcon icon="earthEditor" size={25} />
            </StyledLink>
          )
        }
        center={center}
      />
      <Wrapper3>
        <LeftWrapper>
          <Navigation team={currentTeam} project={currentProject} />
        </LeftWrapper>
        <RightWrapper>
          <DeviceMenu>
            <button onClick={handleClick}>
              {isOpen === true ? (
                <StyledIcon icon="cancel" size={32} />
              ) : (
                <StyledIcon icon="menu" size={32} />
              )}
            </button>
            {isOpen && (
              <Menu>
                <Navigation team={currentTeam} project={currentProject} />
              </Menu>
            )}
          </DeviceMenu>
          {children}
        </RightWrapper>
      </Wrapper3>
    </Wrapper>
  );
};

//这个才是整体页面
const Wrapper = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.bg[2]};
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

//这里是左边导航栏+右边内容
const Wrapper3 = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
`;

const LeftWrapper = styled.div`
  width: 264px;
  background-color: ${({ theme }) => theme.colors.bg[3]};
  @media only screen and (max-width: 1024px) {
    display: none;
  }
`;

const RightWrapper = styled.div`
  flex: 1;
  margin: 0 auto;
  padding: 32px 32px;
  max-width: 1200px;
  box-sizing: border-box;

  > * {
    margin-bottom: 32px;
  }
`;

const DeviceMenu = styled.div`
  width: 100%;
  height: 48px;
  display: none;

  @media only screen and (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

const Menu = styled.div`
  width: 264px;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.bg[4]};
  z-index: 80; ////这里一会要加到z-index里面去
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.main};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  margin-right: 8px;
  padding: 5px 4px 5px 8px;
  color: ${colors.text.main};

  &:hover {
    background: ${({ theme }) => theme.colors.bg[5]};
  }
`;

export default SettingPage;
