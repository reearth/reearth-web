import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";
import React, { useEffect, useState } from "react";

export type Props = {
  lat?: number;
  lng?: number;
};

const LatLngIndicator: React.FC<Props> = ({ lat, lng }) => {
  const theme = useTheme();
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>();
  const updateMousePos = (ev: MouseEvent): any => {
    setMousePos({ x: ev.clientX, y: ev.clientY });
  };
  useEffect(() => {
    window.addEventListener("mousemove", updateMousePos as any);
    return () => window.removeEventListener("mousemove", updateMousePos as any);
  }, []);

  return (
    <Wrapper x={mousePos?.x} y={mousePos?.y}>
      <Box bg={theme.main.bg} p="s">
        <Flex direction="row">
          <Text size="s" color={theme.text.default}>
            {lat?.toString()},{" "}
          </Text>
          <Text size="s" color={theme.text.default}>
            {lng?.toString()}
          </Text>
        </Flex>
      </Box>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ x?: number; y?: number }>`
  z-index: ${({ theme }) => theme.zIndexes.infoBox};
  /* position: absolute; */
  position: fixed;
  left: ${props => props.x && props.x + 50}px;
  top: ${props => props.y && props.y + 50}px;
  /* right: 50px;
  bottom: 50px; */
`;

export default LatLngIndicator;
