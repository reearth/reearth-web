import React from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  mode?: "widgets" | "widget";
  checked?: boolean;
  onChange?: () => Promise<void> | void | undefined;
};

const WidgetToggleButton: React.FC<Props> = ({ mode, checked, onChange }) => {
  const intl = useIntl();
  return (
    <ToggleWrapper>
      <Text size="xs" otherProperties={{ userSelect: "none" }}>
        {mode === "widgets"
          ? intl.formatMessage({ defaultMessage: "Enable Editor Mode" })
          : intl.formatMessage({ defaultMessage: "Enable" })}
      </Text>
      <ToggleButton checked={checked} onChange={onChange} />
    </ToggleWrapper>
  );
};

const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px 16px 0 16px;
  justify-content: space-between;
`;

export default WidgetToggleButton;
