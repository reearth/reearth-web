import React, { useState, useCallback, useMemo } from "react";
import { ScreenSpaceEvent, ScreenSpaceEventHandler } from "resium";
import { ScreenSpaceEventType } from "cesium";
import { groupBy } from "lodash-es";

import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import { Props as WidgetProps } from "../../Widget";
import { useVisualizerContext } from "../../context";
import MenuButton, {
  Button as ButtonType,
  Position as PositionType,
  MenuItem as MenuItemType,
} from "./MenuButton";

export type Props = WidgetProps<Property>;
export type Position = PositionType;
export type Button = ButtonType;
export type MenuItem = MenuItemType;
export type Property = {
  buttons?: Button[];
  menu?: MenuItem[];
};

const pos: Position[] = ["topleft", "topright", "bottomleft", "bottomright"];

const Menu = ({ widget }: Props): JSX.Element => {
  const ctx = useVisualizerContext();
  const { buttons, menu: menuItems } = (widget?.property as Property | undefined) ?? {};
  const buttonsByPosition = useMemo(
    () => groupBy(buttons, v => v.buttonPosition) as { [p in Position]: Button[] },
    [buttons],
  );
  const [visibleMenuButton, setVisibleMenuButton] = useState<string>();

  const flyTo = ctx?.engine?.flyTo;
  const handleClick = useCallback(
    (b: Button | MenuItem) => () => {
      const t = "buttonType" in b ? b.buttonType : "menuType" in b ? b.menuType : undefined;
      if (t === "menu") {
        setVisibleMenuButton(v => (v === b.id ? undefined : b.id));
        return;
      } else if (t === "camera") {
        const camera =
          "buttonCamera" in b ? b.buttonCamera : "menuCamera" in b ? b.menuCamera : undefined;
        if (camera) {
          flyTo?.(camera, { duration: 2000 });
        }
      } else {
        let link = "buttonLink" in b ? b.buttonLink : "menuLink" in b ? b.menuLink : undefined;
        const splitLink = link?.split("/");
        if (splitLink?.[0] !== "http:" && splitLink?.[0] !== "https:") {
          link = "https://" + link;
        }
        window.open(link, "_blank", "noopener");
      }
      setVisibleMenuButton(undefined);
    },
    [flyTo],
  );

  const closeMenu = useCallback(() => {
    setVisibleMenuButton(undefined);
  }, []);

  return (
    <>
      <ScreenSpaceEventHandler>
        <ScreenSpaceEvent
          type={ScreenSpaceEventType.LEFT_CLICK}
          action={() => setVisibleMenuButton(undefined)}
        />
      </ScreenSpaceEventHandler>
      {pos.map(p => (
        <Wrapper key={p} position={p}>
          {buttonsByPosition?.[p]?.map(b =>
            !b.buttonInvisible ? (
              <div style={{ position: "relative" }}>
                <MenuButton
                  key={b.id}
                  button={b}
                  pos={p}
                  menuVisible={visibleMenuButton === b.id}
                  menuItems={menuItems}
                  itemOnClick={handleClick}
                  onClick={handleClick(b)}
                  onClose={closeMenu}
                />
              </div>
            ) : null,
          )}
        </Wrapper>
      ))}
    </>
  );
};

const Wrapper = styled.div<{ position?: "topleft" | "topright" | "bottomleft" | "bottomright" }>`
  position: absolute;
  top: ${({ position }) => (position === "topleft" || position === "topright" ? "0" : null)};
  bottom: ${({ position }) =>
    position === "bottomleft" || position === "bottomright" ? "0" : null};
  left: ${({ position }) => (position === "topleft" || position === "bottomleft" ? "0" : null)};
  right: ${({ position }) => (position === "topright" || position === "bottomright" ? "0" : null)};
  padding: 5px;
  display: flex;
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

export default Menu;
