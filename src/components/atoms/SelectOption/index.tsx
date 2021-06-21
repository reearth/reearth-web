import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

export type Props = {
  label: string;
  linked?: boolean;
  overridden?: boolean;
  inactive?: boolean;
  focused?: boolean;
  selected?: boolean;
};

const Option = styled.li<Props>`
  display: flex;
  list-style: none;
  padding: 6px;
  font-size: ${fonts.sizes.xs}px;
  color: ${({ linked, overridden, selected, inactive, theme }) =>
    selected && linked && overridden
      ? theme.main.accent
      : selected && linked
      ? theme.main.accent
      : selected && overridden
      ? theme.main.danger
      : selected
      ? theme.properties.contentsText
      : linked && overridden
      ? theme.main.danger
      : overridden
      ? theme.main.accent
      : inactive
      ? theme.selectList.border
      : theme.properties.contentsText};
  background: ${({ focused, theme }) =>
    focused ? theme.colors.dark.bg[4] : theme.colors.dark.bg[2]};
  cursor: pointer;
`;

export default Option;
