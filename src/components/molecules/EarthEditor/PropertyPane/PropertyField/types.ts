import { colors } from "@reearth/theme";

export type FieldProps<T> = {
  value?: T;
  onChange?: (value: T | null) => void;
  name?: string;
  description?: string;
  linked?: boolean;
  overridden?: boolean;
  disabled?: boolean;
};

export const textColor = ({
  disabled,
  linked,
  overridden,
}: {
  disabled?: boolean;
  linked?: boolean;
  overridden?: boolean;
}) =>
  linked
    ? colors.dark.primary.main
    : overridden
    ? colors.dark.danger.main
    : disabled
    ? colors.dark.outline.main
    : undefined;
