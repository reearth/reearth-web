import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { typographyStyles } from "@reearth/util/value";
import type { InfoboxProperty } from "../InfoBox";

export const Title = styled.div<{ infoboxProperty?: InfoboxProperty }>`
  color: ${props => props.theme.infoBox.mainText};
  font-size: ${fonts.sizes.xs}px;
  ${({ infoboxProperty }) => typographyStyles(infoboxProperty?.default?.typography)}
`;
