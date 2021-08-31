import { useEffect, useState } from "react";
import tinycolor from "tinycolor2";
import { dark } from "./darkTheme";
import { forest } from "./forestTheme";
import { light } from "./lightTheme";
import { PublishTheme } from "./publishTheme";

export type SceneThemeOptions = {
  themeType?: "light" | "dark" | "forest" | "custom";
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};

export default (sceneThemeOptions?: SceneThemeOptions) => {
  const [publishedTheme, setPublishedTheme] = useState<PublishTheme>(dark);

  const isDark = (hex: string): boolean => tinycolor(hex).isDark();
  sceneThemeOptions = {
    ...sceneThemeOptions,
    themeBackgroundColor: sceneThemeOptions?.themeBackgroundColor || "#dfe5f0",
    themeTextColor: sceneThemeOptions?.themeTextColor || "#434343",
    themeSelectColor: sceneThemeOptions?.themeSelectColor || "#C52C63",
  };
  const tinyThemeTextColor = tinycolor(sceneThemeOptions.themeTextColor);
  useEffect(() => {
    switch (sceneThemeOptions?.themeType) {
      case "light":
        setPublishedTheme(light);
        break;
      case "forest":
        setPublishedTheme(forest);
        break;
      case "custom":
        sceneThemeOptions.themeBackgroundColor =
          sceneThemeOptions?.themeBackgroundColor || "#dfe5f0";
        sceneThemeOptions.themeTextColor = sceneThemeOptions?.themeTextColor || "#434343";
        sceneThemeOptions.themeSelectColor = sceneThemeOptions?.themeSelectColor || "#C52C63";
        setPublishedTheme({
          mask: isDark(sceneThemeOptions?.themeBackgroundColor) ? "#FFFFFF0D" : "#0000001A",
          background: sceneThemeOptions.themeBackgroundColor,
          mainText: sceneThemeOptions.themeTextColor,
          select: sceneThemeOptions.themeSelectColor,
          strongIcon: isDark(sceneThemeOptions?.themeBackgroundColor)
            ? tinyThemeTextColor.lighten(25).toHex8String()
            : "#FFFFFF",
          strongText: isDark(sceneThemeOptions?.themeBackgroundColor)
            ? tinyThemeTextColor.lighten(25).toHex8String()
            : "#FFFFFF",
          weakText: tinyThemeTextColor.setAlpha(0.5).toHex8String(),
          mainIcon: tinyThemeTextColor.setAlpha(0.5).toHex8String(),
          weakIcon: tinyThemeTextColor.setAlpha(0.25).toHex8String(),
        });
        break;
      default:
        setPublishedTheme(dark);
    }
  }, [sceneThemeOptions]);

  return { publishedTheme };
};
