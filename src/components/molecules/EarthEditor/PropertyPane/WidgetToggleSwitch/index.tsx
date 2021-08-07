import React from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  mode?: "widgets" | "widget";
  checked?: boolean;
  onChange?: () => Promise<void> | undefined;
  editorMode?: boolean;
  setEditorMode?: (on: boolean) => void;
};

const WidgetToggleButton: React.FC<Props> = ({
  mode,
  editorMode,
  setEditorMode,
  checked,
  onChange,
}) => {
  const intl = useIntl();
  return (
    <ToggleWrapper>
      <Text size="xs">
        {mode === "widgets"
          ? intl.formatMessage({ defaultMessage: "Enable Editor Mode" })
          : intl.formatMessage({ defaultMessage: "Enable" })}
      </Text>
      <ToggleButton
        checked={mode === "widgets" ? editorMode : checked}
        onChange={mode === "widgets" ? () => setEditorMode?.(!editorMode) : onChange}
      />
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
