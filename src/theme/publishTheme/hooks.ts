import { useEffect, useState } from "react";
import { dark } from "./darkTheme";
import { forest } from "./forestTheme";
import { light } from "./lightTheme";
import { PublishTheme } from "./publishTheme";

export type ReTheme = {
  themeType?: "light" | "dark" | "forest" | "custom";
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};

export default (seneThemeOptions?: ReTheme) => {
  const [publishedTheme, setPublishedTheme] = useState<PublishTheme>(dark);
  function addAlpha(color?: string, opacity?: number): string {
    // coerce values so it is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  function isDark(color: string) {
    const c = color.substring(1); // strip # from hex
    const rgb = parseInt(c, 16); // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff; // extract red
    const g = (rgb >> 8) & 0xff; // extract green
    const b = (rgb >> 0) & 0xff; // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma < 50;
  }

  useEffect(() => {
    if (!seneThemeOptions?.themeType || seneThemeOptions?.themeType === "dark")
      setPublishedTheme(dark);
    if (seneThemeOptions?.themeType === "light") setPublishedTheme(light);
    if (seneThemeOptions?.themeType === "forest") setPublishedTheme(forest);
    if (seneThemeOptions?.themeType === "custom") {
      seneThemeOptions.themeBackgroundColor = seneThemeOptions?.themeBackgroundColor || "#dfe5f0";
      seneThemeOptions.themeTextColor = seneThemeOptions?.themeTextColor || "#434343";
      seneThemeOptions.themeSelectColor = seneThemeOptions?.themeSelectColor || "#C52C63";
      if (isDark(seneThemeOptions?.themeBackgroundColor)) {
        setPublishedTheme({
          mask: "#FFFFFF0D",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: `lighten(.25, ${seneThemeOptions.themeTextColor})`,
          strongText: `lighten(.25, ${seneThemeOptions.themeTextColor})`,
          weakText: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.themeTextColor, 0.25),
        });
      } else {
        setPublishedTheme({
          mask: "#0000001A",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: "#FFFFFF",
          strongText: "#FFFFFF",
          weakText: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.themeTextColor, 0.25),
        });
      }
    }
  }, [seneThemeOptions]);

  return { publishedTheme };
};
