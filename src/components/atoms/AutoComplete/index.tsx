import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";
import { useMergeRefs } from "use-callback-ref";

import { css, metrics, metricsSizes, styled, useTheme } from "@reearth/theme";

import Icon from "../Icon";
import { Option, OptionCheck, OptionIcon } from "../SelectOption";

export type Item<Value extends string | number = string> = {
  value: Value;
  label: string;
  icon?: string;
};

export type Props<Value extends string | number> = {
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
  items?: Item<Value>[];
  fullWidth?: boolean;
  creatable?: boolean;
  onCreate?: (value: string) => void;
  // onFilter?: (filterText: string) => void;
  onSelect?: (value: Value) => void;
};

const forwardRef = <Value extends string | number>(
  render: (props: Props<Value>, ref: React.Ref<HTMLDivElement>) => React.ReactElement | null,
): typeof AutoComplete => React.forwardRef(render) as any;

function AutoComplete<Value extends string | number>({
  className,
  ref,
  items,
  fullWidth = false,
  // onFilter,
  creatable = false,
  onCreate,
  onSelect,
}: Props<Value>): JSX.Element | null {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  // const [focusedValue, setFocusedValue] = useState(selectedValue);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergeRefs(ref ? [ref, wrapperRef] : [wrapperRef]);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    styles,
    attributes,
    update: updatePopper,
  } = usePopper(wrapperRef.current, listRef.current, {
    placement: "bottom",
    modifiers: [
      {
        name: "flip",
        enabled: true,
        options: {
          fallbackPlacements: ["top"],
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, 4],
        },
      },
      {
        name: "eventListeners",
        enabled: !open,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });
  const theme = useTheme();
  const [filterText, setFilterText] = useState("");
  const [selectedOption, selectOption] = useState("");
  const [itemState, setItems] = useState<Item<Value>[]>(items ?? []);

  useEffect(() => {
    setItems(items?.filter(i => i.label.includes(filterText)) ?? []);
  }, [filterText, items]);

  const openList = useCallback(() => {
    setOpen(true);
    listRef.current?.focus();
    updatePopper?.();
  }, [updatePopper]);

  const closeList = useCallback(() => {
    setOpen(false);
    // setFocusedValue(selectedValue);
    updatePopper?.();
  }, [setOpen, updatePopper]);

  const toggleList = useCallback(() => {
    if (open) {
      closeList();
    } else {
      openList();
    }
  }, [open, openList, closeList]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const validKeys = [
        " ",
        "ArrowUp",
        "ArrowDown",
        // The native select doesn't respond to enter on macOS, but it's recommended by
        // https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
        // "Enter",
      ];

      if (validKeys.indexOf(e.key) !== -1) {
        e.preventDefault();
        openList();
      }
    },
    [openList],
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const { key } = e;

      if (key === "Enter") {
        e.stopPropagation();

        return closeList();
      }

      if (key === "Tab" || key === "Escape") {
        e.preventDefault();
        return closeList();
      }

      // if (key === "ArrowDown") {
      //   const nextValue = values[Math.min(values.length - 1, index + 1)];

      //   // Prevent scroll of the page
      //   e.preventDefault();
      //   return setFocusedValue(nextValue);
      // }

      // if (key === "ArrowUp") {
      //   const previousValue = values[Math.max(0, index - 1)];

      //   e.preventDefault();
      //   return setFocusedValue(previousValue);
      // }
    },
    [closeList],
  );

  const handleListItemClick = useCallback(
    (value: Value) => {
      // e.stopPropagation();
      onSelect?.(value);
      closeList();
    },
    [onSelect, closeList],
  );

  // const handleListItemMouseEnter = useCallback(
  //   (value: Value, onMouseEnter: OptionProps<Value>["onMouseEnter"]) => (e: React.MouseEvent) => {
  //     setFocusedValue(value);
  //     onMouseEnter?.(e);
  //   },
  //   [setFocusedValue],
  // );
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterText?.(e.currentTarget.value);
    },
    [setFilterText],
  );

  useLayoutEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  });

  useClickAway(mergedRef, closeList);

  return (
    // <Wrapper ref={mergedRef} onClick={toggleList} onKeyDown={handleKeyDown} className={className}>
    //   <StyledTextBox value={filterText} onChange={handleInputChange} />
    //   {!!itemState?.length && (
    //     <OptionList
    //       ref={listRef}
    //       open={open}
    //       fullWidth={fullWidth}
    //       onKeyDown={handleListKeyDown}
    //       tabIndex={0}
    //       style={styles.popper}
    //       {...attributes.popper}>
    //       {itemState?.map(i => {
    //         return (
    //           <Option
    //             key={i.value}
    //             value={i.value}
    //             label={i.label}
    //             onClick={() => handleListItemClick(i.value)}>
    //             <OptionCheck size="xs">
    //               {i.value === selectedOption && <Icon icon="check" size={12} />}
    //             </OptionCheck>
    //             <OptionIcon size="xs">{i.icon && <Icon icon={i.icon} />}</OptionIcon>
    //             {i.label}
    //           </Option>
    //         );
    //       })}
    //     </OptionList>
    //   )}
    // </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

const OptionList = styled.ul<{ fullWidth: boolean; open: boolean }>`
  ${({ open }) =>
    !open &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  ${({ fullWidth }) =>
    fullWidth
      ? css`
          width: 100%;
        `
      : css`
          min-width: 200px;
        `};
  margin: 0;
  padding: 0;
  border: solid 1px ${props => props.theme.properties.border};
  border-radius: 3px;
  background: ${({ theme }) => theme.selectList.option.bg};
  box-sizing: border-box;
  overflow: hidden;
  z-index: ${props => props.theme.zIndexes.dropDown};

  &:focus {
    outline: none;
  }
`;

const StyledTextBox = styled.input`
  outline: none;
  width: 100%;
  border: none;
  background-color: ${({ theme }) => theme.properties.bg};
  padding-left: ${metricsSizes.xs}px;
  padding-right: ${metricsSizes.xs}px;
  height: ${metrics.propertyTextInputHeight}px;
  caret-color: ${({ theme }) => theme.main.text};
`;

export default forwardRef(AutoComplete);
