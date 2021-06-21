import React, { useRef } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import { Camera } from "@reearth/util/value";
import { fonts, styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";

export type Position = "topleft" | "topright" | "bottomleft" | "bottomright";

export type Button = {
  id: string;
  buttonInvisible?: boolean;
  buttonType?: "menu" | "link" | "camera";
  buttonTitle?: string;
  buttonPosition?: Position;
  buttonStyle?: "text" | "icon" | "texticon";
  buttonIcon?: string;
  buttonLink?: string;
  buttonColor?: string;
  buttonBgcolor?: string;
  buttonCamera?: Camera;
};

export type MenuItem = {
  id: string;
  menuTitle?: string;
  menuIcon?: string;
  menuType?: "link" | "camera" | "border";
  menuLink?: string;
  menuCamera?: Camera;
};

export type Props = {
  button: Button;
  menuVisible?: boolean;
  menuItems?: MenuItem[];
  itemOnClick?: (b: Button | MenuItem) => () => void;
  pos: Position;
  onClick?: () => void;
  onClose?: () => void;
};

export default function ({
  button: b,
  menuVisible,
  menuItems,
  itemOnClick,
  pos,
  onClick,
  onClose,
}: Props): JSX.Element {
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const menuElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement:
      pos === "topleft"
        ? "bottom-start"
        : pos === "topright"
        ? "bottom-end"
        : pos === "bottomleft"
        ? "top-start"
        : "top-end",
    strategy: "fixed",
    modifiers: [
      {
        name: "eventListeners",
        enabled: !menuVisible,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useClickAway(menuElement, onClose ?? (() => {}));

  return (
    <>
      <Button tabIndex={0} button={b} onClick={onClick} ref={referenceElement}>
        {b.buttonIcon && (
          <StyledIcon
            icon={b.buttonIcon}
            size={20}
            margin={b.buttonStyle !== "icon" && !!b.buttonTitle}
          />
        )}
        {b.buttonStyle !== "icon" && b.buttonTitle}
      </Button>
      <div
        ref={popperElement}
        style={{ ...styles.popper, display: menuVisible ? styles.popper.display : "none" }}
        {...attributes}>
        {menuVisible && (
          <MenuWrapper ref={menuElement}>
            {menuItems?.map(i => (
              <MenuItem tabIndex={0} key={i.id} item={i} onClick={itemOnClick?.(i)}>
                {i.menuType !== "border" && i.menuTitle}
              </MenuItem>
            ))}
          </MenuWrapper>
        )}
      </div>
    </>
  );
}

const StyledIcon = styled(Icon)<{ margin: boolean }>`
  vertical-align: middle;
  margin-right: ${({ margin }) => (margin ? "5px" : null)};
`;

const MenuWrapper = styled.div<{ visible?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  background-color: #2b2a2f;
`;

const MenuItem = styled.a<{ item?: MenuItem }>`
  display: block;
  font-size: ${fonts.sizes.xs}px;
  margin: ${({ item }) => (item?.menuType === "border" ? "0 5px" : null)};
  padding: ${({ item }) => (item?.menuType === "border" ? null : "5px 20px")};
  cursor: ${({ item }) => (item?.menuType === "border" ? null : "pointer")};
  border-top: ${({ item }) => (item?.menuType === "border" ? "1px solid #fff" : null)};
  opacity: ${({ item }) => (item?.menuType === "border" ? "0.5" : null)};
`;

const Button = styled.div<{ button?: Button }>`
  display: block;
  border-radius: 3px;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  font-size: ${fonts.sizes["2xs"]}px;
  line-height: 32px;
  box-sizing: border-box;
  background-color: ${({ button }) => button?.buttonBgcolor || "#2B2A2F"};
  color: ${({ button }) => button?.buttonColor || "#fff"};
  cursor: pointer;
  margin-left: 5px;
  user-select: none;

  &:first-of-type {
    margin-left: 0;
  }
`;
