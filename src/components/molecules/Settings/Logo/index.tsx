import React from "react";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <Icon icon="logo" size="100px" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.main.text};
  margin-bottom: 32px;
`;

export default Logo;
