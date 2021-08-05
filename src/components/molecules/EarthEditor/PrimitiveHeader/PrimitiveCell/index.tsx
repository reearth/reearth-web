import React from "react";

import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";

import useHooks from "./hooks";
import HelpButton from "@reearth/components/atoms/HelpButton";

interface Props {
  className?: string;
  name: string;
  description: string;
  icon?: string;
  onDrop?: (
    layerId?: string,
    index?: number,
    location?: {
      lat: number;
      lng: number;
      height: number;
    },
  ) => void;
}

const PrimitiveCell: React.FC<Props> = ({ className, icon, name, description, onDrop }) => {
  const { ref } = useHooks(onDrop);

  return (
    <HelpButton
      descriptionTitle={name}
      description={description}
      balloonDirection="bottom"
      gap={15}>
      <Wrapper ref={ref} className={className}>
        <StyledIcon icon={icon} alt={name} size={20} />
      </Wrapper>
    </HelpButton>
  );
};

const Wrapper = styled.div`
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 30px;
  border-radius: 3px;
  user-select: none;
`;

const StyledIcon = styled(Icon)`
  padding: 8px;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  color: ${props => props.theme.main.text};
  &:hover {
    background: ${props => props.theme.main.lighterBg};
    color: ${props => props.theme.main.strongText};
  }
`;

export default PrimitiveCell;
