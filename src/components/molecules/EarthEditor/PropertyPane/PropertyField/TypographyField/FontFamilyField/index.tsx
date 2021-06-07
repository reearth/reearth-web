import React from "react";
import { useIntl } from "react-intl";
import { styled } from "@reearth/theme";

import Select from "@reearth/components/atoms/Select";
import Icon from "@reearth/components/atoms/Icon";
import Option, { Props as OptionProps } from "@reearth/components/atoms/SelectOption";
import Text from "@reearth/components/atoms/Text";

const safeFonts = {
  Arial: { displayName: "Arial" } as const,
  "Comic Sans MS": { displayName: "Comic Sans MS" } as const,
  "Courier New": { displayName: "Courier New" } as const,
  Georgia: { displayName: "Georgia" } as const,
  Tahoma: { displayName: "Tahoma" } as const,
  "Times New Roman": { displayName: "Times New Roman" } as const,
  "Trebuchet MS": { displayName: "Trebuchet MS" } as const,
  Verdana: { displayName: "Verdana" } as const,
  YuGothic: { displayName: "游ゴシック" } as const,
};

export type SafeFontFamilies = keyof typeof safeFonts;

const safeFontItems = Object.entries(safeFonts).map(([name, { displayName }]) => ({
  key: name as SafeFontFamilies,
  label: displayName,
}));

type Props = {
  className?: string;
  value?: SafeFontFamilies;
  linked?: boolean;
  overridden?: boolean;
  disabled?: boolean;
  onChange?: (value: SafeFontFamilies) => void;
};

const FontFamilyField: React.FC<Props> = ({
  className,
  value: selectedKey,
  linked,
  overridden,
  disabled,
  onChange,
}) => {
  const intl = useIntl();
  const inactive = !!linked || !!overridden || !!disabled;

  return (
    <Select
      className={className}
      value={selectedKey}
      inactive={inactive}
      onChange={onChange}
      placeholder={intl.formatMessage({ defaultMessage: "Font family" })}>
      {safeFontItems.map(({ key, label }) => (
        <StyledOption
          key={key}
          linked={linked}
          overridden={overridden}
          fontFamily={key}
          value={key}
          label={label}>
          <OptionCheck size="xs">
            {key === selectedKey && <Icon icon="check" size={10} />}
          </OptionCheck>
          {label}
        </StyledOption>
      ))}
    </Select>
  );
};

const StyledOption = styled(Option)<OptionProps & { fontFamily: SafeFontFamilies }>`
  font-family: ${({ fontFamily }) => fontFamily};
`;

const OptionCheck = styled(Text)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  margin-right: 6px;
`;

export default FontFamilyField;
