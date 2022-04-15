import { styled } from "@reearth/theme";

const Avatar = styled.div<{ size: number; avatar?: string; color?: string; radius?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0px;
  position: relative;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  border-radius: ${({ radius }) => radius}%;
  background: ${({ avatar, color }) => (avatar ? `url(${avatar});` : color)};
`;

export default Avatar;
