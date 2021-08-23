import { useEffect, useState } from "react";
import { dark } from "./publishTheme/darkTheme";
import { forest } from "./publishTheme/forestTheme";
import { light } from "./publishTheme/lightTheme";
import { PublishTheme } from "./publishTheme/publishTheme";
import darkTheme from "./darkTheme";
import lightTheme from "./lightheme";
import { Theme } from "@reearth/gql";

export type ReTheme = {
  reThemeMode: "preMadeTheme" | "customTheme";
  preMadeThemeId: "reEarthLight" | "reEarthDark" | "forest";
  textColor: string;
  selectColor: string;
  backgroundColor: string;
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
    let publishedTheme: PublishTheme = dark;
    if (seneThemeOptions?.reThemeMode === "preMadeTheme") {
      publishedTheme = dark;
      if (seneThemeOptions?.preMadeThemeId === "reEarthLight") publishedTheme = light;
      if (seneThemeOptions?.preMadeThemeId === "forest") publishedTheme = forest;
    } else if (seneThemeOptions?.reThemeMode === "customTheme") {
      seneThemeOptions = {
        ...seneThemeOptions,
        backgroundColor: seneThemeOptions.backgroundColor || "#dfe5f0",
        textColor: seneThemeOptions.textColor || "#434343",
        selectColor: seneThemeOptions.selectColor || "#C52C63",
      };
      if (isDark(seneThemeOptions.backgroundColor)) {
        publishedTheme = {
          mask: "#FFFFFF0D",
          background: seneThemeOptions.backgroundColor,
          mainText: seneThemeOptions.textColor,
          select: seneThemeOptions.selectColor,
          strongIcon: `lighten(.25, ${seneThemeOptions.textColor})`,
          strongText: `lighten(.25, ${seneThemeOptions.textColor})`,
          weakText: addAlpha(seneThemeOptions.textColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.textColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.textColor, 0.25),
        };
      } else {
        publishedTheme = {
          mask: "#0000001A",
          background: seneThemeOptions.backgroundColor,
          mainText: seneThemeOptions.textColor,
          select: seneThemeOptions.selectColor,
          strongIcon: "#FFFFFF",
          strongText: "#FFFFFF",
          weakText: addAlpha(seneThemeOptions.textColor, 0.5),
          mainIcon: addAlpha(seneThemeOptions.textColor, 0.5),
          weakIcon: addAlpha(seneThemeOptions.textColor, 0.25),
        };
      }
    }

    setTheme({ ...theme, published: publishedTheme });
  }, [seneThemeOptions]);

  return { theme };
};
