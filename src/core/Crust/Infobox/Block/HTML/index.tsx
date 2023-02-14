import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import { CommonProps as BlockProps } from "..";
import { Border } from "../utils";

export type Props = BlockProps<Property>;

export type Property = {
  html?: string;
  title?: string;
};

const EventTypes = {
  mount: "mount",
} as const;

type MessageEventData = { type: typeof EventTypes.mount; height: number };

const HTMLBlock: React.FC<Props> = ({ block, isSelected, isEditable, onChange, onClick }) => {
  const t = useT();
  const theme = useTheme();
  const { html, title } = block?.property ?? {};

  const ref = useRef<HTMLTextAreaElement>(null);
  const isDirty = useRef(false);
  const [editingText, setEditingText] = useState<string | undefined>();
  const isEditing = typeof editingText === "string";
  const isTemplate = !html && !title && !isEditing;

  // iframe
  const [frameRef, setFrameRef] = useState<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(15);
  const initialScript = `
window.addEventListener('load', () => {
  // Initialize styles
  window.document.body.style.color = "${theme.main.text}";
  window.document.body.style.margin = "0";

  const rect = window.document.body.getBoundingClientRect();
  parent.postMessage({
    type: "${EventTypes.mount}",
    height: rect.top + rect.height + rect.bottom,
  });
});
`;
  const initializeIframe = useCallback(() => {
    const frameDocument = frameRef?.contentDocument;
    if (!frameDocument) {
      return;
    }

    const initialScriptTag = frameDocument?.createElement("script");
    initialScriptTag.innerHTML = initialScript;

    frameDocument.head.appendChild(initialScriptTag);
  }, [frameRef, initialScript]);

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    setEditingText(html ?? "");
  }, [isEditable, html]);

  const finishEditing = useCallback(() => {
    if (!isEditing) return;
    if (onChange && isDirty.current) {
      onChange("default", "html", editingText ?? "", "string");
    }
    isDirty.current = false;
    setEditingText(undefined);
  }, [editingText, onChange, isEditing]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditingText(e.currentTarget.value);
      isDirty.current = true;
    },
    [],
  );

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  const isSelectedPrev = useRef(false);
  useEffect(() => {
    if (isEditing && !isSelected && isSelectedPrev.current) {
      finishEditing();
    }
  }, [finishEditing, isSelected, isEditing]);
  useEffect(() => {
    isSelectedPrev.current = !!isSelected;
  }, [isSelected]);

  const [isHovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (isEditing) return;
      onClick?.();
    },
    [isEditing, onClick],
  );

  useLayoutEffect(() => initializeIframe(), [initializeIframe]);

  useEffect(() => {
    const handleMessage = (e: any) => {
      const data: MessageEventData = e.data;
      if (data.type === "mount") {
        setHeight(data.height);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      isSelected={isSelected}
      isHovered={isHovered}
      isEditable={isEditable}
      isTemplate={isTemplate}>
      {isTemplate && isEditable && !isEditing ? (
        <Template onDoubleClick={startEditing}>
          {/* FIXME(@keiya01): Use HTML icon */}
          <StyledIcon icon="text" isSelected={isSelected} isHovered={isHovered} size={24} />
          <Text isSelected={isSelected} isHovered={isHovered}>
            {t("Double click here to write.")}
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
              minHeight={height}
            />
          ) : (
            <IFrame
              key={html}
              ref={setFrameRef}
              onDoubleClick={startEditing}
              srcDoc={html}
              $height={height}
              allowFullScreen
            />
          )}
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled(Border)<{
  isTemplate: boolean;
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

const IFrame = styled.iframe<{ $height: number }>`
  border: none;
  padding: 5px;
  height: ${({ $height }) => $height}px;
  min-height: ${({ $height }) => $height}px;
`;

const InputField = styled.textarea<{ minHeight: number }>`
  display: block;
  width: 100%;
  min-height: ${({ minHeight }) => minHeight}px;
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
    isHovered ? theme.infoBox.border : isSelected ? theme.main.select : theme.infoBox.weakText};
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${({ isSelected, isHovered, theme }) =>
    isHovered ? theme.infoBox.border : isSelected ? theme.main.select : theme.infoBox.weakText};
`;

export default HTMLBlock;
