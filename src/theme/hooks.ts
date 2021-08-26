import { useEffect, useState } from "react";
import { dark } from "./publishTheme/darkTheme";
import { forest } from "./publishTheme/forestTheme";
import { light } from "./publishTheme/lightTheme";
import { PublishTheme } from "./publishTheme/publishTheme";
import darkTheme from "./darkTheme";
import lightTheme from "./lightheme";
import { Theme } from "@reearth/gql";

export type ReTheme = {
  themeType: "light" | "dark" | "forest" | "custom";
  themeTextColor: string;
  themeSelectColor: string;
  themeBackgroundColor: string;
};

export default (seneThemeOptions: ReTheme, data?: any) => {
  const [theme, setTheme] = useState(
    data?.me?.theme === ("light" as Theme)
      ? { ...lightTheme, published: dark }
      : { ...darkTheme, published: dark },
  );

  function addAlpha(color: string, opacity: number): string {
    // coerce values so ti is between 0 and 1.
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }

  function isDark(color: string) {
    const c = color.substring(1); // strip #
    const rgb = parseInt(c, 16); // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff; // extract red
    const g = (rgb >> 8) & 0xff; // extract green
    const b = (rgb >> 0) & 0xff; // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma < 50;
  }

  useEffect(() => {
    seneThemeOptions = {
      ...seneThemeOptions,
      themeBackgroundColor: seneThemeOptions?.themeBackgroundColor || "#dfe5f0",
      themeTextColor: seneThemeOptions?.themeTextColor || "#434343",
      themeSelectColor: seneThemeOptions?.themeSelectColor || "#C52C63",
    };
    let publishedTheme: PublishTheme = dark;
    if (seneThemeOptions?.themeType === "light") publishedTheme = light;
    if (seneThemeOptions?.themeType === "forest") publishedTheme = forest;
    if (seneThemeOptions?.themeType === "custom") {
      if (isDark(seneThemeOptions.themeBackgroundColor)) {
        publishedTheme = {
          mask: "#FFFFFF0D",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: `lighten(.25, ${seneThemeOptions.themeTextColor})`,
          strongText: `lighten(.25, ${seneThemeOptions.themeTextColor})`,
          weakText: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.themeTextColor, 0.25),
        };
      } else {
        publishedTheme = {
          mask: "#0000001A",
          background: seneThemeOptions.themeBackgroundColor,
          mainText: seneThemeOptions.themeTextColor,
          select: seneThemeOptions.themeSelectColor,
          strongIcon: "#FFFFFF",
          strongText: "#FFFFFF",
          weakText: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.themeTextColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.themeTextColor, 0.25),
        };
      }
    }

    setTheme({ ...theme, published: publishedTheme });
  }, [seneThemeOptions]);

  return { theme };
};
