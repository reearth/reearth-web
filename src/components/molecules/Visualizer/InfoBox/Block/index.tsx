import React, { useMemo, useState } from "react";

import { styled } from "@reearth/theme";
import { ValueTypes, ValueType } from "@reearth/util/value";
import Icon from "@reearth/components/atoms/Icon";
import InsertionBar from "@reearth/components/atoms/InsertionBar";

import type { CommonAPI } from "../..";
import PluginBlock, { Props as PluginBlockProps, Block as BlockType } from "../../Block";
import useHooks from "./hooks";

export type Block<P = any, PP = any> = BlockType<P, PP> & {
  id: string;
  plugin?: string;
  propertyId?: string;
  infoboxProperty?: any;
};

export type Props = {
  api?: CommonAPI;
  block?: Block;
  index?: number;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  insertionPopUpPosition?: "top" | "bottom";
  isInfoboxHovered?: boolean;
  dragDisabled?: boolean;
  infoboxProperty?: any;
  sceneProperty?: any;
  renderInsertionPopUp?: React.ReactNode;
  onChange?: <T extends ValueType>(
    propertyId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onDelete?: () => void;
  onInsert?: (pos: "top" | "bottom") => void;
  onMove?: (blockId: string, fromIndex: number, toIndex: number) => void;
  onSelect?: () => void;
};

const InfoboxBlock: React.FC<Props> = ({
  block,
  index,
  isEditable,
  isBuilt,
  isSelected,
  renderInsertionPopUp,
  insertionPopUpPosition,
  dragDisabled,
  infoboxProperty,
  sceneProperty,
  onChange,
  onMove,
  onSelect,
  onInsert,
}) => {
  const { dragRef, dropRef, isHovered, isDragging, previewRef } = useHooks({
    blockId: block?.id,
    index,
    onMove,
  });
  const [hover, setHover] = useState(false);
  const handleClick = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isEditable && !isBuilt) {
      e?.stopPropagation();
      onSelect?.();
    }
  };
  const handleChange = useMemo<PluginBlockProps["onChange"]>(
    () => (...args) => {
      if (!block?.propertyId) return;
      onChange?.(block.propertyId, ...args);
    },
    [block?.propertyId, onChange],
  );

  return !block ? null : (
    <Wrapper ref={dropRef}>
      <BlockWrapper
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        isDragging={isDragging}
        isEditable={isEditable && !isBuilt}
        isHovered={!!isEditable && !isBuilt && hover && !isSelected}
        isSelected={!!isEditable && !isBuilt && !!isSelected}
        ref={previewRef}>
        <PluginBlock
          block={block}
          isSelected={!!isEditable && !isBuilt && !!isSelected}
          isEditable={isEditable}
          isBuilt={isBuilt}
          isHovered={!!isEditable && !isBuilt && hover && !isSelected}
          infoboxProperty={infoboxProperty}
          sceneProperty={sceneProperty}
          onChange={handleChange}
          onClick={handleClick}
        />
        {isEditable && !isBuilt && !dragDisabled && hover && (
          <Handle
            ref={dragRef}
            isHovered={!!isEditable && !isBuilt && hover && !isSelected}
            isSelected={!!isEditable && !isBuilt && !!isSelected}>
            <Icon icon="arrowUpDown" size={24} />
          </Handle>
        )}
      </BlockWrapper>
      {!isBuilt && isEditable && (
        <>
          <InsertionBar
            mode={
              isEditable && isHovered === "top"
                ? "dragging"
                : isEditable && !isHovered && index === 0
                ? "visible"
                : "hidden"
            }
            pos="top"
            onButtonClick={() => onInsert?.("top")}>
            {insertionPopUpPosition === "top" && renderInsertionPopUp}
          </InsertionBar>
          <InsertionBar
            mode={
              isEditable && isHovered === "bottom"
                ? "dragging"
                : !isEditable || isHovered
                ? "hidden"
                : "visible"
            }
            pos="bottom"
            onButtonClick={() => onInsert?.("bottom")}>
            {insertionPopUpPosition === "bottom" && renderInsertionPopUp}
          </InsertionBar>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  margin: 0;
  padding: 10px 0;
  border-radius: 6px;
`;

type BlockWrapperProps = {
  isDragging?: boolean;
  isEditable?: boolean;
  isHovered: boolean;
  isSelected: boolean;
};

const BlockWrapper = styled.div<BlockWrapperProps>`
  position: relative;
  opacity: ${props => (props.isDragging ? "0.4" : "1")};
  cursor: ${props => (props.isEditable ? "pointer" : "")};
  box-sizing: border-box;
`;

const Handle = styled.div<{ isHovered: boolean; isSelected: boolean }>`
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  padding: 5px;
  margin: 3px 6px;
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : "none"};
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

export default InfoboxBlock;
