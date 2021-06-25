import React, { useState, useEffect, useRef, useCallback } from "react";
import { useIntl } from "react-intl";
import nl2br from "react-nl2br";

import Icon from "@reearth/components/atoms/Icon";
import Markdown from "@reearth/components/atoms/Markdown";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { Typography, typographyStyles } from "@reearth/util/value";

import { Props as BlockProps } from "..";

export type Props = BlockProps<Property>;

export type Property = {
  default?: {
    text?: string;
    title?: string;
    markdown?: boolean;
    typography?: Typography;
  };
};

const TextBlock: React.FC<Props> = ({
  block,
  infoboxProperty,
  isSelected,
  isHovered,
  isEditable,
  onChange,
  onClick,
}) => {
  const intl = useIntl();
  const theme = useTheme();
  const { text, title, markdown, typography } = block?.property?.default ?? {};
  const { bgcolor: bg } = infoboxProperty?.default ?? {};

  const ref = useRef<HTMLTextAreaElement>(null);
  const isDirty = useRef(false);
  const [editingText, setEditingText] = useState<string | undefined>();
  const isEditing = typeof editingText === "string";
  const isTemplate = !text && !title && !isEditing;

  const startEditing = useCallback(() => {
    if (!isSelected || !isEditable) return;
    setEditingText(text);
  }, [isEditable, isSelected, text]);

  const finishEditing = useCallback(() => {
    if (onChange && isDirty.current) {
      onChange("default", "text", editingText ?? "", "string");
    }
    isDirty.current = false;
    setEditingText(undefined);
  }, [editingText, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditingText(e.currentTarget.value);
      isDirty.current = true;
    },
    [],
  );

  useEffect(() => {
    isDirty.current = false;
    setEditingText(undefined);
  }, [text, isEditable, isSelected]);

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && !isSelected) {
      finishEditing();
    }
  }, [finishEditing, isSelected, isEditing]);

  return (
    <Wrapper
      onClick={onClick}
      isSelected={isSelected}
      isHovered={isHovered}
      isTemplate={isTemplate}
      isEditable={isEditable}>
      {isTemplate && isEditable ? (
        <Template onDoubleClick={startEditing}>
          <StyledIcon icon="text" isHovered={isHovered} isSelected={isSelected} size={24} />
          <Text isSelected={isSelected} isHovered={isHovered}>
            {intl.formatMessage({ defaultMessage: "Double click here to write." })}
          </Text>
        </Template>
      ) : (
        <>
          {title && <Title>{title}</Title>}
          {isEditing ? (
            <InputField
              ref={ref}
              value={editingText ?? ""}
              onChange={handleChange}
              onBlur={finishEditing}
              rows={10}
            />
          ) : markdown ? (
            <Markdown
              styles={typography}
              backgroundColor={bg || theme.infoBox.bg}
              onDoubleClick={startEditing}>
              {text}
            </Markdown>
          ) : (
            <Field styles={typography} onDoubleClick={startEditing}>
              {nl2br(text ?? "")}
            </Field>
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
}>`
  margin: 0 8px;
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
      (!isTemplate && !isHovered && !isSelected) || !isEditable
        ? "transparent"
        : isHovered
        ? theme.infoBox.border
        : isSelected
        ? theme.infoBox.accent2
        : theme.infoBox.weakText};
  border-radius: 6px;
`;

const Title = styled.div`
  font-size: 12px;
`;

const Field = styled.div<{ styles?: Typography }>`
  ${({ styles }) => typographyStyles(styles)}
  padding: 5px;
  min-height: 15px;
`;

const InputField = styled.textarea`
  display: block;
  width: 100%;
  min-height: 15px;
  height: 185px;
  resize: none;
  box-sizing: border-box;
  background-color: transparent;
  color: ${props => props.theme.infoBox.mainText};
  font-size: ${fonts.sizes.s}px;
  outline: none;
  border: none;
  padding: 4px;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 185px;
  margin: 0 auto;
  user-select: none;
`;

const Text = styled.p<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${({ isSelected, isHovered, theme }) =>
    isHovered ? theme.infoBox.border : isSelected ? theme.infoBox.accent2 : theme.infoBox.weakText};
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default TextBlock;
